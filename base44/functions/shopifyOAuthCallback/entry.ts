import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    const shopDomain = (Deno.env.get('SHOPIFY_SHOP_DOMAIN') || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    const clientId = Deno.env.get('SHOPIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SHOPIFY_CLIENT_SECRET');

    // Step 1: Redirect to Shopify OAuth
    if (action === 'start') {
      const redirectUri = `${url.origin}/shopifyOAuthCallback?action=callback`;
      const scopes = 'write_products,read_products';
      const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=rugly_auth`;
      return Response.redirect(authUrl, 302);
    }

    // Step 2: Handle callback and exchange code for token
    if (action === 'callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Missing code parameter', { status: 400 });
      }

      const tokenRes = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        return new Response(`Token exchange failed: ${JSON.stringify(tokenData)}`, { status: 400 });
      }

      const token = tokenData.access_token;

      // Return the token in a simple page so admin can copy it
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Shopify Auth Success</title>
        <style>body{font-family:sans-serif;max-width:600px;margin:60px auto;padding:20px;}
        .token{background:#f0f0f0;padding:16px;border-radius:8px;word-break:break-all;font-family:monospace;font-size:14px;}
        h2{color:#2a7a2a;}</style></head>
        <body>
          <h2>✅ Authorization Successful!</h2>
          <p>Copy this token and save it as your <strong>SHOPIFY_ACCESS_TOKEN</strong> secret in Base44:</p>
          <div class="token">${token}</div>
          <p style="margin-top:20px;color:#666;">Once saved, you can close this page and sync products from Admin Portal.</p>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('Invalid action', { status: 400 });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});