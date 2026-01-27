import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get form data
    const { qualityLevel, size, color, artworkMode, artworkFile, referenceNotes } = await req.json();

    console.log('Submitting artwork:', { qualityLevel, size, color, artworkMode });

    // Get Notion access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    const databaseId = Deno.env.get('NOTION_DATABASE_ID');

    // Build properties object
    const properties = {
      'Question 2': {
        multi_select: qualityLevel ? [{ name: qualityLevel }] : []
      },
      'Size Matters. Seriously, right now, get a tape measure and see how big it is.': {
        multi_select: size ? [{ name: size }] : []
      },
      'Color': {
        select: color ? { name: color } : null
      },
      'Artwork mode': {
        select: artworkMode ? { name: artworkMode } : null
      },
      'Reference notes': {
        rich_text: referenceNotes ? [{ text: { content: referenceNotes } }] : []
      },
      'Website: Artwork card ready': {
        checkbox: !!artworkFile
      }
    };

    // Create page in Notion
    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties
      })
    });

    const pageData = await notionResponse.json();
    console.log('Notion page created:', pageData.id);

    // If there's an artwork file, update the page to add it
    if (artworkFile && pageData.id) {
      const updateResponse = await fetch(`https://api.notion.com/v1/pages/${pageData.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          properties: {
            'Artwork upload': {
              files: [{
                name: 'artwork.png',
                type: 'external',
                external: { url: artworkFile }
              }]
            }
          }
        })
      });

      const updateData = await updateResponse.json();
      console.log('Artwork file added to Notion:', updateData);
    }

    return Response.json({ 
      success: true, 
      notionPageId: pageData.id 
    });

  } catch (error) {
    console.error('Notion submission error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});