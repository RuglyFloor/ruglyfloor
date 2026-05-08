import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const quote = await base44.asServiceRole.entities.DesignQuote.create({
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone || '',
      design_type: body.design_type,
      tier_id: body.tier_id,
      tier_label: body.tier_label,
      size_label: body.size_label || '',
      size_measurement: body.size_measurement || '',
      base_color_name: body.base_color_name || '',
      base_color_hex: body.base_color_hex || '',
      paint_color_name: body.paint_color_name || '',
      paint_color_hex: body.paint_color_hex || '',
      has_second_color: body.has_second_color || false,
      second_paint_color_name: body.second_paint_color_name || '',
      second_paint_color_hex: body.second_paint_color_hex || '',
      image_url: body.image_url || '',
      ai_preview_url: body.ai_preview_url || '',
      design_instructions: body.design_instructions || '',
      squares_grid_data: body.squares_grid_data || null,
      estimated_price: body.estimated_price || 0,
      status: 'pending',
    });

    // Notify admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'info@ruglyfloor.com',
      subject: `New Quote Request from ${body.customer_name}`,
      body: `
New design quote request received!

Customer: ${body.customer_name}
Email: ${body.customer_email}
Phone: ${body.customer_phone || 'N/A'}

Design Type: ${body.design_type}
Tier: ${body.tier_label}
${body.size_label ? `Size: ${body.size_label}` : ''}
${body.base_color_name ? `Base Color: ${body.base_color_name}` : ''}
${body.paint_color_name ? `Paint Color: ${body.paint_color_name}` : ''}
Estimated Price: $${body.estimated_price || 0}

${body.design_instructions ? `Instructions: ${body.design_instructions}` : ''}

View in Admin: https://ruglyfloor.com/AdminQuotes
      `.trim(),
    });

    // Confirm to customer
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: body.customer_email,
      from_name: 'Rugly Floor',
      subject: 'We received your custom design request!',
      body: `
Hi ${body.customer_name},

Thanks for submitting your custom ${body.tier_label} design request to Rugly Floor!

We'll review your design and send you a quote within 1–2 business days.

${body.design_instructions ? `Your notes: "${body.design_instructions}"` : ''}

Questions? Reply to this email or reach us at info@ruglyfloor.com.

— The Rugly Team
      `.trim(),
    });

    return Response.json({ success: true, quote_id: quote.id });
  } catch (error) {
    console.error('requestDesignQuote error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});