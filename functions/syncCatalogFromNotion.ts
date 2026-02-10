import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const notionToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    
    if (!notionToken) {
      return Response.json({ error: 'Notion not connected' }, { status: 401 });
    }

    const databaseId = "15bd1a8a-6a57-4182-995f-890991a18df0";

    console.log('Fetching catalog from Notion...');
    
    // Fetch catalog data from Notion
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2025-09-03',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Notion API error:', error);
      return Response.json({ error: 'Failed to fetch from Notion', details: error }, { status: 500 });
    }

    const data = await response.json();
    console.log(`Fetched ${data.results.length} rows from Notion`);
    
    const catalogItems = [];
    const placeholder = 'https://via.placeholder.com/400x300?text=No+Image';

    // Process each row from Notion
    for (const page of data.results) {
      const props = page.properties;
      
      // Get all fields
      const option = props.Option?.title?.[0]?.plain_text || props.Name?.title?.[0]?.plain_text || '';
      const active = props.Active?.checkbox ?? true;
      
      if (!option) continue; // Skip rows without a name
      
      // Extract images with fallback logic
      const mainImage = props['Main image']?.files?.[0]?.file?.url || props['Main image']?.files?.[0]?.external?.url || '';
      const swatchImage = props['Color/material swatch']?.files?.[0]?.file?.url || props['Color/material swatch']?.files?.[0]?.external?.url || '';
      const closeupImage = props['Texture/Color close-up']?.files?.[0]?.file?.url || props['Texture/Color close-up']?.files?.[0]?.external?.url || '';
      const lifestyleImage = props['Interior/Lifestyle image']?.files?.[0]?.file?.url || props['Interior/Lifestyle image']?.files?.[0]?.external?.url || '';
      
      // Image fallback: Main → Lifestyle → Closeup → Swatch → Placeholder
      const displayImage = mainImage || lifestyleImage || closeupImage || swatchImage || placeholder;
      
      const catalogItem = {
        option,
        active,
        quality_tier: props['Quality tier']?.select?.name || '',
        sizes_available: props['Sizes available']?.rich_text?.[0]?.plain_text || '',
        eta: props.ETA?.rich_text?.[0]?.plain_text || '',
        notes: props.Notes?.rich_text?.[0]?.plain_text || '',
        my_cost: props['My cost']?.number || 0,
        retail_price_150: props['Retail price (150%)']?.number || 0,
        amazon_url: props['Amazon URL']?.url || '',
        main_image: displayImage,
        color_material_swatch: swatchImage,
        texture_color_closeup: closeupImage,
        interior_lifestyle_image: lifestyleImage,
        shape: props.Shape?.select?.name || '',
        width_in: props['Width (in)']?.number || 0,
        length_in: props['Length (in)']?.number || 0,
        diameter_in: props['Diameter (in)']?.number || 0,
        size_label: props['Size label']?.select?.name || '',
        color: props.Color?.rich_text?.[0]?.plain_text || '',
        last_updated: new Date().toISOString()
      };
      
      catalogItems.push(catalogItem);
    }

    console.log(`Parsed ${catalogItems.length} catalog items`);

    // Clear existing catalog and insert new items
    const existingItems = await base44.asServiceRole.entities.Catalog.list();
    console.log(`Deleting ${existingItems.length} existing items...`);
    
    for (const item of existingItems) {
      await base44.asServiceRole.entities.Catalog.delete(item.id);
    }

    // Bulk create new items
    console.log(`Creating ${catalogItems.length} new items...`);
    for (const item of catalogItems) {
      await base44.asServiceRole.entities.Catalog.create(item);
    }

    return Response.json({ 
      success: true, 
      message: `Synced ${catalogItems.length} catalog items from Notion`,
      synced: catalogItems.length
    });

  } catch (error) {
    console.error('Sync error:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: 'Failed to sync catalog', 
      details: error.message 
    }, { status: 500 });
  }
});