import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Notion access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    const databaseId = Deno.env.get('NOTION_DATABASE_ID');

    // Query the database
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 100
      })
    });

    const data = await response.json();
    
    // Extract pricing structure
    const pricingData = data.results.map(page => {
      const props = page.properties;
      return {
        qualityLevel: props['Question 2']?.multi_select?.map(s => s.name) || [],
        size: props['Size Matters. Seriously, right now, get a tape measure and see how big it is.']?.multi_select?.map(s => s.name) || [],
        color: props['Color']?.select?.name || null,
        price: props['Price']?.number || null,
        // Look for any price-related fields
        allProperties: Object.keys(props)
      };
    });

    return Response.json({ 
      success: true,
      pricing: pricingData,
      samplePage: data.results[0]?.properties || {}
    });

  } catch (error) {
    console.error('Notion query error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});