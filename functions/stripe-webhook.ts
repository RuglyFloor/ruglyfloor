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
            await base44.asServiceRole.functions.invoke('sendOrderConfirmation', {
              orderId: session.metadata.order_id,
              customerEmail: updatedOrder.customer_email,
              customerName: updatedOrder.customer_name,
              totalAmount: updatedOrder.total_amount,
              items: updatedOrder.items
            });
            console.log(`Confirmation email sent for order ${session.metadata.order_id}`);
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError.message);
          }

          // Notify admin of new order
          try {
            await base44.asServiceRole.functions.invoke('notifyNewOrder', {
              orderId: session.metadata.order_id,
              customerName: updatedOrder.customer_name,
              customerEmail: updatedOrder.customer_email,
              totalAmount: updatedOrder.total_amount
            });
            console.log(`Admin notified of new order ${session.metadata.order_id}`);
          } catch (notifyError) {
            console.error('Failed to notify admin:', notifyError.message);
          }
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