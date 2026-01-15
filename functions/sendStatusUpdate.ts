import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { orderId, customerEmail, customerName, newStatus } = body;

    if (!orderId || !customerEmail || !newStatus) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const statusMessages = {
      rug_ordered: 'Your order has been confirmed and production will begin shortly!',
      in_production: 'Production has started! Your rug is being prepared for painting.',
      painting: 'Your rug is now being hand-painted. This is where the magic happens!',
      shipped: 'Great news! Your rug has been shipped. Check your tracking info below.',
      completed: 'Your order is complete! Your custom rug is on its way to you.',
      cancelled: 'Your order has been cancelled. Please contact us for details.'
    };

    const trackingUrl = `https://ruglyfloors.com/track?order=${orderId}`;
    const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;

    const emailBody = `
Hi ${customerName},

${message}

Track your order here: ${trackingUrl}

Questions? Contact us at (517) 777-8474

Best regards,
The Rugly Team
    `.trim();

    await base44.integrations.Core.SendEmail({
      to: customerEmail,
      subject: `Order Update: ${newStatus.replace(/_/g, ' ').toUpperCase()} - Order #${orderId}`,
      body: emailBody,
      from_name: 'Rugly Floors'
    });

    console.log(`Status update sent for order ${orderId}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Status update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});