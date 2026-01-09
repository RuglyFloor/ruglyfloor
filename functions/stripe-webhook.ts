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
          const order = (await base44.asServiceRole.entities.Order.filter({ id: orderId }))[0];
          
          if (order) {
            // Check if returning customer
            const previousOrders = await base44.asServiceRole.entities.Order.filter({ 
              customer_email: order.customer_email 
            });
            const isReturningCustomer = previousOrders.length > 1;
            
            // Calculate estimated completion (30 days)
            const estimatedCompletion = new Date();
            estimatedCompletion.setDate(estimatedCompletion.getDate() + 30);

            // Update order status
            await base44.asServiceRole.entities.Order.update(orderId, {
              payment_status: 'paid',
              status: 'rug_ordered',
              estimated_completion: estimatedCompletion.toISOString(),
              is_returning_customer: isReturningCustomer,
              status_history: [
                {
                  status: 'rug_ordered',
                  timestamp: new Date().toISOString(),
                  note: 'Payment confirmed, rug ordered from supplier'
                }
              ]
            });

            // Send confirmation email via new function
            await base44.asServiceRole.functions.invoke('sendOrderConfirmation', {
              orderData: {
                ...order,
                estimated_completion: estimatedCompletion.toISOString()
              }
            });

            // Notify business
            await base44.asServiceRole.functions.invoke('notifyNewOrder', {
              orderData: order
            });

            console.log(`Order ${orderId} confirmed. Returning customer: ${isReturningCustomer}`);
          }
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