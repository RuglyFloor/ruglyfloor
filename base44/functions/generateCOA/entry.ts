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

    if (order.order_status !== 'FINISHED') {
      return Response.json({ error: 'Order must be in FINISHED status to generate COA' }, { status: 400 });
    }

    // Get size and color from order metadata or prompt admin
    // For now, we'll require these to be passed in
    const { color_code, size_code } = await req.json();

    if (!color_code || !size_code) {
      return Response.json({ error: 'color_code and size_code required' }, { status: 400 });
    }

    // Generate serial number
    const year = new Date().getFullYear();
    const prefix = order.brand === 'CRUGLY' ? 'CRU' : 'RUG';
    
    const allInventory = await base44.asServiceRole.entities.RugInventory.list();
    const nextNum = allInventory.filter(i => i.serial_number.startsWith(`${prefix}-${year}`)).length + 1;
    const serialNumber = `${prefix}-${year}-${String(nextNum).padStart(6, '0')}`;

    // Create Inventory record
    const inventory = await base44.asServiceRole.entities.RugInventory.create({
      serial_number: serialNumber,
      brand: order.brand,
      linked_order_key: order.order_key,
      customer_id: order.customer_id,
      color_code: color_code,
      size_code: size_code,
      status: 'FINISHED',
      finished_at: new Date().toISOString()
    });

    // Create COA record
    const coa = await base44.asServiceRole.entities.Certificate.create({
      coa_id: serialNumber,
      serial_number: serialNumber,
      order_key: order.order_key,
      customer_id: order.customer_id,
      brand: order.brand,
      color_code: color_code,
      size_code: size_code,
      date_made: new Date().toISOString().split('T')[0]
    });

    console.log('COA generated:', serialNumber);

    // Notify owner
    const ownerEmail = 'contact@ruglyfloor.com';
    await base44.integrations.Core.SendEmail({
      to: ownerEmail,
      subject: `COA READY: ${serialNumber}`,
      body: `
        Serial Number: ${serialNumber}
        Order: ${order.order_key}
        Brand: ${order.brand}
        Color: ${color_code}
        Size: ${size_code}
        Customer: ${order.customer_name}
      `
    });

    return Response.json({ 
      success: true,
      serial_number: serialNumber,
      inventory,
      coa
    });

  } catch (error) {
    console.error('Generate COA error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});