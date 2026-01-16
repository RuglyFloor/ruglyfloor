import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { order_key, file, image_type, source } = await req.json();

    if (!order_key || !file) {
      return Response.json({ error: 'order_key and file required' }, { status: 400 });
    }

    // Find order
    const orders = await base44.asServiceRole.entities.RuglyOrder.filter({ order_key });
    
    if (orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Upload file
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Append to originals (never overwrite)
    const originals = order.customer_images_originals || [];
    originals.push(file_url);

    // Log to manifest
    const manifestEntry = {
      original_filename: file.name || 'unknown',
      received_at: new Date().toISOString(),
      source: source || 'FORM',
      stored_url: file_url,
      order_key: order_key,
      image_type: image_type || 'UNKNOWN'
    };

    let manifest = [];
    try {
      manifest = order.customer_images_manifest ? JSON.parse(order.customer_images_manifest) : [];
    } catch (e) {
      manifest = [];
    }
    manifest.push(manifestEntry);

    // Determine image types received
    const hasRoomPhoto = manifest.some(m => m.image_type === 'ROOM_PHOTO');
    const hasDesignRef = manifest.some(m => m.image_type === 'DESIGN_REFERENCE');
    
    let imageTypeReceived = 'UNKNOWN';
    if (hasRoomPhoto && hasDesignRef) {
      imageTypeReceived = 'BOTH';
    } else if (hasRoomPhoto) {
      imageTypeReceived = 'ROOM_PHOTO';
    } else if (hasDesignRef) {
      imageTypeReceived = 'DESIGN_REFERENCE';
    }

    const requirementMet = hasRoomPhoto || hasDesignRef;
    const assetsStatus = requirementMet ? 'COMPLETE' : 'PARTIAL';

    // Update order
    const updated = await base44.asServiceRole.entities.RuglyOrder.update(order.id, {
      customer_images_originals: originals,
      customer_images_manifest: JSON.stringify(manifest),
      image_type_received: imageTypeReceived,
      image_requirement_met: requirementMet,
      assets_status: assetsStatus,
      assets_first_received_at: order.assets_first_received_at || new Date().toISOString(),
      assets_last_updated_at: new Date().toISOString()
    });

    console.log('Customer image uploaded:', file_url);

    return Response.json({ 
      success: true, 
      file_url,
      assets_status: assetsStatus,
      image_requirement_met: requirementMet
    });

  } catch (error) {
    console.error('Upload customer images error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});