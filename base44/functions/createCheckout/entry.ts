import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { cart, customerInfo, designInstructions, couponCode, smsConsent } = await req.json();

    console.log('=== CHECKOUT START ===');
    console.log('Cart items:', cart?.length);
    console.log('Customer email:', customerInfo?.email);
    console.log('Customer phone:', customerInfo?.phone);

    if (!cart || cart.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customerInfo?.email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!customerInfo?.phone) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Get highest customer number
    const allOrders = await base44.asServiceRole.entities.Order.list('-created_date', 100);
    let nextCustomerNum = 10000;
    let nextUpcNum = 10000;

    if (allOrders.length > 0) {
      const maxCN = allOrders
        .map(o => o.customer_number?.replace('CN', '') || '0')
        .map(n => parseInt(n))
        .filter(n => !isNaN(n))
        .sort((a, b) => b - a)[0];
      if (maxCN) nextCustomerNum = maxCN + 1;

      const allUpcs = allOrders
        .flatMap(o => o.items || [])
        .map(item => item.upc?.replace('UP', '') || '0')
        .map(n => parseInt(n))
        .filter(n => !isNaN(n))
        .sort((a, b) => b - a)[0];
      if (allUpcs) nextUpcNum = allUpcs + 1;
    }

    const customerNumber = `CN${nextCustomerNum}`;

    // Calculate shipping
    const calculateShipping = (cartItems) => {
      let totalShipping = 0;
      for (const item of cartItems) {
        if (item.qualityTier === 'crugly' || item.qualityTier === 'budget') continue; // free
        if (item.qualityTier === 'rugly' || item.qualityTier === 'good') {
          const sizeId = item.sizeMeasurement || item.size || '';
          if (sizeId.includes('2x3') || sizeId.includes("2'")) totalShipping += 10;
          else if (sizeId.includes('3x5') || sizeId.includes("3'")) totalShipping += 20;
          else if (sizeId.includes('4x6') || sizeId.includes("4'")) totalShipping += 30;
          else if (sizeId.includes('5x7') || sizeId.includes("5'")) totalShipping += 40;
          else if (sizeId.includes('6x9') || sizeId.includes("6'")) totalShipping += 50;
          else totalShipping += 25;
        }
        // rugly_lx / highend — shipping quoted at completion, not charged upfront
      }
      return totalShipping;
    };

    const shippingCost = calculateShipping(cart);
    const hasUpfrontPaymentItems = cart.some(item =>
      item.qualityTier === 'crugly' || item.qualityTier === 'budget' ||
      item.qualityTier === 'rugly' || item.qualityTier === 'good'
    );

    const totalRugPrice = cart.reduce((sum, item) => sum + item.price, 0);
    let paymentAmount = hasUpfrontPaymentItems ? totalRugPrice + shippingCost : 100;
    let couponDiscount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      try {
        const couponValidation = await base44.asServiceRole.functions.invoke('validateCoupon', {
          code: couponCode,
          orderAmount: paymentAmount
        });
        if (couponValidation.data?.valid) {
          appliedCoupon = couponValidation.data.coupon;
          couponDiscount = couponValidation.data.discount_amount;
          paymentAmount = couponValidation.data.final_amount;
          await base44.asServiceRole.entities.Coupon.update(appliedCoupon.id, {
            times_used: ((await base44.asServiceRole.entities.Coupon.filter({ id: appliedCoupon.id }))[0]?.times_used || 0) + 1
          });
        }
      } catch (couponErr) {
        console.error('Coupon validation failed (non-critical):', couponErr.message);
      }
    }

    // Build line items for Stripe
    const firstPreviewUrl = cart[0]?.aiPreviewUrl || cart[0]?.previewUrl || cart[0]?.imageUrl || null;
    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: hasUpfrontPaymentItems
            ? `Custom Rug${cart.length > 1 ? 's' : ''} — Full Payment${appliedCoupon ? ` (${appliedCoupon.code})` : ''}`
            : `Custom Rug Deposit${appliedCoupon ? ` (${appliedCoupon.code})` : ''}`,
          description: cart.map(item =>
            `${item.qualityLabel || item.qualityTier} · ${item.size} · Base: ${item.baseColor || 'N/A'} · Paint: ${item.paintColor || 'N/A'}${item.hasSecondColor ? ` + ${item.secondPaintColor || '2nd color'}` : ''}`
          ).join(' | '),
          images: firstPreviewUrl ? [firstPreviewUrl] : [],
        },
        unit_amount: Math.round(paymentAmount * 100),
      },
      quantity: 1,
    }];

    // Build order items with ALL captured data
    const orderNumber = 'RUG-' + Date.now();
    const orderItems = cart.map((item, idx) => {
      const upc = `UP${nextUpcNum + idx}`;
      return {
        type: item.type || 'custom',
        product_id: item.id || '',
        name: item.name,
        upc,
        serial_number: `${customerNumber}-${upc}`,
        // Size
        size: item.size || '',
        size_measurement: item.sizeMeasurement || item.size || '',
        // Quality
        qualityTier: item.qualityTier || '',
        qualityLabel: item.qualityLabel || '',
        // Colors — full detail
        base_color: item.baseColor || '',
        base_color_hex: item.baseColorHex || '',
        paint_color: item.paintColor || '',
        paint_color_hex: item.paintColorHex || '',
        has_second_color: item.hasSecondColor || false,
        second_paint_color: item.secondPaintColor || '',
        second_paint_color_hex: item.secondPaintColorHex || '',
        // Images — original upload AND AI preview both captured
        image_url: item.originalUploadUrl || item.imageUrl || '',
        original_upload_url: item.originalUploadUrl || item.imageUrl || '',
        ai_preview_url: item.aiPreviewUrl || item.previewUrl || '',
        preview_url: item.previewUrl || item.aiPreviewUrl || item.imageUrl || '',
        // Extra
        design_instructions: item.designInstructions || designInstructions || '',
        price: item.price,
        image_processing_status: 'pending_review'
      };
    });

    console.log('Order items sample:', JSON.stringify(orderItems[0], null, 2));

    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      customer_number: customerNumber,
      customer_name: customerInfo.name || '',
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone || '',
      sms_consent: smsConsent || false,
      shipping_address: {
        street: customerInfo.street || '',
        city: customerInfo.city || '',
        state: customerInfo.state || '',
        zip: customerInfo.zip || '',
        country: customerInfo.country || 'USA'
      },
      items: orderItems,
      total_amount: totalRugPrice + shippingCost,
      status: 'pending_payment',
      notes: designInstructions || '',
      time_on_site: customerInfo.timeOnSite || 0,
      referrer_source: customerInfo.referrerSource || 'direct'
    });

    console.log('Order created:', order.id, orderNumber);

    // Log to Notion (non-critical)
    try {
      await base44.asServiceRole.functions.invoke('logOrderToNotion', { orderData: order });
    } catch (notionError) {
      console.error('Notion log failed (non-critical):', notionError.message);
    }

    // === IMMEDIATE OWNER ALERT (backup — fires even before payment is confirmed) ===
    try {
      const itemSummary = orderItems.map(i =>
        `• ${i.qualityLabel || i.qualityTier} — ${i.size} — Base: ${i.base_color || 'N/A'} — Paint: ${i.paint_color || 'N/A'}${i.has_second_color ? ` + ${i.second_paint_color}` : ''} — $${i.price}`
      ).join('\n');
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'contact@ruglyfloor.com',
        from_name: 'Rugly Order System',
        subject: `⚡ CHECKOUT STARTED: ${orderNumber} — ${customerInfo.name} — $${paymentAmount}`,
        body: `CHECKOUT IN PROGRESS — CUSTOMER HEADING TO STRIPE\n\nOrder #: ${orderNumber}\nCustomer: ${customerInfo.name}\nEmail: ${customerInfo.email}\nPhone: ${customerInfo.phone}\nAmount: $${paymentAmount}\n\nItems:\n${itemSummary}\n\nPayment NOT yet confirmed. You will get a second email when Stripe confirms payment.\n\nView in Admin: https://ruglyfloor.com/AdminOrders`
      });
      console.log('Owner checkout-start alert sent');
    } catch (alertErr) {
      console.error('Owner alert failed (non-critical):', alertErr.message);
    }

    // Create Stripe checkout session
    const originHeader = req.headers.get('origin') || req.headers.get('referer') || '';
    const origin = originHeader.startsWith('http') 
      ? new URL(originHeader).origin 
      : 'https://ruglyfloor.com';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/Success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/Cart?canceled=true`,
      customer_email: customerInfo.email,
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        order_id: order.id,
        order_number: orderNumber,
        customer_phone: customerInfo.phone || '',
      },
      custom_text: {
        submit: {
          message: 'Each rug is hand-painted to order. If it arrives damaged or with quality issues, we make it right — full replacement or refund.'
        }
      }
    });

    console.log('Stripe session created:', session.id);

    return Response.json({
      sessionId: session.id,
      url: session.url,
      orderId: order.id
    });

  } catch (error) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({
      error: error.message || 'Failed to create checkout session',
    }, { status: 500 });
  }
});