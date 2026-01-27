import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Notion access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    
    // First, retrieve the block to find database(s) inside
    const blockId = '2f501466b24b80bc9621fd3a60ae7bda';
    
    console.log('Retrieving block:', blockId);

    const blockResponse = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28'
      }
    });

    const blockData = await blockResponse.json();
    console.log('Block children:', JSON.stringify(blockData, null, 2));

    // Look for database in children
    const database = blockData.results?.find(child => child.type === 'child_database');
    
    if (!database) {
      return Response.json({ 
        error: 'No database found in block',
        blockData
      }, { status: 404 });
    }

    const databaseId = database.id;
    console.log('Found database ID:', databaseId);

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
    
    console.log('Notion database response:', JSON.stringify(data, null, 2));

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