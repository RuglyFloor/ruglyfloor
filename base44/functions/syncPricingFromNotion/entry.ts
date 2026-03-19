import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const notionToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    
    if (!notionToken) {
      return Response.json({ error: 'Notion not connected' }, { status: 401 });
    }

    const databaseId = Deno.env.get('NOTION_DATABASE_ID');
    if (!databaseId) {
      return Response.json({ error: 'NOTION_DATABASE_ID not set' }, { status: 500 });
    }

    // Fetch pricing data from Notion
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
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
    
    // Parse Notion data into structured pricing config
    const pricingConfig = {
      qualityTiers: [],
      sizes: [],
      baseColors: [],
      paintColors: [],
      addOns: [],
      lastSync: new Date().toISOString()
    };

    // Process each row from Notion
    for (const page of data.results) {
      const props = page.properties;
      
      // Determine row type from Category property
      const category = props.Category?.select?.name || '';
      
      if (category === 'Quality Tier') {
        pricingConfig.qualityTiers.push({
          id: props.ID?.rich_text?.[0]?.plain_text || '',
          name: props.Name?.title?.[0]?.plain_text || '',
          multiplier: props.Multiplier?.number || 1,
          description: props.Description?.rich_text?.[0]?.plain_text || '',
          features: props.Features?.rich_text?.[0]?.plain_text || '{}',
          active: props.Active?.checkbox ?? true
        });
      } else if (category === 'Size') {
        pricingConfig.sizes.push({
          id: props.ID?.rich_text?.[0]?.plain_text || '',
          name: props.Name?.title?.[0]?.plain_text || '',
          measurement: props.Measurement?.rich_text?.[0]?.plain_text || '',
          basePrice: props.BasePrice?.number || 0,
          step: props.Step?.number || 0,
          active: props.Active?.checkbox ?? true
        });
      } else if (category === 'Base Color') {
        pricingConfig.baseColors.push({
          name: props.Name?.title?.[0]?.plain_text || '',
          hex: props.HexCode?.rich_text?.[0]?.plain_text || '',
          type: props.Type?.select?.name || 'light',
          active: props.Active?.checkbox ?? true
        });
      } else if (category === 'Paint Color') {
        pricingConfig.paintColors.push({
          name: props.Name?.title?.[0]?.plain_text || '',
          hex: props.HexCode?.rich_text?.[0]?.plain_text || '',
          group: props.Group?.select?.name || 'Group 1',
          type: props.Type?.select?.name || 'both',
          active: props.Active?.checkbox ?? true
        });
      } else if (category === 'Add-On') {
        pricingConfig.addOns.push({
          name: props.Name?.title?.[0]?.plain_text || '',
          feeType: props.FeeType?.select?.name || 'fixed',
          baseFee: props.BaseFee?.number || 0,
          stepMultiplier: props.StepMultiplier?.number || 0,
          description: props.Description?.rich_text?.[0]?.plain_text || '',
          active: props.Active?.checkbox ?? true
        });
      }
    }

    // Store in PricingConfig entity
    const existingConfig = await base44.asServiceRole.entities.PricingConfig.filter({ 
      config_name: 'main_pricing' 
    });

    if (existingConfig.length > 0) {
      await base44.asServiceRole.entities.PricingConfig.update(existingConfig[0].id, {
        pricing_data: pricingConfig,
        last_updated_by: 'system'
      });
    } else {
      await base44.asServiceRole.entities.PricingConfig.create({
        config_name: 'main_pricing',
        pricing_data: pricingConfig,
        last_updated_by: 'system'
      });
    }

    return Response.json({ 
      success: true, 
      message: 'Pricing synced from Notion',
      pricingConfig 
    });

  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ 
      error: 'Failed to sync pricing', 
      details: error.message 
    }, { status: 500 });
  }
});