import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('[Webhook] Missing signature');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await req.text();
    
    // Verify webhook signature (async version for Deno)
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('[Webhook] Received event:', event.type, 'ID:', event.id);

    const base44 = createClientFromRequest(req);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(base44, event);
        await handleQuotePayment(base44, event);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(base44, event);
        break;
      
      case 'charge.refunded':
        await handleRefund(base44, event);
        break;
      
      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('[Webhook] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleCheckoutCompleted(base44, event) {
  const session = event.data.object;
  const orderNumber = session.metadata?.order_number;
  const serviceType = session.metadata?.service_type;
  
  if (!orderNumber) {
    console.error('[Webhook] No order_number in metadata');
    return;
  }

  console.log('[Webhook] Processing checkout.session.completed for order:', orderNumber, 'Service:', serviceType);

  // Determine entity based on service type
  const entityName = serviceType === 'fix_my_rug' ? 'FixMyRugOrder' : 'Order';
  const orders = await base44.asServiceRole.entities[entityName].filter({ order_number: orderNumber });
  
  if (orders.length === 0) {
    console.error('[Webhook] Order not found:', orderNumber);
    return;
  }

  const order = orders[0];

  // Idempotency check
  if (order.stripe_event_id === event.id) {
    console.log('[Webhook] Event already processed:', event.id);
    return;
  }

  // Update order to PAID status
  await base44.asServiceRole.entities[entityName].update(order.id, {
    status: 'paid',
    payment_intent_id: session.payment_intent,
    checkout_session_id: session.id,
    stripe_event_id: event.id,
    payment_timestamp: new Date().toISOString(),
    status_history: [
      ...(order.status_history || []),
      {
        status: 'paid',
        timestamp: new Date().toISOString(),
        note: 'Payment confirmed via Stripe webhook'
      }
    ]
  });

  console.log('[Webhook] Order marked as PAID:', orderNumber);

  // === NOTIFY OWNER ===
  try {
    const items = order.items || [];
    const itemSummary = items.map(i =>
      `• ${i.qualityLabel || i.qualityTier} — ${i.size} — Base: ${i.base_color || 'N/A'} — Paint: ${i.paint_color || 'N/A'}${i.has_second_color ? ` + ${i.second_paint_color}` : ''} — $${i.price}`
    ).join('\n');

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'contact@ruglyfloor.com',
      from_name: 'Rugly Order System',
      subject: `🔔 NEW ORDER PAID: ${order.order_number} — ${order.customer_name} — $${order.total_amount}`,
      body: `NEW ORDER RECEIVED — PAYMENT CONFIRMED\n\nOrder #: ${order.order_number}\nCustomer: ${order.customer_name}\nEmail: ${order.customer_email}\nPhone: ${order.customer_phone}\nTotal: $${order.total_amount}\n\nItems:\n${itemSummary}\n\nShipping:\n${order.shipping_address?.street || ''}\n${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''} ${order.shipping_address?.zip || ''}\n\nView in Admin: https://ruglyfloor.com/AdminOrders`
    });
    console.log('[Webhook] Owner notification sent');
  } catch (err) {
    console.error('[Webhook] Owner notification FAILED:', err.message);
  }

  // === NOTIFY CUSTOMER ===
  try {
    const items = order.items || [];
    const itemsList = items.map(i =>
      `• ${i.qualityLabel || i.qualityTier} — ${i.size} — Base: ${i.base_color || 'N/A'} — Paint: ${i.paint_color || 'N/A'}${i.has_second_color ? ` + ${i.second_paint_color}` : ''} — $${i.price}`
    ).join('\n');

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: order.customer_email,
      from_name: 'Rugly Floors',
      subject: `Order Confirmed — Rugly Custom Rug #${order.order_number}`,
      body: `Hi ${order.customer_name || 'Valued Customer'},\n\nThank you for your order! We're excited to bring your custom rug to life.\n\nOrder #: ${order.order_number}\nTotal: $${order.total_amount}\n\nYour Items:\n${itemsList}\n\nYour rug is being carefully crafted by hand. You'll receive updates as it progresses through production.\n\nQuestions? Call us at (517) 777-8474 or email contact@ruglyfloor.com\n\nWarm regards,\nThe Rugly Team\nCustom Hand-Painted Rugs`
    });
    console.log('[Webhook] Customer confirmation sent to:', order.customer_email);
  } catch (err) {
    console.error('[Webhook] Customer confirmation FAILED:', err.message);
  }
}

async function handlePaymentSucceeded(base44, event) {
  const paymentIntent = event.data.object;
  
  console.log('[Webhook] Processing payment_intent.succeeded:', paymentIntent.id);

  // Find order by payment_intent_id
  const orders = await base44.asServiceRole.entities.Order.filter({ 
    payment_intent_id: paymentIntent.id 
  });
  
  if (orders.length === 0) {
    console.log('[Webhook] No order found for payment_intent:', paymentIntent.id);
    return;
  }

  const order = orders[0];

  // Idempotency check
  if (order.stripe_event_id === event.id) {
    console.log('[Webhook] Event already processed:', event.id);
    return;
  }

  // Only update if not already paid
  if (order.status === 'pending_payment') {
    await base44.asServiceRole.entities.Order.update(order.id, {
      status: 'paid',
      stripe_event_id: event.id,
      amount_paid: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      payment_timestamp: new Date().toISOString(),
      status_history: [
        ...(order.status_history || []),
        {
          status: 'paid',
          timestamp: new Date().toISOString(),
          note: 'Payment intent succeeded'
        }
      ]
    });

    console.log('[Webhook] Order marked as PAID:', order.order_number);
  }
}

async function handleQuotePayment(base44, event) {
  const session = event.data.object;
  const quoteId = session.metadata?.quote_id;
  const serviceType = session.metadata?.service_type;

  if (!quoteId || serviceType !== 'design_quote') return;

  console.log('[Webhook] Processing quote payment for quote:', quoteId);

  const quote = await base44.asServiceRole.entities.DesignQuote.get(quoteId);
  if (!quote) {
    console.error('[Webhook] Quote not found:', quoteId);
    return;
  }

  // Idempotency
  if (quote.stripe_payment_intent_id === session.payment_intent) {
    console.log('[Webhook] Quote payment already processed:', quoteId);
    return;
  }

  await base44.asServiceRole.entities.DesignQuote.update(quoteId, {
    status: 'paid',
    stripe_payment_intent_id: session.payment_intent,
    paid_at: new Date().toISOString(),
  });

  console.log('[Webhook] Quote marked as PAID:', quoteId);
}

async function handleRefund(base44, event) {
  const charge = event.data.object;
  const paymentIntentId = charge.payment_intent;
  
  console.log('[Webhook] Processing charge.refunded for payment_intent:', paymentIntentId);

  // Find order by payment_intent_id
  const orders = await base44.asServiceRole.entities.Order.filter({ 
    payment_intent_id: paymentIntentId 
  });
  
  if (orders.length === 0) {
    console.log('[Webhook] No order found for payment_intent:', paymentIntentId);
    return;
  }

  const order = orders[0];

  // Idempotency check
  if (order.stripe_event_id === event.id) {
    console.log('[Webhook] Event already processed:', event.id);
    return;
  }

  await base44.asServiceRole.entities.Order.update(order.id, {
    status: 'refunded',
    stripe_event_id: event.id,
    status_history: [
      ...(order.status_history || []),
      {
        status: 'refunded',
        timestamp: new Date().toISOString(),
        note: `Refund processed: $${(charge.amount_refunded / 100).toFixed(2)}`
      }
    ]
  });

  console.log('[Webhook] Order marked as REFUNDED:', order.order_number);
}