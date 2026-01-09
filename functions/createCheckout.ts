import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cart, customerInfo } = await req.json();

    if (!cart || cart.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate shipping
    const calculateShipping = (cart) => {
      if (cart.length >= 2) return 0; // Free shipping for 2+ items
      
      const item = cart[0];
      const size = item.size.toLowerCase();
      
      // Small, Medium, and Round: $29
      if (size.includes('small') || size.includes('medium') || size.includes('round') || size.includes('4x6') || size.includes('5x7')) {
        return 29;
      }
      // Large: $59
      if (size.includes('large') || size.includes('8x10')) {
        return 59;
      }
      // Huge: $99
      if (size.includes('huge') || size.includes('9x11')) {
        return 99;
      }
      
      return 29; // Default to small shipping
    };

    const shippingCost = calculateShipping(cart);

    // Create line items for Stripe
    const lineItems = cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.type === 'custom' 
            ? `Custom ${item.size} rug - ${item.baseColor} base with ${item.paintColor} paint${item.is3D ? ' (3-D Effect)' : ''}` 
            : item.description || '',
          images: item.previewUrl ? [item.previewUrl] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: 1,
    }));

    // Add shipping line item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: 'Ground shipping within the US',
          },
          unit_amount: shippingCost * 100,
        },
        quantity: 1,
      });
    }

    // Create order record first
    const orderNumber = 'RUG-' + Date.now();
    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone || '',
      shipping_address: {
        street: customerInfo.street,
        city: customerInfo.city,
        state: customerInfo.state || '',
        zip: customerInfo.zip || '',
        country: customerInfo.country || 'USA'
      },
      items: cart,
      total_amount: cart.reduce((sum, item) => sum + item.price, 0) + shippingCost,
      status: 'pending',
      payment_status: 'pending'
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/Orders?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${req.headers.get('origin')}/Cart?canceled=true`,
      customer_email: customerInfo.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        order_id: order.id,
        order_number: orderNumber
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      }
    });

    return Response.json({ 
      sessionId: session.id,
      url: session.url,
      orderId: order.id
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create checkout session' 
    }, { status: 500 });
  }
});