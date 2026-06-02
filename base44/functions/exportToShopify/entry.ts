import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id } = await req.json();

    const products = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!products || products.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    const shopDomain = (Deno.env.get('SHOPIFY_SHOP_DOMAIN') || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    const clientId = Deno.env.get('SHOPIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SHOPIFY_CLIENT_SECRET');

    if (!shopDomain || !clientId || !clientSecret) {
      return Response.json({
        error: 'Shopify credentials not configured',
        details: 'Set SHOPIFY_SHOP_DOMAIN, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET secrets'
      }, { status: 400 });
    }

    // Fetch a fresh access token using Client Credentials Grant (Dev Dashboard apps)
    const tokenRes = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Shopify token error:', tokenData);
      return Response.json({ error: 'Failed to get Shopify access token', details: tokenData }, { status: 401 });
    }
    const accessToken = tokenData.access_token;

    // Format product for Shopify
    const shopifyProduct = {
      product: {
        title: product.name,
        body_html: product.long_description || product.description || '',
        vendor: 'Rugly',
        product_type: 'Rug',
        tags: ['custom rug', 'hand painted', product.category].filter(Boolean).join(', '),
        images: (product.all_images || []).filter(img => img.selected !== false).map(img => ({
          src: img.url || img.original_url
        })),
        variants: [{
          sku: product.product_number,
          price: product.price.toString(),
          inventory_quantity: product.in_stock ? 1 : 0,
          inventory_management: 'shopify',
          weight: 3,
          weight_unit: 'lb'
        }],
        metafields: [
          { namespace: 'custom', key: 'material', value: product.material || '', type: 'single_line_text_field' },
          { namespace: 'custom', key: 'size', value: product.size || '', type: 'single_line_text_field' },
          { namespace: 'custom', key: 'care_instructions', value: product.care_instructions || '', type: 'multi_line_text_field' }
        ]
      }
    };

    // Check if product already exists on Shopify
    const existingListings = await base44.asServiceRole.entities.ChannelListing.filter({ product_id, channel: 'shopify' });

    let endpoint;
    let method;

    if (existingListings && existingListings.length > 0 && existingListings[0].channel_product_id) {
      const shopifyProductId = existingListings[0].channel_product_id;
      endpoint = `https://${shopDomain}/admin/api/2024-01/products/${shopifyProductId}.json`;
      method = 'PUT';
      shopifyProduct.product.id = shopifyProductId;
    } else {
      endpoint = `https://${shopDomain}/admin/api/2024-01/products.json`;
      method = 'POST';
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify(shopifyProduct)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Shopify export error:', result);
      if (existingListings && existingListings.length > 0) {
        await base44.asServiceRole.entities.ChannelListing.update(existingListings[0].id, {
          sync_status: 'failed',
          error_message: JSON.stringify(result.errors || result)
        });
      }
      return Response.json({ error: 'Shopify export failed', details: result }, { status: response.status });
    }

    const shopifyProductId = result.product.id;
    const listingUrl = `https://${shopDomain}/products/${result.product.handle}`;

    if (existingListings && existingListings.length > 0) {
      await base44.asServiceRole.entities.ChannelListing.update(existingListings[0].id, {
        channel_product_id: shopifyProductId.toString(),
        listing_url: listingUrl,
        sync_status: 'synced',
        status: 'active',
        last_synced_at: new Date().toISOString(),
        error_message: null
      });
    } else {
      await base44.asServiceRole.entities.ChannelListing.create({
        product_id,
        channel: 'shopify',
        channel_product_id: shopifyProductId.toString(),
        listing_url: listingUrl,
        status: 'active',
        sync_status: 'synced',
        last_synced_at: new Date().toISOString()
      });
    }

    return Response.json({ success: true, product_id: shopifyProductId, listing_url: listingUrl });

  } catch (error) {
    console.error('Export to Shopify error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});