import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const message = payload.data;
    if (!message?.from_email) {
      return Response.json({ skipped: true, reason: 'No email in message' });
    }

    const email = message.from_email.toLowerCase().trim();

    // Check if Customer already exists
    const existing = await base44.asServiceRole.entities.Customer.filter({ email });

    if (existing && existing.length > 0) {
      const customer = existing[0];
      // Update only fields that are currently empty
      const updates = {};
      if (!customer.name && message.from_name) updates.name = message.from_name;
      if (!customer.phone && message.from_phone) updates.phone = message.from_phone;

      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.Customer.update(customer.id, updates);
        console.log(`Updated existing customer ${customer.customer_id} (${email})`);
      } else {
        console.log(`Customer already exists and up to date: ${email}`);
      }
      return Response.json({ status: 'updated', customer_id: customer.customer_id });
    }

    // Generate new customer ID
    const allCustomers = await base44.asServiceRole.entities.Customer.list('-created_date', 1);
    let nextNum = 1;
    if (allCustomers && allCustomers.length > 0) {
      const lastId = allCustomers[0].customer_id || 'CUST-000000';
      const lastNum = parseInt(lastId.replace('CUST-', ''), 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }
    const customer_id = `CUST-${String(nextNum).padStart(6, '0')}`;

    const newCustomer = {
      customer_id,
      email,
      name: message.from_name || '',
      phone: message.from_phone || '',
      notes: `Auto-captured from Inbox message on ${new Date().toISOString().split('T')[0]}`,
    };

    await base44.asServiceRole.entities.Customer.create(newCustomer);
    console.log(`Created new customer ${customer_id} (${email})`);

    return Response.json({ status: 'created', customer_id });
  } catch (error) {
    console.error('captureContactFromInbox error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});