import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const data = await req.json();

    console.log('[createFixMyRugCheckout] Creating order...', data);

    // Generate order number
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const orderNumber = `FMR-${year}-${random}`;

    // Create order in database
    const order = await base44.asServiceRole.entities.FixMyRugOrder.create({
      order_number: orderNumber,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      shipping_address: data.shipping_address,
      rug_size: data.rug_size,
      rug_material: data.rug_material,
      issue_type: data.issue_type,
      issue_description: data.issue_description,
      rug_photos: data.rug_photos,
      service_requested: data.service_requested,
      price: data.price,
      status: 'pending_payment',
      status_history: [{
        status: 'pending_payment',
        timestamp: new Date().toISOString(),
        note: 'Order created'
      }]
    });

    console.log('[createFixMyRugCheckout] Order created:', orderNumber);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Fix My Rug Service - ${data.rug_size}`,
            description: `Professional cleaning, repair, and painting for your ${data.rug_size} rug`,
            images: data.rug_photos.slice(0, 1)
          },
          unit_amount: data.price
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success?order=${orderNumber}`,
      cancel_url: `${req.headers.get('origin')}/FixMyRug`,
      customer_email: data.customer_email,
      metadata: {
        order_number: orderNumber,
        order_id: order.id,
        service_type: 'fix_my_rug',
        base44_app_id: Deno.env.get('BASE44_APP_ID')
      }
    });

    console.log('[createFixMyRugCheckout] Checkout session created:', session.id);

    return Response.json({
      checkout_url: session.url,
      order_number: orderNumber
    });

  } catch (error) {
    console.error('[createFixMyRugCheckout] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});