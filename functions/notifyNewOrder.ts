import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { orderId, customerName, customerEmail, totalAmount } = body;

    if (!orderId || !customerName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailBody = `
New Order Received!

Order ID: ${orderId}
Customer: ${customerName}
Email: ${customerEmail}
Total: $${totalAmount}

View in Admin Portal: https://ruglyfloors.com/admin-orders

Next steps:
1. Review order details
2. Confirm design specifications
3. Begin production
    `.trim();

    await base44.integrations.Core.SendEmail({
      to: 'contact@ruglyfloor.com',
      subject: `New Order: ${customerName} - $${totalAmount}`,
      body: emailBody,
      from_name: 'Rugly Order System'
    });

    console.log(`Order notification sent for ${orderId}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});