import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Shopify product CSV import feed
// Matches Shopify's standard product import CSV format
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const products = await base44.asServiceRole.entities.Product.filter({ category: 'original' });

    const headers = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Vendor',
      'Product Category',
      'Type',
      'Tags',
      'Published',
      'Option1 Name',
      'Option1 Value',
      'Variant SKU',
      'Variant Price',
      'Variant Inventory Qty',
      'Variant Inventory Policy',
      'Image Src',
      'Image Position',
      'SEO Title',
      'SEO Description',
    ];

    const escape = (val) => {
      if (val == null) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const slugify = (str) =>
      (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const rows = [];

    for (const product of products) {
      const allImages = product.all_images && product.all_images.filter(img => img.selected).length > 0
        ? product.all_images.filter(img => img.selected).map(img => img.url)
        : [product.image_url, ...(product.images || [])].filter(Boolean);

      const handle = slugify(product.name);
      const bodyHtml = [
        `<p>${product.long_description || product.description || product.name}</p>`,
        product.size ? `<p><strong>Size:</strong> ${product.size}</p>` : '',
        product.material ? `<p><strong>Material:</strong> ${product.material}</p>` : '',
        product.care_instructions ? `<p><strong>Care:</strong> ${product.care_instructions}</p>` : '',
      ].filter(Boolean).join('\n');

      const tags = ['custom rug', 'hand painted', 'floor art', 'home decor', product.category].filter(Boolean).join(', ');

      // First row — main product row with first image
      rows.push([
        escape(handle),
        escape(product.name),
        escape(bodyHtml),
        escape('Rugly'),
        escape('Home & Garden > Decor > Rugs'),
        escape('Rug'),
        escape(tags),
        escape('TRUE'),
        escape('Title'),
        escape('Default Title'),
        escape(product.product_number || ''),
        escape(Number(product.price || 0).toFixed(2)),
        escape(product.in_stock !== false ? 1 : 0),
        escape('deny'),
        escape(allImages[0] || ''),
        escape(1),
        escape((product.seo_title || product.name)?.substring(0, 70)),
        escape((product.seo_description || product.description || '')?.substring(0, 160)),
      ].join(','));

      // Additional image rows
      allImages.slice(1).forEach((imgUrl, i) => {
        rows.push([
          escape(handle),
          escape(''), escape(''), escape(''), escape(''), escape(''), escape(''),
          escape(''), escape(''), escape(''), escape(''), escape(''), escape(''),
          escape(''),
          escape(imgUrl),
          escape(i + 2),
          escape(''), escape(''),
        ].join(','));
      });
    }

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': 'attachment; filename="rugly-shopify-feed.csv"',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[shopifyCatalogFeed] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});