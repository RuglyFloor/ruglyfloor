import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { to, message } = await req.json();

    if (!to || !message) {
      return Response.json({ error: 'Missing required fields: to, message' }, { status: 400 });
    }

    const apiKey = Deno.env.get('QUO_API_KEY');
    const phoneNumberId = Deno.env.get('QUO_PHONE_NUMBER_ID');

    if (!apiKey || !phoneNumberId) {
      return Response.json({ error: 'Quo API credentials not configured' }, { status: 500 });
    }

    // Normalize phone number to E.164
    let phone = to.replace(/\D/g, '');
    if (phone.length === 10) phone = '+1' + phone;
    else if (!phone.startsWith('+')) phone = '+' + phone;
    else phone = '+' + phone.replace(/^\+/, '');

    console.log(`Sending SMS to ${phone} via Quo`);

    const response = await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        from: phoneNumberId,
        to: [phone],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Quo API error:', JSON.stringify(result));
      return Response.json({ error: result?.message || 'Failed to send SMS' }, { status: response.status });
    }

    console.log('SMS sent successfully:', result?.data?.id);
    return Response.json({ success: true, messageId: result?.data?.id });
  } catch (error) {
    console.error('sendSMS error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});