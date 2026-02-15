import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id } = await req.json();

    // Get product data
    const products = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!products || products.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    // Facebook Marketplace/Shop requires:
    // - Facebook Business Manager access token
    // - Catalog ID
    const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
    const catalogId = Deno.env.get('FACEBOOK_CATALOG_ID');

    if (!accessToken || !catalogId) {
      return Response.json({ 
        error: 'Facebook credentials not configured',
        details: 'Set FACEBOOK_ACCESS_TOKEN and FACEBOOK_CATALOG_ID secrets'
      }, { status: 400 });
    }

    // Format product for Facebook
    const fbProduct = {
      availability: product.in_stock ? 'in stock' : 'out of stock',
      condition: 'new',
      description: product.description || product.long_description || '',
      image_url: product.all_images?.[0]?.url || product.image_url,
      name: product.name,
      price: `${product.price} USD`,
      url: `https://ruglyfloor.com/product/${product.product_number}`,
      brand: 'Rugly',
      google_product_category: 'Home & Garden > Decor > Rugs',
      custom_label_0: product.category || 'original'
    };

    // Create or update product on Facebook
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${catalogId}/products`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          requests: [{
            method: 'UPDATE',
            retailer_id: product.product_number,
            data: fbProduct
          }]
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Facebook export error:', result);
      return Response.json({ 
        error: 'Facebook export failed',
        details: result
      }, { status: response.status });
    }

    // Save channel listing
    const existingListings = await base44.asServiceRole.entities.ChannelListing.filter({
      product_id: product_id,
      channel: 'facebook'
    });

    if (existingListings && existingListings.length > 0) {
      await base44.asServiceRole.entities.ChannelListing.update(existingListings[0].id, {
        sync_status: 'synced',
        status: 'active',
        last_synced_at: new Date().toISOString(),
        error_message: null
      });
    } else {
      await base44.asServiceRole.entities.ChannelListing.create({
        product_id: product_id,
        channel: 'facebook',
        channel_product_id: product.product_number,
        listing_url: `https://www.facebook.com/marketplace/item/${catalogId}`,
        status: 'active',
        sync_status: 'synced',
        last_synced_at: new Date().toISOString()
      });
    }

    return Response.json({ 
      success: true,
      message: 'Product exported to Facebook successfully',
      facebook_response: result
    });

  } catch (error) {
    console.error('Export to Facebook error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});