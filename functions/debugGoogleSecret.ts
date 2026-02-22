import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const merchantId = Deno.env.get('GOOGLE_MERCHANT_ID');
    const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');

    if (!saJson) {
      return Response.json({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON is not set' });
    }

    let sa;
    try {
      sa = JSON.parse(saJson);
    } catch (e) {
      return Response.json({ error: 'JSON parse failed: ' + e.message, rawLength: saJson.length, preview: saJson.slice(0, 200) });
    }

    return Response.json({
      merchantId,
      saKeys: Object.keys(sa),
      hasPrivateKey: !!sa.private_key,
      privateKeyStart: sa.private_key ? sa.private_key.slice(0, 50) : 'MISSING',
      clientEmail: sa.client_email || 'MISSING'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});