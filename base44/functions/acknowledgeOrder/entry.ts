import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { order_key } = await req.json();

    if (!order_key) {
      return Response.json({ error: 'order_key required' }, { status: 400 });
    }

    // Find order
    const orders = await base44.asServiceRole.entities.RuglyOrder.filter({ order_key });
    
    if (orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Update order to acknowledged
    const updated = await base44.asServiceRole.entities.RuglyOrder.update(order.id, {
      acknowledged_at: new Date().toISOString(),
      alarm_state: 'ACKED',
      order_status: order.order_status === 'NEW_UNREAD' ? 'CONFIRMED' : order.order_status
    });

    console.log('Order acknowledged:', order_key);

    return Response.json({ 
      success: true, 
      order: updated 
    });

  } catch (error) {
    console.error('Acknowledge order error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});