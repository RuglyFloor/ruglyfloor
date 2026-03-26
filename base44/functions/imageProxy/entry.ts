Deno.serve(async (req) => {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: 'imageUrl required' }, { status: 400 });
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = new Uint8Array(await response.arrayBuffer());

    // Chunk-based base64 encoding to avoid stack overflow
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      binary += String.fromCharCode(...buffer.slice(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    const dataUrl = `data:${contentType};base64,${base64}`;

    return Response.json({ dataUrl });
  } catch (error) {
    console.error('imageProxy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});