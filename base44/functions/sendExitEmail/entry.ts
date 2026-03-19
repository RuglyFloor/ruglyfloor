import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, cartItems, totalAmount, cartUrl } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: 'Your Custom Rug is Waiting! 🎨',
      body: `
        <h2>Don't Leave Your Dream Rug Behind!</h2>
        <p>You have ${cartItems} custom rug${cartItems > 1 ? 's' : ''} in your cart totaling $${totalAmount}.</p>
        <p>Your custom designs are waiting for you! Complete your order and bring art to your floor.</p>
        <p><a href="${cartUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Your Order</a></p>
        <p style="margin-top: 20px;">Questions? Reply to this email or call us at (517) 777-8474</p>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Exit email error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send email' 
    }, { status: 500 });
  }
});