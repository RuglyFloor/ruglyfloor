import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return Response.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // Verify webhook signature (async version for Deno)
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          // Generate serial number and estimated delivery
          const serialNumber = `RUG-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          const estimatedDelivery = new Date();
          estimatedDelivery.setDate(estimatedDelivery.getDate() + 21); // 3 weeks
          const deliveryDate = estimatedDelivery.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

          // Update order status
          await base44.asServiceRole.entities.Order.update(orderId, {
            payment_status: 'paid',
            status: 'rug_ordered',
            notes: `Serial: ${serialNumber} | Est. Delivery: ${deliveryDate}`
          });

          const order = (await base44.asServiceRole.entities.Order.filter({ id: orderId }))[0];
          
          if (order && order.customer_email) {
            const itemsList = order.items.map(item => 
              `• ${item.name} - ${item.size} - $${item.price}`
            ).join('\n');

            // Send confirmation email
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: order.customer_email,
              subject: `Order Confirmed! Your Custom Rug is Being Created - Order #${order.order_number}`,
              body: `
🎨 Thank you for your Rugly order!

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: #${order.order_number}
Serial Number: ${serialNumber}
Status: Rug Ordered - Production Starting Soon

Items:
${itemsList}

Total: $${order.total_amount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Estimated Delivery: ${deliveryDate}

Your custom rug journey:
1. ✅ Order Confirmed - We're sourcing your base rug
2. 🎨 In Production - Hand-painting begins
3. 🖌️ Painting - Your design comes to life
4. 📦 Shipped - On its way to you
5. 🏠 Delivered - Enjoy your art for the floor!

Track Your Order:
You can check your order status anytime at www.ruglyfloor.com/orders

Questions? Contact us at orders@ruglyfloor.com or call (517) 777-8474

Thank you for choosing Rugly!
- The Rugly Team

www.ruglyfloor.com
              `
            });
          }

          console.log(`Order ${orderId} marked as paid with serial ${serialNumber}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 400 });
  }
});