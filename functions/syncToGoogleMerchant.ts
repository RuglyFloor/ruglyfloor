import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Google Merchant Center Content API v2.1
const MERCHANT_API_BASE = 'https://shoppingcontent.googleapis.com/content/v2.1';

async function getGoogleAccessToken() {
  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!serviceAccountJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON secret not set');

  let sa;
  try {
    sa = JSON.parse(serviceAccountJson);
  } catch (e) {
    throw new Error(`Invalid GOOGLE_SERVICE_ACCOUNT_JSON: ${e.message}`);
  }
  const now = Math.floor(Date.now() / 1000);

  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payload = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/content',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const signingInput = `${header}.${payload}`;

  // Import the private key
  const pemKey = (sa.private_key || '').replace(/\\n/g, '\n');
  const keyData = pemKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signingInput)
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signingInput}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });

  const tokenText = await tokenRes.text();
  let tokenData;
  try { tokenData = JSON.parse(tokenText); } catch { tokenData = {}; }
  console.log('[GoogleMerchant] Token response status:', tokenRes.status, tokenText.slice(0, 500));
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${tokenText.slice(0, 500)}`);
  }
  return tokenData.access_token;
}

function buildMerchantProduct(product) {
  const allImages = product.all_images
    ? product.all_images.filter(img => img.selected).map(img => img.url)
    : [product.image_url, ...(product.images || [])].filter(Boolean);

  const mainImage = allImages[0];
  const additionalImages = allImages.slice(1, 10); // max 10 additional

  // Determine shipping based on size label
  const size = (product.size || '').toLowerCase();
  let shippingPrice = '59.00';
  if (size.includes('2x') || size.includes('3x') || size.includes('4x') || size.includes('x2') || size.includes('x3') || size.includes('4ft') || size.includes('round')) {
    shippingPrice = '29.00';
  } else if (size.includes('7x') || size.includes('8x') || size.includes('9x') || size.includes('x9') || size.includes('x10') || size.includes('x12')) {
    shippingPrice = '99.00';
  }

  const merchantProduct = {
    offerId: product.product_number || product.id,
    title: product.name,
    description: typeof product.description === 'string' ? product.description : (product.description?.description || product.name),
    link: `https://ruglyfloor.com/ProductDetail?id=${product.id}`,
    imageLink: mainImage,
    contentLanguage: 'en',
    targetCountry: 'US',
    channel: 'online',
    availability: product.in_stock !== false ? 'in stock' : 'out of stock',
    condition: 'new',
    price: {
      value: String(product.price),
      currency: 'USD'
    },
    brand: 'Rugly',
    productType: 'Home & Garden > Decor > Rugs',
    googleProductCategory: '604', // Rugs category ID
    shipping: [{
      country: 'US',
      service: 'Ground Shipping',
      price: {
        value: shippingPrice,
        currency: 'USD'
      }
    }],
    shippingWeight: {
      value: '10',
      unit: 'lb'
    }
  };

  if (product.size) {
    merchantProduct.sizes = [product.size];
  }

  if (product.material) {
    merchantProduct.material = product.material;
  }

  if (additionalImages.length > 0) {
    merchantProduct.additionalImageLinks = additionalImages;
  }

  // GTIN or MPN
  if (product.product_number) {
    merchantProduct.mpn = product.product_number;
    merchantProduct.identifierExists = false;
  } else {
    merchantProduct.identifierExists = false;
  }

  return merchantProduct;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const merchantId = Deno.env.get('GOOGLE_MERCHANT_ID');
    if (!merchantId) {
      return Response.json({ error: 'GOOGLE_MERCHANT_ID secret not set' }, { status: 500 });
    }

    // Fetch all in-stock original products
    const products = await base44.asServiceRole.entities.Product.filter({ category: 'original' });
    console.log(`[GoogleMerchant] Found ${products.length} products to sync`);

    const accessToken = await getGoogleAccessToken();

    const results = { success: [], failed: [] };

    for (const product of products) {
      const allImages = product.all_images
        ? product.all_images.filter(img => img.selected).map(img => img.url)
        : [product.image_url, ...(product.images || [])].filter(Boolean);

      if (!allImages[0]) {
        console.warn(`[GoogleMerchant] Skipping ${product.name} - no image`);
        results.failed.push({ id: product.id, name: product.name, reason: 'no image' });
        continue;
      }

      const merchantProduct = buildMerchantProduct(product);
      const offerId = encodeURIComponent(merchantProduct.offerId);

      const res = await fetch(`${MERCHANT_API_BASE}/${merchantId}/products/${offerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(merchantProduct)
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[GoogleMerchant] ✓ Synced: ${product.name}`);
        results.success.push({ id: product.id, name: product.name });
      } else {
        console.error(`[GoogleMerchant] ✗ Failed: ${product.name}`, JSON.stringify(data));
        results.failed.push({ id: product.id, name: product.name, reason: data.error?.message || JSON.stringify(data) });
      }
    }

    return Response.json({
      synced: results.success.length,
      failed: results.failed.length,
      results
    });

  } catch (error) {
    console.error('[GoogleMerchant] Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});