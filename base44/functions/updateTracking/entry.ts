import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { order_key, tracking_number, carrier, tracking_url } = await req.json();

    if (!order_key || !tracking_number) {
      return Response.json({ error: 'order_key and tracking_number required' }, { status: 400 });
    }

    // Find order
    const orders = await base44.asServiceRole.entities.RuglyOrder.filter({ order_key });
    
    if (orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    const updated = await base44.asServiceRole.entities.RuglyOrder.update(order.id, {
      tracking_number,
      carrier: carrier || '',
      tracking_url: tracking_url || '',
      order_status: 'SHIPPED'
    });

    console.log('Tracking updated and order marked as SHIPPED:', order_key);

    return Response.json({ 
      success: true, 
      order: updated 
    });

  } catch (error) {
    console.error('Update tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});