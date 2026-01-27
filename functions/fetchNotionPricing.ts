import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Notion access token and database ID
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    const databaseId = Deno.env.get('NOTION_DATABASE_ID');
    
    // Debug logging
    console.log('Environment check - DB ID last 6 chars:', databaseId ? databaseId.slice(-6) : 'NOT SET');
    console.log('Expected last 6: d94a');
    
    if (!databaseId) {
      return Response.json({ 
        success: false, 
        error: 'NOTION_DATABASE_ID environment variable is not set' 
      }, { status: 500 });
    }
    
    if (databaseId.includes('@')) {
      return Response.json({ 
        success: false, 
        error: 'NOTION_DATABASE_ID appears to be an email address, not a database ID. Expected format: 32 character hex string',
        receivedValue: '...' + databaseId.slice(-10)
      }, { status: 500 });
    }

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