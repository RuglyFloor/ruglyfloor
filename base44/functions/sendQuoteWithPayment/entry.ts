import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { quote_id } = await req.json();

    if (!quote_id) {
      return Response.json({ error: 'Missing quote_id' }, { status: 400 });
    }

    // Fetch the quote
    const quote = await base44.asServiceRole.entities.DesignQuote.get(quote_id);
    if (!quote) {
      return Response.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!quote.quoted_price || quote.quoted_price <= 0) {
      return Response.json({ error: 'Set a quoted price before sending.' }, { status: 400 });
    }

    const appId = Deno.env.get('BASE44_APP_ID');
    const baseUrl = 'https://ruglyfloor.com';

    // Build a description for the line item
    let description = `${quote.tier_label} Custom Rug`;
    if (quote.design_type === 'squares' && quote.squares_grid_data) {
      const g = quote.squares_grid_data;
      description = `Custom Squares — ${g.cols}×${g.rows} tiles (${g.totalSqFt} sq ft)`;
    } else if (quote.size_label) {
      description = `${quote.tier_label} Custom Rug — ${quote.size_label}`;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: quote.customer_email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(quote.quoted_price * 100),
            product_data: {
              name: description,
              description: quote.design_instructions || 'Custom hand-painted rug by Rugly Floor',
              images: quote.ai_preview_url ? [quote.ai_preview_url] : (quote.image_url ? [quote.image_url] : []),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/Success?session_id={CHECKOUT_SESSION_ID}&quote_id=${quote.id}`,
      cancel_url: `${baseUrl}/QuoteView?id=${quote.id}`,
      metadata: {
        base44_app_id: appId,
        quote_id: quote.id,
        service_type: 'design_quote',
        customer_name: quote.customer_name,
      },
    });

    // Update the quote record
    await base44.asServiceRole.entities.DesignQuote.update(quote.id, {
      status: 'quoted',
      quoted_price: quote.quoted_price,
      stripe_payment_link: session.url,
      stripe_checkout_session_id: session.id,
      quote_sent_at: new Date().toISOString(),
    });

    // Send email to customer
    // Show AI preview first, fallback to uploaded image
    const previewImgUrl = quote.ai_preview_url || quote.image_url || null;
    const previewLabel = quote.ai_preview_url ? 'Your AI Design Preview' : 'Your Uploaded Design';
    const previewLine = previewImgUrl
      ? `<tr><td style="padding:16px 0;text-align:center;">
           <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-style:italic;">${previewLabel}</p>
           <img src="${previewImgUrl}" alt="${previewLabel}" style="max-width:100%;border-radius:12px;border:2px solid #e5e7eb;box-shadow:0 4px 16px rgba(0,0,0,0.1);" />
         </td></tr>`
      : '';

    const g = quote.squares_grid_data;
    const designDetails = [
      quote.size_label && `<li><strong>Size:</strong> ${quote.size_label}</li>`,
      quote.base_color_name && `<li><strong>Base Color:</strong> ${quote.base_color_name}</li>`,
      quote.paint_color_name && `<li><strong>Paint Color:</strong> ${quote.paint_color_name}</li>`,
      quote.second_paint_color_name && `<li><strong>2nd Color:</strong> ${quote.second_paint_color_name}</li>`,
      g && `<li><strong>Grid Size:</strong> ${g.cols}×${g.rows} tiles</li>`,
      g && `<li><strong>Total Tiles:</strong> ${g.totalTiles} tiles (${g.totalSqFt} sq ft)</li>`,
      g && g.numPaintColors && `<li><strong>Paint Colors:</strong> ${g.numPaintColors}</li>`,
      g && g.surfaceType && `<li><strong>Surface Type:</strong> ${g.surfaceType}</li>`,
      quote.design_instructions && `<li><strong>Your Notes:</strong> ${quote.design_instructions}</li>`,
    ].filter(Boolean).join('');

    const notesSection = quote.admin_notes
      ? `<tr><td style="background:#f8fafc;border-radius:10px;padding:14px 18px;color:#475569;font-size:14px;margin-bottom:16px;"><strong>Note from our team:</strong> ${quote.admin_notes}</td></tr>`
      : '';

    const emailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#343634;padding:28px 32px;text-align:center;">
          <img src="https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/938135f33_RUGLYMASTERLOGOsmall.png" alt="Rugly" height="48" style="display:block;margin:0 auto 8px;" />
          <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;">YOUR QUOTE IS READY</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:16px;color:#343634;padding-bottom:16px;">
              Hi <strong>${quote.customer_name}</strong>,<br><br>
              Great news — we've reviewed your custom design and we're excited to bring it to life!
            </td></tr>

            ${previewLine}

            <!-- Price Box -->
            <tr><td style="padding:20px 0;">
              <div style="background:#343634;border-radius:12px;padding:20px 24px;text-align:center;">
                <div style="color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Your Quote</div>
                <div style="color:#ffffff;font-size:42px;font-weight:900;letter-spacing:-1px;">$${quote.quoted_price.toFixed(2)}</div>
                <div style="color:#9ca3af;font-size:13px;margin-top:4px;">${description}</div>
              </div>
            </td></tr>

            <!-- Design Details -->
            ${designDetails ? `<tr><td style="padding-bottom:20px;"><ul style="color:#374151;font-size:14px;padding-left:20px;margin:0;">${designDetails}</ul></td></tr>` : ''}

            ${notesSection}

            <!-- CTA Button -->
            <tr><td style="padding:24px 0;text-align:center;">
              <a href="${session.url}" style="display:inline-block;background:#f04624;color:#ffffff;font-weight:900;font-size:18px;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
                💳 Pay Now — $${quote.quoted_price.toFixed(2)}
              </a>
              <br><br>
              <span style="color:#9ca3af;font-size:12px;">Secure checkout powered by Stripe. This link expires in 24 hours.</span>
            </td></tr>

            <!-- Footer note -->
            <tr><td style="border-top:1px solid #e5e7eb;padding-top:20px;color:#6b7280;font-size:13px;text-align:center;">
              Questions? Reply to this email or contact us at <a href="mailto:info@ruglyfloor.com" style="color:#4075ff;">info@ruglyfloor.com</a><br>
              <span style="font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} Rugly Floor</span>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rugly Floor <info@ruglyfloor.com>',
        to: [quote.customer_email],
        subject: `Your Custom Rugly Quote — $${quote.quoted_price.toFixed(2)} · Pay Now`,
        html: emailBody,
      }),
    });

    if (!resendRes.ok) {
      const resendErr = await resendRes.text();
      console.error('[sendQuoteWithPayment] Resend error:', resendErr);
      throw new Error(`Email send failed: ${resendErr}`);
    }

    console.log('[sendQuoteWithPayment] Quote sent:', quote.id, 'Session:', session.id);
    return Response.json({ success: true, payment_url: session.url, session_id: session.id });

  } catch (error) {
    console.error('[sendQuoteWithPayment] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});