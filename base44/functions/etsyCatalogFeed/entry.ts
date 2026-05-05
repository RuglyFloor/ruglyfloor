import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Etsy bulk listing CSV feed
// Column headers match Etsy's bulk upload template format
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const products = await base44.asServiceRole.entities.Product.filter({ category: 'original' });

    const headers = [
      'TITLE',
      'DESCRIPTION',
      'PRICE',
      'QUANTITY',
      'TAGS',
      'MATERIALS',
      'WHO_MADE',
      'IS_SUPPLY',
      'WHEN_MADE',
      'SECTION_TITLE',
      'IMAGE1',
      'IMAGE2',
      'IMAGE3',
    ];

    const escape = (val) => {
      if (val == null) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = products.map((product) => {
      const allImages = product.all_images && product.all_images.filter(img => img.selected).length > 0
        ? product.all_images.filter(img => img.selected).map(img => img.url)
        : [product.image_url, ...(product.images || [])].filter(Boolean);

      const description = [
        product.long_description || product.description || product.name,
        product.size ? `Size: ${product.size}` : '',
        product.material ? `Material: ${product.material}` : '',
        product.care_instructions ? `Care: ${product.care_instructions}` : '',
      ].filter(Boolean).join('\n\n');

      const tags = ['custom rug', 'hand painted', 'floor art', 'home decor', 'wall art', 'rug']
        .slice(0, 13) // Etsy max 13 tags
        .join(', ');

      const materials = [product.material || 'cotton', 'paint'].join(', ');

      return [
        escape(product.name?.substring(0, 140)),
        escape(description),
        escape(Number(product.price || 0).toFixed(2)),
        escape(product.in_stock !== false ? 1 : 0),
        escape(tags),
        escape(materials),
        escape('i_did'),
        escape('false'),
        escape('2020_2025'),
        escape('Original Hand-Painted Rugs'),
        escape(allImages[0] || ''),
        escape(allImages[1] || ''),
        escape(allImages[2] || ''),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': 'attachment; filename="rugly-etsy-feed.csv"',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[etsyCatalogFeed] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});