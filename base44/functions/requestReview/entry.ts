import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { order_key } = await req.json();

    if (!order_key) {
      return Response.json({ error: 'order_key required' }, { status: 400 });
    }

    // Find order
    const orders = await base44.asServiceRole.entities.RuglyOrder.filter({ order_key });
    
    if (orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Send review request email
    const reviewEmailBody = `
Hi ${order.customer_name || 'there'},

Thanks for choosing Rugly! We hope you're loving your custom rug.

Would you mind sharing your experience? Your feedback helps us improve and helps other customers make confident decisions.

Leave a review here: [YOUR_REVIEW_LINK]

Thanks,
The Rugly Team
    `;

    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject: 'How\'s your Rugly? We\'d love your feedback',
      body: reviewEmailBody
    });

    const updated = await base44.asServiceRole.entities.RuglyOrder.update(order.id, {
      order_status: 'REVIEW_REQUESTED',
      review_requested: true,
      review_requested_at: new Date().toISOString()
    });

    console.log('Review requested for order:', order_key);

    return Response.json({ 
      success: true, 
      order: updated 
    });

  } catch (error) {
    console.error('Request review error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});