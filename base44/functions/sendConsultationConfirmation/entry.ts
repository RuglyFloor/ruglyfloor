import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      name, email, phone, preferred_time, duration,
      idea_description, visualizer_share_url, visualizer_preview_url,
      preferred_size, budget_range
    } = body;

    if (!email || !name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const timeFormatted = preferred_time
      ? new Date(preferred_time).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Detroit' })
      : 'TBD';

    const durationLabel = duration === '15min' ? '15-Minute Quick Check-In' : '30-Minute Design Consultation';

    const previewSection = visualizer_preview_url
      ? `<div style="margin: 16px 0;"><img src="${visualizer_preview_url}" alt="Your Visualizer Design" style="max-width: 360px; border-radius: 10px; border: 2px solid #e0e0e0;" /></div>`
      : '';

    const visualizerLink = visualizer_share_url
      ? `<p style="margin-top:8px;"><a href="${visualizer_share_url}" style="color:#f04624;font-weight:bold;">View your Visualizer design →</a></p>`
      : '';

    const summaryRows = [
      preferred_size && `<tr><td style="color:#888;padding:6px 12px 6px 0;font-size:0.85rem;">Preferred Size</td><td style="font-weight:700;font-size:0.85rem;">${preferred_size}</td></tr>`,
      budget_range && `<tr><td style="color:#888;padding:6px 12px 6px 0;font-size:0.85rem;">Budget</td><td style="font-weight:700;font-size:0.85rem;">${budget_range}</td></tr>`,
      idea_description && `<tr><td style="color:#888;padding:6px 12px 6px 0;font-size:0.85rem;vertical-align:top;">Your Idea</td><td style="font-size:0.85rem;font-style:italic;">"${idea_description}"</td></tr>`,
    ].filter(Boolean).join('');

    const body_html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{font-family:'Roboto',Arial,sans-serif;background:#f8f6f2;margin:0;padding:0;} .container{max-width:560px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #e0e0e0;} .header{background:#0f0f0f;padding:28px 32px;text-align:center;} .brand{font-size:1.8rem;font-weight:900;color:#f04624;letter-spacing:0.08em;font-family:Arial,sans-serif;} .subtitle{font-size:0.75rem;color:#666;letter-spacing:0.15em;margin-top:4px;} .body{padding:32px;} h1{font-size:1.6rem;font-weight:900;color:#1a1a1a;margin-bottom:8px;letter-spacing:0.03em;} p{color:#555;line-height:1.7;font-size:0.9rem;margin-bottom:12px;} .highlight-box{background:#0f0f0f;border-radius:12px;padding:20px 24px;margin:20px 0;} .hl-label{color:#666;font-size:0.7rem;letter-spacing:0.12em;margin-bottom:4px;} .hl-value{color:#f04624;font-size:1.3rem;font-weight:900;letter-spacing:0.04em;} .next-steps{margin:24px 0;} .step{display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;} .step-num{width:24px;height:24px;border-radius:50%;background:#f04624;color:white;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:900;flex-shrink:0;} .footer{background:#f8f6f2;padding:20px 32px;text-align:center;font-size:0.78rem;color:#aaa;border-top:1px solid #e0e0e0;}</style></head>
<body>
<div class="container">
  <div class="header">
    <div class="brand">RUGLY</div>
    <div class="subtitle">DESIGN CONSULTATION CONFIRMED</div>
  </div>
  <div class="body">
    <h1>You're booked, ${name}! 🎨</h1>
    <p>Ryan Hensley is looking forward to discussing your custom rug design. Here are your booking details:</p>

    <div class="highlight-box">
      <div class="hl-label">YOUR CONSULTATION</div>
      <div class="hl-value">${timeFormatted}</div>
      <div style="color:#888;font-size:0.82rem;margin-top:4px;">${durationLabel} · Zoom (link coming soon)</div>
    </div>

    ${previewSection}
    ${visualizerLink}

    ${summaryRows ? `
    <div style="margin:20px 0;">
      <div style="font-size:0.72rem;color:#aaa;letter-spacing:0.1em;margin-bottom:10px;">YOUR SUBMISSION SUMMARY</div>
      <table style="border-collapse:collapse;width:100%;">${summaryRows}</table>
    </div>` : ''}

    <div class="next-steps">
      <div style="font-size:0.72rem;color:#aaa;letter-spacing:0.1em;margin-bottom:12px;">WHAT HAPPENS NEXT</div>
      ${['Ryan will review your design details before your call', 'A Zoom link will be emailed to you before your scheduled time', 'On the call: you\'ll discuss your vision, finalize specs, and get pricing', 'After the call: Ryan sends a full quote within 24 hours'].map((item, i) => `
      <div class="step">
        <div class="step-num">${i + 1}</div>
        <div style="font-size:0.85rem;color:#444;line-height:1.5;">${item}</div>
      </div>`).join('')}
    </div>

    <p style="margin-top:20px;font-size:0.82rem;">Questions? Reply to this email or text/call Ryan at <strong>(517) 500-0780</strong>.</p>
  </div>
  <div class="footer">
    Rugly Floor · Lansing, Michigan · <a href="https://ruglyfloor.com" style="color:#f04624;">ruglyfloor.com</a>
  </div>
</div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `✅ Consultation Confirmed — ${timeFormatted} with Ryan Hensley`,
      body: body_html,
      from_name: 'Rugly Design Studio'
    });

    // Also notify Ryan
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'info@ruglyfloor.com',
      subject: `🗓 New Consultation Booked — ${name} — ${timeFormatted}`,
      body: `<p><strong>${name}</strong> (${email} / ${phone}) booked a ${durationLabel} for <strong>${timeFormatted}</strong>.</p>${idea_description ? `<p>Idea: ${idea_description}</p>` : ''}${visualizer_share_url ? `<p><a href="${visualizer_share_url}">View their Visualizer design</a></p>` : ''}`,
      from_name: 'Rugly Booking System'
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Confirmation email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});