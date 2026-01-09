import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { orderData } = await req.json();

    const trackingUrl = `https://ruglyfloor.com/track?order=${orderData.order_number}`;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 30);
    const estimatedDateStr = estimatedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Send confirmation email to customer
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Rugly Floor',
      to: orderData.customer_email,
      subject: `Order Confirmed! Custom Crugly #${orderData.order_number}`,
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #9333ea); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .timeline { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .timeline-item { display: flex; gap: 15px; margin-bottom: 15px; }
    .timeline-icon { background: #e0e7ff; color: #4f46e5; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .important-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .item { border-bottom: 1px solid #e5e7eb; padding: 15px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Order Confirmed!</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">Your custom Crugly is on its way!</p>
    </div>
    
    <div class="content">
      <p>Hi ${orderData.customer_name || 'there'}!</p>
      
      <p>Thank you for your order! We're excited to create your custom hand-painted rug.</p>
      
      <div class="important-box">
        <strong>⏰ Production Timeline: 30 Days</strong><br>
        Custom Cruglys are hand-painted to order and typically take <strong>30 days</strong> to complete and ship.<br>
        <strong>Estimated completion:</strong> ${estimatedDateStr}
      </div>

      <h2 style="margin-top: 30px;">Order Summary</h2>
      <div class="order-details">
        <p><strong>Order Number:</strong> #${orderData.order_number}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <p><strong>Total Amount:</strong> $${orderData.total_amount.toFixed(2)}</p>
        
        <h3 style="margin-top: 20px;">Items:</h3>
        ${orderData.items.map(item => `
          <div class="item">
            ${item.preview_url ? `<img src="${item.preview_url}" style="max-width: 200px; border-radius: 8px; margin-bottom: 10px;">` : ''}
            <div><strong>${item.name}</strong></div>
            <div style="color: #6b7280; font-size: 14px;">
              Size: ${item.size}<br>
              ${item.base_color ? `Base Color: ${item.base_color}<br>` : ''}
              ${item.num_colors ? `Colors: ${item.num_colors}<br>` : ''}
              Price: $${item.price.toFixed(2)}
            </div>
          </div>
        `).join('')}
        
        <h3 style="margin-top: 20px;">Shipping Address:</h3>
        <p style="margin: 10px 0;">
          ${orderData.shipping_address.street}<br>
          ${orderData.shipping_address.city}, ${orderData.shipping_address.state} ${orderData.shipping_address.zip}<br>
          ${orderData.shipping_address.country || 'USA'}
        </p>
      </div>

      <h2 style="margin-top: 30px;">What Happens Next?</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-icon">1</div>
          <div>
            <strong>Rug Ordered</strong><br>
            <span style="color: #6b7280; font-size: 14px;">We order your base rug from our supplier</span>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon">2</div>
          <div>
            <strong>Stencil Creation</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Your design is converted to a professional stencil</span>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon">3</div>
          <div>
            <strong>Hand Painting</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Our artists paint your design with precision</span>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon">4</div>
          <div>
            <strong>Quality Check & Shipping</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Final inspection and shipped to your door</span>
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${trackingUrl}" class="button">Track Your Order</a>
      </div>

      <p style="margin-top: 30px;">We'll send you email updates as your rug progresses through each stage. You can also track your order anytime using the button above.</p>

      <div class="footer">
        <p><strong>Questions?</strong> We're here to help!</p>
        <p>
          📧 orders@ruglyfloor.com<br>
          📞 (517) 777-8474<br>
          🌐 <a href="https://ruglyfloor.com" style="color: #2563eb;">www.ruglyfloor.com</a>
        </p>
        <p style="margin-top: 20px;">Thank you for choosing Rugly Floor!</p>
      </div>
    </div>
  </div>
</body>
</html>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});