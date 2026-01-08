import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, orderNumber, status, customerName } = await req.json();

    if (!email || !orderNumber || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const statusMessages = {
      'Rug Ordered': '🎯 Your base rug has been ordered and is on its way to our studio!',
      'In Production': '🏭 Your rug is now in production. We\'re preparing the stencil and materials.',
      'Painting': '🎨 The magic is happening! Your design is being hand-painted onto the rug.',
      'Shipped': '📦 Your rug is on its way! You should receive it within 5-7 business days.',
      'Completed': '✅ Your order has been completed. We hope you love your new Rugly!',
      'Cancelled': '❌ Your order has been cancelled. If you have questions, please contact us.'
    };

    const message = statusMessages[status] || 'Your order status has been updated.';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `Order Update: ${status} - Order #${orderNumber}`,
      body: `
Hello ${customerName || 'there'}!

We wanted to update you on your Rugly order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order #${orderNumber}
New Status: ${status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

Track your order anytime at www.ruglyfloor.com/orders

Questions? We're here to help!
📧 orders@ruglyfloor.com
📞 (517) 777-8474

Thank you for choosing Rugly!
- The Rugly Team

www.ruglyfloor.com
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending status update:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});