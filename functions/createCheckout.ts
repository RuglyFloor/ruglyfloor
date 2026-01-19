import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { cart, customerInfo, designInstructions } = await req.json();
    
    // Debug logging
    console.log('=== CHECKOUT DEBUG ===');
    console.log('Cart items:', JSON.stringify(cart, null, 2));
    console.log('First cart item imageUrl:', cart[0]?.imageUrl);
    console.log('First cart item previewUrl:', cart[0]?.previewUrl);

    if (!cart || cart.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Get highest customer number and UPC
    const allOrders = await base44.asServiceRole.entities.Order.list('-created_date', 100);
    let nextCustomerNum = 10000;
    let nextUpcNum = 10000;

    if (allOrders.length > 0) {
      // Find highest customer number
      const maxCN = allOrders
        .map(o => o.customer_number?.replace('CN', '') || '0')
        .map(n => parseInt(n))
        .filter(n => !isNaN(n))
        .sort((a, b) => b - a)[0];
      
      if (maxCN) nextCustomerNum = maxCN + 1;

      // Find highest UPC across all order items
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

    // Create deposit line item ($100 deposit instead of full price)
    const DEPOSIT_AMOUNT = 100;
    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Custom Rug Deposit',
          description: `Deposit for ${cart.length} custom rug${cart.length > 1 ? 's' : ''} (Balance due before shipping)`,
          images: cart[0]?.previewUrl ? [cart[0].previewUrl] : [],
        },
        unit_amount: DEPOSIT_AMOUNT * 100, // $100 in cents
      },
      quantity: 1,
    }];

    // Note: Shipping will be charged with the balance due

    // Create order record first - map cart items to order item format
    const orderNumber = 'RUG-' + Date.now();
    const orderItems = cart.map((item, idx) => {
      console.log('Mapping cart item:', item.name);
      console.log('  - imageUrl:', item.imageUrl);
      console.log('  - previewUrl:', item.previewUrl);
      
      const upc = `UP${nextUpcNum + idx}`;
      const serialNumber = `${customerNumber}-${upc}`;
      
      return {
        type: item.type,
        product_id: item.id || '',
        name: item.name,
        upc: upc,
        serial_number: serialNumber,
        size: item.size,
        base_color: item.baseColor || '',
        paint_color: item.paintColor || '',
        second_paint_color: item.secondPaintColor || '',
        design_instructions: item.designInstructions || '',
        image_url: item.imageUrl || '',
        preview_url: item.previewUrl || '',
        num_colors: item.numColors || 0,
        price: item.price,
        original_upload_url: item.previewUrl || item.imageUrl || '',
        processed_image_url: item.previewUrl || item.imageUrl || '',
        ai_preview_url: item.previewUrl || item.imageUrl || '',
        image_processing_status: 'completed'
      };
    });
    
    console.log('Order items created:', JSON.stringify(orderItems, null, 2));

    // Get time on site and referrer
    const timeOnSite = customerInfo.timeOnSite || 0;
    const referrerSource = customerInfo.referrerSource || 'direct';

    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      customer_number: customerNumber,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone || '',
      shipping_address: {
        street: customerInfo.shipping?.street || customerInfo.street || '',
        city: customerInfo.shipping?.city || customerInfo.city || '',
        state: customerInfo.shipping?.state || customerInfo.state || '',
        zip: customerInfo.shipping?.zip || customerInfo.zip || '',
        country: customerInfo.shipping?.country || customerInfo.country || 'USA'
      },
      items: orderItems,
      total_amount: cart.reduce((sum, item) => sum + item.price, 0) + shippingCost,
      status: 'pending',
      payment_status: 'pending',
      notes: designInstructions || '',
      time_on_site: timeOnSite,
      referrer_source: referrerSource
    });

    // Log order to Notion
    try {
      await base44.asServiceRole.functions.invoke('logOrderToNotion', {
        orderData: order
      });
    } catch (notionError) {
      console.error('Failed to log to Notion (non-critical):', notionError);
    }

    // Create Stripe checkout session
    const origin = req.headers.get('origin') || 'https://ruglyfloors.com';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/Success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/Cart?canceled=true`,
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
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message || 'Failed to create checkout session',
      details: error.message
    }, { status: 500 });
  }
});