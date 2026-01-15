import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.8.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return Response.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    // Initialize Base44 client for service role operations
    const base44 = createClientFromRequest(req);

    console.log(`Processing Stripe event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log(`Checkout completed: ${session.id}, Order ID: ${session.metadata?.order_id}`);

      // Update order payment status
      if (session.metadata?.order_id) {
        await base44.asServiceRole.entities.Order.update(session.metadata.order_id, {
          payment_status: 'paid',
          tracking_number: null
        });

        console.log(`Order ${session.metadata.order_id} marked as paid`);

        // Get order details for notification
        const order = await base44.asServiceRole.entities.Order.list();
        const updatedOrder = order.find(o => o.id === session.metadata.order_id);

        if (updatedOrder) {
          // Send order confirmation email
          try {
            const itemsList = updatedOrder.items.map(item => `- ${item.name} (${item.size}): $${item.price}`).join('\n');
            
            const emailBody = `
Hi ${updatedOrder.customer_name},

Thank you for your order! We're excited to bring your custom rug to life.

Order Details:
Order #: ${updatedOrder.order_number}
Total: $${updatedOrder.total_amount}

Items:
${itemsList}

Your rug is being carefully crafted by hand. You'll receive updates as it moves through each stage:
1. Rug ordered & ready for painting
2. Design being hand-painted
3. Quality inspection & finishing
4. Shipped to you!

Track your order: https://ruglyfloors.com/track?order=${session.metadata.order_id}

Questions? Call us at (517) 777-8474 or reply to this email.

Warm regards,
The Rugly Team
Custom Hand-Painted Rugs
            `.trim();

            await base44.integrations.Core.SendEmail({
              to: updatedOrder.customer_email,
              subject: `Order Confirmation - Rugly Custom Rug #${updatedOrder.order_number}`,
              body: emailBody,
              from_name: 'Rugly Floors'
            });
            console.log(`Confirmation email sent to ${updatedOrder.customer_email}`);
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            console.error('Email error details:', emailError.message);
          }

          // Notify admin of new order
          try {
            const adminEmailBody = `
New Order Received!

Order ID: ${session.metadata.order_id}
Order #: ${updatedOrder.order_number}
Customer: ${updatedOrder.customer_name}
Email: ${updatedOrder.customer_email}
Total: $${updatedOrder.total_amount}

View in Admin Portal: https://ruglyfloors.com/admin-orders

Next steps:
1. Review order details
2. Confirm design specifications
3. Begin production
            `.trim();

            await base44.integrations.Core.SendEmail({
              to: 'contact@ruglyfloor.com',
              subject: `New Order: ${updatedOrder.customer_name} - $${updatedOrder.total_amount}`,
              body: adminEmailBody,
              from_name: 'Rugly Order System'
            });
            console.log(`Admin notified for order ${session.metadata.order_id}`);
          } catch (notifyError) {
            console.error('Failed to notify admin:', notifyError);
            console.error('Admin notify error details:', notifyError.message);
          }
        } else {
          console.error(`Order ${session.metadata.order_id} not found after update!`);
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      console.log(`Checkout session expired: ${session.id}`);
      // Handle expired checkout if needed
    }

    return Response.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    console.error('Error message:', error.message);
    return Response.json({ 
      error: 'Webhook processing failed',
      message: error.message 
    }, { status: 400 });
  }
});