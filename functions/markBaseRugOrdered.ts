import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { order_key, status, eta } = await req.json();

    if (!order_key || !status) {
      return Response.json({ error: 'order_key and status required' }, { status: 400 });
    }

    // Find order
    const orders = await base44.asServiceRole.entities.RuglyOrder.filter({ order_key });
    
    if (orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    const updateData = {
      base_rug_order_status: status
    };

    if (eta) {
      updateData.base_rug_eta = eta;
    }

    const updated = await base44.asServiceRole.entities.RuglyOrder.update(order.id, updateData);

    console.log('Base rug status updated:', order_key, status);

    return Response.json({ 
      success: true, 
      order: updated 
    });

  } catch (error) {
    console.error('Mark base rug ordered error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});