import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { formData, couponCode } = await req.json();
    
    console.log('=== COMMISSION CHECKOUT DEBUG ===');
    console.log('Form data:', JSON.stringify(formData, null, 2));

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      return Response.json({ error: 'Missing required contact information' }, { status: 400 });
    }

    if (!formData.description) {
      return Response.json({ error: 'Missing design description' }, { status: 400 });
    }

    const orderNumber = 'COMM-' + Date.now();
    const totalDeposit = 0; // Free commission

    // Get highest customer number
    const allOrders = await base44.asServiceRole.entities.Order.list('-created_date', 100);
    let nextCustomerNum = 10000;

    if (allOrders.length > 0) {
      const maxCN = allOrders
        .map(o => o.customer_number?.replace('CN', '') || '0')
        .map(n => parseInt(n))
        .filter(n => !isNaN(n))
        .sort((a, b) => b - a)[0];
      
      if (maxCN) nextCustomerNum = maxCN + 1;
    }

    const customerNumber = `CN${nextCustomerNum}`;

    // Create order items
    const items = [
      {
        type: 'commission',
        name: 'Custom Commission Request',
        price: 0
      }
    ];

    // Create order record
    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      customer_number: customerNumber,
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      total_amount: totalDeposit,
      status: 'pending',
      payment_status: 'pending',
      items: items,
      notes: JSON.stringify({
        type: 'commission',
        inspirationImages: formData.inspirationImages || [],
        description: formData.description,
        preferredSize: formData.preferredSize || '',
        preferredColors: formData.preferredColors || '',
        numColors: formData.numColors || '',
        budgetRange: formData.budgetRange || '',
        projectType: formData.projectType || 'residential',
        businessName: formData.businessName || '',
        rushOrder: formData.rushOrder || false
      })
    });

    console.log('Order created:', order);

    // Notify admin of new commission request
    try {
      await base44.asServiceRole.functions.invoke('notifyNewOrder', { 
        orderData: order
      });
    } catch (notifyError) {
      console.error('Failed to notify admin (non-critical):', notifyError);
    }

    return Response.json({ 
      orderId: order.id,
      success: true
    });

  } catch (error) {
    console.error('Commission checkout error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message || 'Failed to create checkout session',
      details: error.message
    }, { status: 500 });
  }
});