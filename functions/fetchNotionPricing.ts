import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Notion access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    
    // Use the confirmed database ID
    const databaseId = '2f501466b24b8056a65bdbabdc59d94a';
    
    console.log('Querying database ID (last 6):', databaseId.slice(-6));

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
        error: data.message,
        code: data.code
      }, { status: data.status });
    }
    
    console.log('Success! Retrieved', data.results?.length || 0, 'entries');

    return Response.json({ 
      success: true,
      count: data.results?.length || 0,
      rawData: data
    });

  } catch (error) {
    console.error('Notion query error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});