import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Notion access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    
    // Use the confirmed database ID
    const databaseId = '2f501466b24b8056a65bdbabdc59d94a';

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
    
    if (data.object === 'error') {
      console.error('Notion error:', data);
      return Response.json({ 
        error: data.message
      }, { status: data.status });
    }
    
    // Parse the Notion data into a usable pricing structure
    const pricing = {
      sizes: [],
      qualityTiers: []
    };

    data.results.forEach(page => {
      const props = page.properties;
      
      // Extract size info
      if (props['Size']?.title?.[0]?.text?.content) {
        const sizeName = props['Size'].title[0].text.content;
        const measurement = props['Measurement']?.rich_text?.[0]?.text?.content;
        const basePrice = props['Base Price']?.number;
        const id = sizeName.toLowerCase().replace(/\s+/g, '-');
        
        if (basePrice && !pricing.sizes.find(s => s.id === id)) {
          pricing.sizes.push({
            id: id,
            label: sizeName,
            value: sizeName.toLowerCase(),
            measurement: measurement || sizeName,
            price: basePrice
          });
        }
      }
    });

    // Return the parsed pricing
    return Response.json({ 
      success: true,
      pricing: pricing,
      rawCount: data.results?.length || 0
    });

  } catch (error) {
    console.error('Pricing fetch error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});