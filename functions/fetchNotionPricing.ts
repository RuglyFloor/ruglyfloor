import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Notion access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    
    // Use hardcoded database ID temporarily (environment variable not propagating)
    const databaseId = '2f501466b24b8056a65bdbabdc59d94a';
    
    console.log('Using hardcoded database ID (last 6 chars):', databaseId.slice(-6));

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
    
    console.log('Notion response:', JSON.stringify(data, null, 2));

    return Response.json({ 
      success: true,
      rawData: data
    });

  } catch (error) {
    console.error('Notion query error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});