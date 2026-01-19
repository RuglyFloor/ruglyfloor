import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { orderData } = await req.json();
    
    // Get Notion access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("notion");
    
    // Format order items for Notion
    const itemsText = orderData.items.map(item => 
      `${item.name} - ${item.size} - $${item.price}`
    ).join('\n');
    
    // Create page in Notion database
    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: {
          database_id: Deno.env.get('NOTION_DATABASE_ID')
        },
        properties: {
          'Order Number': {
            title: [
              {
                text: {
                  content: orderData.order_number || 'Pending'
                }
              }
            ]
          },
          'Customer Name': {
            rich_text: [
              {
                text: {
                  content: orderData.customer_name
                }
              }
            ]
          },
          'Email': {
            email: orderData.customer_email
          },
          'Phone': {
            phone_number: orderData.customer_phone || ''
          },
          'Total': {
            number: orderData.total_amount
          },
          'Status': {
            select: {
              name: orderData.status || 'pending'
            }
          },
          'Items': {
            rich_text: [
              {
                text: {
                  content: itemsText
                }
              }
            ]
          },
          'Shipping Address': {
            rich_text: [
              {
                text: {
                  content: `${orderData.shipping_address.street}, ${orderData.shipping_address.city}, ${orderData.shipping_address.state} ${orderData.shipping_address.zip}`
                }
              }
            ]
          }
        }
      })
    });
    
    if (!notionResponse.ok) {
      const error = await notionResponse.text();
      console.error('Notion API error:', error);
      throw new Error(`Notion API error: ${error}`);
    }
    
    const result = await notionResponse.json();
    console.log('Successfully logged order to Notion:', result.id);
    
    return Response.json({ 
      success: true, 
      notion_page_id: result.id 
    });
  } catch (error) {
    console.error('Error logging to Notion:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});