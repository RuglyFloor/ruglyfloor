import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both entity automation payload and direct call with order data
    let order = null;

    if (body?.event?.entity_id) {
      // Called from entity automation - fetch the order
      order = await base44.asServiceRole.entities.RuglyOrder.filter({ id: body.event.entity_id });
      order = Array.isArray(order) ? order[0] : order;
    } else if (body?.orderId) {
      // Direct call with explicit fields (legacy)
      const { orderId, customerName, customerEmail, totalAmount } = body;
      order = { order_key: orderId, customer_name: customerName, customer_email: customerEmail, total_amount: totalAmount };
    }

    if (!order) {
      return Response.json({ error: 'No order data found' }, { status: 400 });
    }

    const emailBody = `
New Order Received!

Order Key: ${order.order_key}
Customer: ${order.customer_name || 'N/A'}
Email: ${order.customer_email}
Total: $${order.total_amount || 'N/A'}
Status: ${order.order_status || 'NEW'}

View in Admin Portal: https://ruglyfloor.com/AdminOrders

Next steps:
1. Review order details
2. Confirm design specifications
3. Begin production
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'contact@ruglyfloor.com',
      subject: `New Order: ${order.customer_name || order.customer_email} - $${order.total_amount}`,
      body: emailBody,
      from_name: 'Rugly Order System'
    });

    console.log(`Order notification sent for ${order.order_key}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});