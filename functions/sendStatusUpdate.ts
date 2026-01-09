import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, orderNumber, status, customerName, trackingNumber, trackingUrl } = await req.json();

    if (!email || !orderNumber || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderTrackingUrl = `https://ruglyfloor.com/track?order=${orderNumber}`;

    const statusMessages = {
      'Rug Ordered': '🎯 Your base rug has been ordered and is on its way to our studio!',
      'In Production': '🏭 Your rug is now in production. We\'re preparing the stencil and materials.',
      'Painting': '🎨 The magic is happening! Your design is being hand-painted onto the rug.',
      'Shipped': '📦 Your rug is on its way! You should receive it within 5-7 business days.',
      'Completed': '✅ Your order has been completed. We hope you love your new Rugly!',
      'Cancelled': '❌ Your order has been cancelled. If you have questions, please contact us.'
    };

    const message = statusMessages[status] || 'Your order status has been updated.';

    let trackingInfo = '';
    if (trackingNumber && trackingUrl) {
      trackingInfo = `
🚚 <strong>Tracking Information:</strong><br>
Tracking Number: ${trackingNumber}<br>
<a href="${trackingUrl}" style="color: #2563eb; text-decoration: none;">Click here to track your shipment</a><br><br>
`;
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `Order Update: ${status} - Order #${orderNumber}`,
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px; }
    .header { background: linear-gradient(135deg, #2563eb, #9333ea); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .status-box { background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">📦 Order Update</h2>
    </div>
    
    <div class="content">
      <p>Hi ${customerName || 'there'}!</p>
      
      <p>We have an update on your Rugly order:</p>
      
      <div class="status-box">
        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Order #${orderNumber}</p>
        <h2 style="margin: 0; color: #4f46e5;">${status}</h2>
      </div>

      <p style="font-size: 16px;">${message}</p>

      ${trackingInfo}

      <div style="text-align: center;">
        <a href="${orderTrackingUrl}" class="button">View Order Details</a>
      </div>

      <div class="footer">
        <p><strong>Questions?</strong></p>
        <p>
          📧 orders@ruglyfloor.com<br>
          📞 (517) 777-8474<br>
          🌐 <a href="https://ruglyfloor.com" style="color: #2563eb;">www.ruglyfloor.com</a>
        </p>
        <p style="margin-top: 15px;">- The Rugly Team</p>
      </div>
    </div>
  </div>
</body>
</html>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending status update:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});