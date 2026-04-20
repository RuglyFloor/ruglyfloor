import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const products = await base44.asServiceRole.entities.Product.filter({ category: 'original' });

    const items = products.map((product) => {
      const allImages = product.all_images && product.all_images.filter(img => img.selected).length > 0
        ? product.all_images.filter(img => img.selected).map(img => img.url)
        : [product.image_url, ...(product.images || [])].filter(Boolean);

      const imageUrl = allImages[0] || '';
      const additionalImages = allImages.slice(1, 11); // Facebook supports up to 10 additional images
      const productUrl = `https://ruglyfloor.com/ProductDetail?id=${product.id}`;
      const description = typeof product.description === 'string'
        ? product.description
        : (product.description?.description || product.name);

      const availability = product.in_stock !== false ? 'in stock' : 'out of stock';
      const brand = 'Rugly';
      const condition = 'new';
      const currency = 'USD';
      const price = `${Number(product.price || 0).toFixed(2)} ${currency}`;
      const id = product.product_number || product.id;

      return `
    <item>
      <g:id><![CDATA[${id}]]></g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link><![CDATA[${productUrl}]]></g:link>
      <g:image_link><![CDATA[${imageUrl}]]></g:image_link>
      ${additionalImages.map(url => `<g:additional_image_link><![CDATA[${url}]]></g:additional_image_link>`).join('\n      ')}
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand><![CDATA[${brand}]]></g:brand>
      <g:google_product_category>539</g:google_product_category>
      <g:product_type><![CDATA[Home & Garden > Rugs]]></g:product_type>
      ${product.size ? `<g:size><![CDATA[${product.size}]]></g:size>` : ''}
      ${product.material ? `<g:material><![CDATA[${product.material}]]></g:material>` : ''}
    </item>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Rugly Floor – Original Hand-Painted Rugs</title>
    <link>https://ruglyfloor.com/shop</link>
    <description>Shop unique hand-painted rugs from Rugly Floor.</description>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[facebookCatalogFeed] Error:', error.message);
    return new Response(`<error>${error.message}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
});