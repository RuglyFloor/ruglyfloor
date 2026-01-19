import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return Response.json({ error: 'order_id is required' }, { status: 400 });
    }

    const order = await base44.asServiceRole.entities.Order.get(order_id);
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const { customer_email: customerEmail, customer_name: customerName, total_amount: totalAmount, items, order_number } = order;

    if (!customerEmail) {
      return Response.json({ error: 'Customer email not found' }, { status: 400 });
    }

    const itemsList = items.map(item => `- ${item.name} (${item.size}): $${item.price}`).join('\n');

    const orderId = order_number || order_id.slice(0, 8);

    const emailBody = `
Hi ${customerName || 'Valued Customer'},

Thank you for your order! We're excited to bring your custom rug to life.

Order Details:
Order #: ${orderId}
Total: $${totalAmount}

Items:
${itemsList}

Your rug is being carefully crafted by hand. You'll receive updates as it moves through each stage:
1. Rug ordered & ready for painting
2. Design being hand-painted
3. Quality inspection & finishing
4. Shipped to you!

Track your order: https://ruglyfloors.com/track?order=${orderId}

Questions? Call us at (517) 777-8474 or reply to this email.

Warm regards,
The Rugly Team
Custom Hand-Painted Rugs
    `.trim();

    await base44.integrations.Core.SendEmail({
      to: customerEmail,
      subject: `Order Confirmation - Rugly Custom Rug #${orderId}`,
      body: emailBody,
      from_name: 'Rugly Floors'
    });

    console.log(`Order confirmation sent to ${customerEmail}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});