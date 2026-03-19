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

    const apiKey = Deno.env.get('ETSY_API_KEY');
    const shopId = Deno.env.get('ETSY_SHOP_ID');

    if (!apiKey || !shopId) {
      return Response.json({ 
        error: 'Etsy credentials not configured',
        details: 'Set ETSY_API_KEY and ETSY_SHOP_ID secrets'
      }, { status: 400 });
    }

    // Format product for Etsy
    const etsyListing = {
      quantity: product.in_stock ? 1 : 0,
      title: product.name.substring(0, 140), // Etsy limit
      description: product.long_description || product.description || '',
      price: product.price,
      who_made: 'i_did',
      when_made: '2020_2024',
      taxonomy_id: 1071, // Home & Living > Rugs
      shipping_template_id: null, // Configure in Etsy dashboard
      tags: ['custom rug', 'hand painted', 'floor art', product.category].filter(Boolean),
      materials: [product.material || 'cotton', 'paint'].filter(Boolean),
      is_supply: false,
      is_customizable: true,
      should_auto_renew: true
    };

    // Check if listing exists
    const existingListings = await base44.asServiceRole.entities.ChannelListing.filter({
      product_id: product_id,
      channel: 'etsy'
    });

    let response;
    let listingId;

    if (existingListings && existingListings.length > 0 && existingListings[0].channel_product_id) {
      // Update existing listing
      listingId = existingListings[0].channel_product_id;
      response = await fetch(
        `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/${listingId}`,
        {
          method: 'PUT',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(etsyListing)
        }
      );
    } else {
      // Create new listing
      response = await fetch(
        `https://openapi.etsy.com/v3/application/shops/${shopId}/listings`,
        {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(etsyListing)
        }
      );
    }

    const result = await response.json();

    if (!response.ok) {
      console.error('Etsy export error:', result);
      
      // Save error status
      if (existingListings && existingListings.length > 0) {
        await base44.asServiceRole.entities.ChannelListing.update(existingListings[0].id, {
          sync_status: 'failed',
          error_message: JSON.stringify(result)
        });
      }

      return Response.json({ 
        error: 'Etsy export failed',
        details: result
      }, { status: response.status });
    }

    listingId = result.listing_id;

    // Update/create channel listing
    if (existingListings && existingListings.length > 0) {
      await base44.asServiceRole.entities.ChannelListing.update(existingListings[0].id, {
        channel_product_id: listingId.toString(),
        listing_url: `https://www.etsy.com/listing/${listingId}`,
        sync_status: 'synced',
        status: 'active',
        last_synced_at: new Date().toISOString(),
        error_message: null
      });
    } else {
      await base44.asServiceRole.entities.ChannelListing.create({
        product_id: product_id,
        channel: 'etsy',
        channel_product_id: listingId.toString(),
        listing_url: `https://www.etsy.com/listing/${listingId}`,
        status: 'active',
        sync_status: 'synced',
        last_synced_at: new Date().toISOString()
      });
    }

    return Response.json({ 
      success: true,
      message: 'Product exported to Etsy successfully',
      listing_id: listingId,
      listing_url: `https://www.etsy.com/listing/${listingId}`
    });

  } catch (error) {
    console.error('Export to Etsy error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});