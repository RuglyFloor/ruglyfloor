import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    
    const { pageId, status } = await req.json();

    if (!pageId || !status) {
      return Response.json({ error: 'pageId and status are required' }, { status: 400 });
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          Status: {
            status: {
              name: status
            }
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json({ error: error.message || 'Failed to update page' }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ success: true, page: data });
  } catch (error) {
    console.error('Notion update error:', error);
    return Response.json({ 
      error: error.message || 'Failed to update Notion page' 
    }, { status: 500 });
  }
});