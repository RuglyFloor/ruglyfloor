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
          // Update order status
          await base44.asServiceRole.entities.Order.update(orderId, {
            payment_status: 'paid',
            status: 'rug_ordered'
          });

          // Send confirmation email
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: session.customer_email,
            subject: `Order Confirmed - ${session.metadata.order_number}`,
            body: `Thank you for your order! Your order number is ${session.metadata.order_number}. We'll start working on your custom rug right away and keep you updated on the progress.`
          });

          console.log(`Order ${orderId} marked as paid`);
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