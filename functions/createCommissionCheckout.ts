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

    if (!formData.agreedToDeposit) {
      return Response.json({ error: 'Must agree to deposit terms' }, { status: 400 });
    }

    const orderNumber = 'COMM-' + Date.now();
    let depositAmount = 300;
    const rushFee = formData.rushOrder ? 159 : 0;
    let couponDiscount = 0;
    let appliedCoupon = null;

    // Apply coupon if provided
    if (couponCode) {
      const couponValidation = await base44.asServiceRole.functions.invoke('validateCoupon', {
        code: couponCode,
        orderAmount: depositAmount
      });

      if (couponValidation.data.valid) {
        appliedCoupon = couponValidation.data.coupon;
        couponDiscount = couponValidation.data.discount_amount;
        depositAmount = couponValidation.data.final_amount;

        // Increment coupon usage
        await base44.asServiceRole.entities.Coupon.update(appliedCoupon.id, {
          times_used: (await base44.asServiceRole.entities.Coupon.filter({ id: appliedCoupon.id }))[0].times_used + 1
        });
      }
    }

    const totalDeposit = depositAmount + rushFee;

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
        name: 'Custom Commission - Deposit',
        price: depositAmount
      }
    ];

    if (formData.rushOrder) {
      items.push({
        type: 'commission',
        name: 'Rush Order Fee',
        price: rushFee
      });
    }

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
        rushOrder: formData.rushOrder || false,
        depositAmount: depositAmount,
        rushFee: rushFee
      })
    });

    console.log('Order created:', order);

    // Create Stripe line items
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Rugley Commission Deposit' + (appliedCoupon ? ` (${appliedCoupon.code} applied)` : ''),
            description: 'Deposit for custom commission estimate and design mockup',
            images: formData.inspirationImages?.[0] ? [formData.inspirationImages[0]] : [],
          },
          unit_amount: Math.round(depositAmount * 100), // in cents
        },
        quantity: 1,
      }
    ];

    if (formData.rushOrder) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Rush Order Fee',
            description: '1 week production + shipping',
          },
          unit_amount: rushFee * 100, // $159 in cents
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const origin = req.headers.get('origin') || 'https://ruglyfloors.com';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/Success?session_id={CHECKOUT_SESSION_ID}&type=commission`,
      cancel_url: `${origin}/Commission?canceled=true`,
      customer_email: formData.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        order_id: order.id,
        order_number: orderNumber,
        order_type: 'commission'
      }
    });

    console.log('Stripe session created:', session.id);

    // Notify admin of new commission request
    try {
      await base44.asServiceRole.functions.invoke('notifyNewOrder', { 
        orderData: order
      });
    } catch (notifyError) {
      console.error('Failed to notify admin (non-critical):', notifyError);
    }

    return Response.json({ 
      sessionId: session.id,
      url: session.url,
      orderId: order.id
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