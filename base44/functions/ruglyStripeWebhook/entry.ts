import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';
import { getBaseRugInfo } from './baseRugSKUMap.js';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    const base44 = createClientFromRequest(req);
    
    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Processing event: ${event.type} - ${event.id}`);

    // Dedupe: check if we've already processed this event
    const existingOrders = await base44.asServiceRole.entities.RuglyOrder.filter({ 
      stripe_event_id: event.id 
    });
    
    if (existingOrders.length > 0) {
      console.log(`Event ${event.id} already processed, skipping`);
      return Response.json({ received: true, deduped: true });
    }

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      await handleDepositPaid(base44, event);
    } else if (event.type === 'invoice.paid') {
      await handleInvoicePaid(base44, event);
    } else if (event.type === 'payment_intent.succeeded') {
      await handlePaymentSucceeded(base44, event);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleDepositPaid(base44, event) {
  const session = event.data.object;
  
  console.log('Processing deposit payment:', session.id);

  // Extract customer and shipping info
  const customerDetails = session.customer_details || {};
  const shippingDetails = session.shipping_details || session.shipping || {};
  const address = shippingDetails.address || {};
  
  // Resolve brand
  let brand = session.metadata?.brand || 'UNKNOWN';
  if (brand === 'UNKNOWN') {
    // Check line items for Crugly mention
    const lineItems = session.line_items?.data || [];
    const hasCrugly = lineItems.some(item => 
      item.description?.toLowerCase().includes('crugly')
    );
    brand = hasCrugly ? 'CRUGLY' : 'RUGLY';
  }

  // Resolve order_key
  let orderKey = session.metadata?.order_key || session.invoice || session.id;
  
  // Upsert Customer
  const customerEmail = customerDetails.email || session.metadata?.customer_email;
  const customerPhone = customerDetails.phone || session.metadata?.customer_phone;
  const customerName = customerDetails.name || session.metadata?.customer_name || 'Unknown';

  let customer = null;
  if (customerEmail) {
    const existing = await base44.asServiceRole.entities.Customer.filter({ email: customerEmail });
    customer = existing[0];
  }
  
  if (!customer && customerPhone) {
    const existing = await base44.asServiceRole.entities.Customer.filter({ phone: customerPhone });
    customer = existing[0];
  }

  if (!customer) {
    // Generate new customer ID
    const allCustomers = await base44.asServiceRole.entities.Customer.list();
    const nextNum = allCustomers.length + 1;
    const customerId = `CUST-${String(nextNum).padStart(6, '0')}`;
    
    customer = await base44.asServiceRole.entities.Customer.create({
      customer_id: customerId,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      shipping_address_line1: address.line1 || '',
      shipping_address_line2: address.line2 || '',
      shipping_city: address.city || '',
      shipping_state: address.state || '',
      shipping_postal: address.postal_code || '',
      shipping_country: address.country || ''
    });
  }

  // Upsert Order
  const existingOrders = await base44.asServiceRole.entities.RuglyOrder.filter({ order_key: orderKey });
  let order;

  // Base rug ordering logic for CRUGLY
  let baseRugData = {};
  if (brand === 'CRUGLY') {
    const rugSize = session.metadata?.rug_size || '';
    const baseColor = session.metadata?.base_color || '';
    
    if (rugSize && baseColor) {
      const rugInfo = getBaseRugInfo(rugSize, baseColor);
      if (rugInfo) {
        baseRugData = {
          base_rug_required: true,
          base_rug_sku: rugInfo.sku,
          base_rug_supplier: rugInfo.supplier,
          base_rug_product_url: rugInfo.url,
          base_rug_size: rugSize,
          base_rug_color: baseColor,
          base_rug_qty: 1,
          base_rug_order_status: 'ORDER_TASK_CREATED',
          base_rug_order_by: new Date().toISOString(),
          base_rug_cost_estimate: rugInfo.cost
        };
      } else {
        console.warn(`No SKU mapping found for ${rugSize}|${baseColor}`);
        baseRugData = {
          base_rug_required: true,
          base_rug_size: rugSize,
          base_rug_color: baseColor,
          base_rug_order_status: 'NOT_ORDERED'
        };
      }
    }
  }

  const orderData = {
    order_key: orderKey,
    brand: brand,
    customer_id: customer.customer_id,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    shipping_address_line1: address.line1 || '',
    shipping_address_line2: address.line2 || '',
    shipping_city: address.city || '',
    shipping_state: address.state || '',
    shipping_postal: address.postal_code || '',
    shipping_country: address.country || '',
    deposit_amount: session.amount_total / 100,
    total_amount: session.amount_total / 100,
    paid_deposit_at: new Date().toISOString(),
    payment_stage: 'DEPOSIT_PAID',
    order_status: 'NEW_UNREAD',
    alarm_state: 'SENT',
    stripe_event_id: event.id,
    customer_images_originals: [],
    assets_status: 'MISSING',
    image_requirement_met: false,
    image_type_received: 'UNKNOWN',
    ...baseRugData
  };

  if (existingOrders.length > 0) {
    order = await base44.asServiceRole.entities.RuglyOrder.update(existingOrders[0].id, orderData);
  } else {
    order = await base44.asServiceRole.entities.RuglyOrder.create(orderData);
  }

  console.log('Order created/updated:', order.order_key);

  // ALARM BELLS - Send notifications
  await sendOwnerAlarm(base44, order, 'DEPOSIT_PAID');

  // Base rug ordering alarm (if CRUGLY)
  if (order.base_rug_required && order.base_rug_order_status === 'ORDER_TASK_CREATED') {
    await sendBaseRugOrderingAlarm(base44, order);
  }

  // Start escalation timer (handled by automation)
  
  return order;
}

async function handleInvoicePaid(base44, event) {
  const invoice = event.data.object;
  
  console.log('Processing invoice paid:', invoice.id);

  const orderKey = invoice.id;
  const existingOrders = await base44.asServiceRole.entities.RuglyOrder.filter({ order_key: orderKey });
  
  if (existingOrders.length === 0) {
    console.log('No order found for invoice:', orderKey);
    return;
  }

  const order = await base44.asServiceRole.entities.RuglyOrder.update(existingOrders[0].id, {
    payment_stage: 'PAID_IN_FULL',
    paid_in_full_at: new Date().toISOString(),
    total_amount: invoice.amount_paid / 100,
    stripe_event_id: event.id
  });

  console.log('Order marked paid in full:', order.order_key);

  // Notify owner
  await sendOwnerAlarm(base44, order, 'PAID_IN_FULL');

  return order;
}

async function handlePaymentSucceeded(base44, event) {
  // Backup handler for payment_intent.succeeded
  console.log('Payment intent succeeded:', event.data.object.id);
  // This is a backup - main flow is checkout.session.completed
  return;
}

async function sendOwnerAlarm(base44, order, eventType) {
  const ownerPhone = '5177778474'; // Your phone
  const ownerEmail = 'contact@ruglyfloor.com'; // Your email

  let smsMessage = '';
  let emailSubject = '';
  let emailBody = '';

  if (eventType === 'DEPOSIT_PAID') {
    smsMessage = `DEPOSIT PAID: ${order.brand} — ${order.customer_name} — $${order.deposit_amount} — ${order.order_key} — IMAGES: ${order.assets_status}`;
    emailSubject = `🔔 DEPOSIT PAID: ${order.order_key}`;
    emailBody = `
      Order Key: ${order.order_key}
      Brand: ${order.brand}
      Customer: ${order.customer_name}
      Email: ${order.customer_email}
      Phone: ${order.customer_phone}
      Deposit: $${order.deposit_amount}
      
      Image Status: ${order.assets_status}
      
      Shipping:
      ${order.shipping_address_line1}
      ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal}
      
      Status: ${order.order_status}
      Payment Stage: ${order.payment_stage}
    `;
  } else if (eventType === 'PAID_IN_FULL') {
    smsMessage = `PAID IN FULL: ${order.brand} — ${order.customer_name} — ${order.order_key}`;
    emailSubject = `✅ PAID IN FULL: ${order.order_key}`;
    emailBody = `
      Order Key: ${order.order_key}
      Brand: ${order.brand}
      Customer: ${order.customer_name}
      Total: $${order.total_amount}
      
      Status: ${order.order_status}
    `;
  }

  // Send SMS (using Twilio or similar - for now using email)
  try {
    await base44.integrations.Core.SendEmail({
      to: ownerEmail,
      subject: emailSubject,
      body: emailBody
    });
    console.log('Owner notification sent');
  } catch (error) {
    console.error('Failed to send owner notification:', error);
  }
}

async function sendBaseRugOrderingAlarm(base44, order) {
  const ownerEmail = 'contact@ruglyfloor.com';
  
  const emailSubject = `🚨 ORDER BASE RUG NOW — ${order.order_key}`;
  const emailBody = `
    ORDER BASE RUG IMMEDIATELY
    
    Order: ${order.order_key}
    Customer: ${order.customer_name}
    
    BASE RUG DETAILS:
    Size: ${order.base_rug_size}
    Color: ${order.base_rug_color}
    SKU: ${order.base_rug_sku}
    Qty: ${order.base_rug_qty}
    Est. Cost: $${order.base_rug_cost_estimate}
    
    PRODUCT LINK (CLICK TO ORDER):
    ${order.base_rug_product_url}
    
    SHIP TO YOUR STUDIO:
    ${order.shipping_address_line1}
    ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal}
    
    ⚠️ DEADLINE: TODAY
    Order immediately so stencil + prep can start.
    
    After ordering, mark as ORDERED in dashboard.
  `;

  try {
    await base44.integrations.Core.SendEmail({
      to: ownerEmail,
      subject: emailSubject,
      body: emailBody
    });
    console.log('Base rug ordering alarm sent');
  } catch (error) {
    console.error('Failed to send base rug ordering alarm:', error);
  }
}