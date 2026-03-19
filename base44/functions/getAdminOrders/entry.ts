import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin user
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Fetch all orders using service role
    const orders = await base44.asServiceRole.entities.Order.list('-created_date');
    
    return Response.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});