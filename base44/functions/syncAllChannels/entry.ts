import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id, channels } = await req.json();

    if (!product_id) {
      return Response.json({ error: 'product_id required' }, { status: 400 });
    }

    const channelsToSync = channels || ['facebook', 'etsy', 'tiktok', 'shopify'];
    const results = [];

    for (const channel of channelsToSync) {
      try {
        let functionName;
        switch (channel) {
          case 'facebook':
            functionName = 'exportToFacebook';
            break;
          case 'etsy':
            functionName = 'exportToEtsy';
            break;
          case 'tiktok':
            functionName = 'exportToTikTok';
            break;
          case 'shopify':
            functionName = 'exportToShopify';
            break;
          default:
            results.push({
              channel,
              success: false,
              error: 'Unknown channel'
            });
            continue;
        }

        const response = await base44.asServiceRole.functions.invoke(functionName, { product_id });
        
        results.push({
          channel,
          success: response.data?.success || false,
          message: response.data?.message || response.data?.error,
          details: response.data
        });

      } catch (error) {
        results.push({
          channel,
          success: false,
          error: error.message
        });
      }
    }

    const allSuccess = results.every(r => r.success);
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    return Response.json({ 
      success: allSuccess,
      summary,
      results
    });

  } catch (error) {
    console.error('Sync all channels error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});