import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id } = await req.json();

    const products = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!products || products.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    const shopDomain = Deno.env.get('SHOPIFY_SHOP_DOMAIN');
    const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');

    if (!shopDomain || !accessToken) {
      return Response.json({ 
        error: 'Shopify credentials not configured',
        details: 'Set SHOPIFY_SHOP_DOMAIN and SHOPIFY_ACCESS_TOKEN secrets'
      }, { status: 400 });
    }

    // Format product for Shopify
    const shopifyProduct = {
      product: {
        title: product.name,
        body_html: product.long_description || product.description || '',
        vendor: 'Rugly',
        product_type: 'Rug',
        tags: ['custom rug', 'hand painted', product.category].filter(Boolean).join(', '),
        images: (product.all_images || []).map(img => ({
          src: img.url || img.original_url
        })),
        variants: [
          {
            sku: product.product_number,
            price: product.price.toString(),
            inventory_quantity: product.in_stock ? 1 : 0,
            inventory_management: 'shopify',
            weight: 3,
            weight_unit: 'lb'
          }
        ],
        metafields: [
          {
            namespace: 'custom',
            key: 'material',
            value: product.material || '',
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'size',
            value: product.size || '',
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'care_instructions',
            value: product.care_instructions || '',
            type: 'multi_line_text_field'
          }
        ]
      }
    };

    // Check if product exists on Shopify
    const existingListings = await base44.asServiceRole.entities.ChannelListing.filter({
      product_id: product_id,
      channel: 'shopify'
    });

    let response;
    let endpoint;
    let method;

    if (existingListings && existingListings.length > 0 && existingListings[0].channel_product_id) {
      // Update existing product
      const shopifyProductId = existingListings[0].channel_product_id;
      endpoint = `https://${shopDomain}/admin/api/2024-01/products/${shopifyProductId}.json`;
      method = 'PUT';
      shopifyProduct.product.id = shopifyProductId;
    } else {
      // Create new product
      endpoint = `https://${shopDomain}/admin/api/2024-01/products.json`;
      method = 'POST';
    }

    response = await fetch(endpoint, {
      method: method,
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
          error_message: result.errors || JSON.stringify(result)
        });
      }

      return Response.json({ 
        error: 'Shopify export failed',
        details: result
      }, { status: response.status });
    }

    const shopifyProductId = result.product.id;
    const handle = result.product.handle;
    const listingUrl = `https://${shopDomain}/products/${handle}`;

    // Update/create channel listing
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
        product_id: product_id,
        channel: 'shopify',
        channel_product_id: shopifyProductId.toString(),
        listing_url: listingUrl,
        status: 'active',
        sync_status: 'synced',
        last_synced_at: new Date().toISOString()
      });
    }

    return Response.json({ 
      success: true,
      message: 'Product exported to Shopify successfully',
      product_id: shopifyProductId,
      listing_url: listingUrl
    });

  } catch (error) {
    console.error('Export to Shopify error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});