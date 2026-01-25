import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code, orderAmount } = await req.json();

    if (!code) {
      return Response.json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
    }

    // Find coupon by code (case-insensitive)
    const coupons = await base44.asServiceRole.entities.Coupon.filter({
      code: code.toUpperCase()
    });

    if (coupons.length === 0) {
      return Response.json({ valid: false, error: 'Invalid coupon code' });
    }

    const coupon = coupons[0];

    // Check if active
    if (!coupon.is_active) {
      return Response.json({ valid: false, error: 'This coupon is no longer active' });
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return Response.json({ valid: false, error: 'This coupon has expired' });
    }

    // Check max uses
    if (coupon.max_uses && coupon.times_used >= coupon.max_uses) {
      return Response.json({ valid: false, error: 'This coupon has reached its usage limit' });
    }

    // Check minimum order amount
    if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) {
      return Response.json({ 
        valid: false, 
        error: `Minimum order amount of $${coupon.min_order_amount} required` 
      });
    }

    // Calculate discount
    let discountAmount;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderAmount * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount);

    return Response.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      },
      discount_amount: Math.round(discountAmount * 100) / 100,
      final_amount: Math.round((orderAmount - discountAmount) * 100) / 100
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return Response.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 });
  }
});