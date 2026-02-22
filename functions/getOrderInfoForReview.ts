import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { session_id } = await req.json();

    if (!session_id) {
      return Response.json({ error: 'session_id required' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Estimate delivery: 3 weeks from now
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 21);
    const estimated_delivery_date = deliveryDate.toISOString().split('T')[0];

    const order_id = session.metadata?.order_number || session.id;
    const email = session.customer_details?.email || '';
    const country = session.shipping_details?.address?.country || session.customer_details?.address?.country || 'US';

    return Response.json({ order_id, email, country, estimated_delivery_date });

  } catch (error) {
    console.error('[getOrderInfoForReview] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});