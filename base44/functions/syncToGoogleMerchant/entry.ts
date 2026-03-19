import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MERCHANT_API_BASE = 'https://shoppingcontent.googleapis.com/content/v2.1';

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);

  function b64url(str) {
    return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimSet = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/content',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }));

  const signingInput = `${header}.${claimSet}`;

  const pemKey = sa.private_key.replace(/\\n/g, '\n');
  const keyBody = pemKey.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const binaryKey = Uint8Array.from(atob(keyBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const enc = new TextEncoder();
  const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, enc.encode(signingInput));
  const signature = b64url(String.fromCharCode(...new Uint8Array(sigBuf)));

  const jwt = `${signingInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Token exchange failed: ' + JSON.stringify(tokenData));
  }
  return tokenData.access_token;
}

function buildMerchantProduct(product) {
  const allImages = (product.all_images || []).filter(img => img.selected).map(img => img.url);
  if (allImages.length === 0) {
    if (product.image_url) allImages.push(product.image_url);
    if (product.images) allImages.push(...product.images);
  }

  const size = (product.size || '').toLowerCase();
  let shippingPrice = '59.00';
  if (/2x|x2|3x|x3|4x/.test(size)) shippingPrice = '29.00';
  else if (/7x|8x|9x|x9|x10|x12/.test(size)) shippingPrice = '99.00';

  const desc = typeof product.description === 'string'
    ? product.description
    : (product.description?.description || product.name);

  const mp = {
    offerId: product.product_number || product.id,
    title: product.name,
    description: desc,
    link: `https://ruglyfloor.com/ProductDetail?id=${product.id}`,
    imageLink: allImages[0],
    contentLanguage: 'en',
    targetCountry: 'US',
    channel: 'online',
    availability: product.in_stock !== false ? 'in stock' : 'out of stock',
    condition: 'new',
    price: { value: String(product.price), currency: 'USD' },
    brand: 'Rugly',
    googleProductCategory: '604',
    identifierExists: false,
    shipping: [{ country: 'US', service: 'Ground Shipping', price: { value: shippingPrice, currency: 'USD' } }]
  };

  if (product.size) mp.sizes = [product.size];
  if (product.material) mp.material = product.material;
  if (product.product_number) mp.mpn = product.product_number;
  if (allImages.length > 1) mp.additionalImageLinks = allImages.slice(1, 10);

  return mp;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const merchantId = Deno.env.get('GOOGLE_MERCHANT_ID');
    if (!merchantId) return Response.json({ error: 'GOOGLE_MERCHANT_ID not set' }, { status: 500 });

    const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!saJson) return Response.json({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON not set' }, { status: 500 });

    const sa = JSON.parse(saJson);
    const accessToken = await getAccessToken(sa);

    const products = await base44.asServiceRole.entities.Product.filter({ category: 'original' });
    console.log(`[GoogleMerchant] ${products.length} products to sync`);

    const success = [];
    const failed = [];

    for (const product of products) {
      const allImages = (product.all_images || []).filter(img => img.selected).map(img => img.url);
      if (allImages.length === 0 && product.image_url) allImages.push(product.image_url);

      if (!allImages[0]) {
        console.warn(`[GoogleMerchant] Skip ${product.name} - no image`);
        failed.push({ name: product.name, reason: 'no image' });
        continue;
      }

      const mp = buildMerchantProduct(product);
      const offerId = encodeURIComponent(mp.offerId);

      const res = await fetch(`${MERCHANT_API_BASE}/${merchantId}/products/${offerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mp)
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[GoogleMerchant] ✓ ${product.name}`);
        success.push({ name: product.name });
      } else {
        console.error(`[GoogleMerchant] ✗ ${product.name}:`, JSON.stringify(data));
        failed.push({ name: product.name, reason: data.error?.message || JSON.stringify(data) });
      }
    }

    return Response.json({ synced: success.length, failed: failed.length, success, failed });

  } catch (error) {
    console.error('[GoogleMerchant] Fatal:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});