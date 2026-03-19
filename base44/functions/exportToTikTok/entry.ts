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

    const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');
    const shopId = Deno.env.get('TIKTOK_SHOP_ID');

    if (!accessToken || !shopId) {
      return Response.json({ 
        error: 'TikTok Shop credentials not configured',
        details: 'Set TIKTOK_ACCESS_TOKEN and TIKTOK_SHOP_ID secrets'
      }, { status: 400 });
    }

    // Format product for TikTok Shop
    const tiktokProduct = {
      title: product.name,
      description: product.long_description || product.description || '',
      category_id: '1001', // Home & Living category
      brand: {
        name: 'Rugly'
      },
      main_images: [
        {
          url: product.all_images?.[0]?.url || product.image_url
        }
      ],
      skus: [
        {
          outer_sku_id: product.product_number,
          price: {
            amount: (product.price * 100).toString(), // Convert to cents
            currency: 'USD'
          },
          stock_infos: [
            {
              available_stock: product.in_stock ? 1 : 0
            }
          ]
        }
      ],
      product_attributes: [
        {
          attribute_id: 'material',
          attribute_values: [
            {
              value: product.material || 'Cotton'
            }
          ]
        },
        {
          attribute_id: 'size',
          attribute_values: [
            {
              value: product.size || 'Custom'
            }
          ]
        }
      ],
      package_dimensions: {
        unit: 'INCH',
        length: '24',
        width: '24',
        height: '2'
      },
      package_weight: {
        unit: 'POUND',
        value: '3'
      }
    };

    // Check if product exists on TikTok
    const existingListings = await base44.asServiceRole.entities.ChannelListing.filter({
      product_id: product_id,
      channel: 'tiktok'
    });

    let response;
    let endpoint;

    if (existingListings && existingListings.length > 0 && existingListings[0].channel_product_id) {
      // Update existing product
      const productId = existingListings[0].channel_product_id;
      endpoint = `https://open-api.tiktokglobalshop.com/product/${productId}/update`;
      tiktokProduct.product_id = productId;
    } else {
      // Create new product
      endpoint = 'https://open-api.tiktokglobalshop.com/product/create';
    }

    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tts-access-token': accessToken
      },
      body: JSON.stringify({
        shop_id: shopId,
        product: tiktokProduct
      })
    });

    const result = await response.json();

    if (!response.ok || result.code !== 0) {
      console.error('TikTok export error:', result);
      
      if (existingListings && existingListings.length > 0) {
        await base44.asServiceRole.entities.ChannelListing.update(existingListings[0].id, {
          sync_status: 'failed',
          error_message: result.message || JSON.stringify(result)
        });
      }

      return Response.json({ 
        error: 'TikTok Shop export failed',
        details: result
      }, { status: response.status });
    }

    const productId = result.data?.product_id;

    // Update/create channel listing
    if (existingListings && existingListings.length > 0) {
      await base44.asServiceRole.entities.ChannelListing.update(existingListings[0].id, {
        channel_product_id: productId,
        sync_status: 'synced',
        status: 'active',
        last_synced_at: new Date().toISOString(),
        error_message: null
      });
    } else {
      await base44.asServiceRole.entities.ChannelListing.create({
        product_id: product_id,
        channel: 'tiktok',
        channel_product_id: productId,
        status: 'active',
        sync_status: 'synced',
        last_synced_at: new Date().toISOString()
      });
    }

    return Response.json({ 
      success: true,
      message: 'Product exported to TikTok Shop successfully',
      product_id: productId
    });

  } catch (error) {
    console.error('Export to TikTok error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});