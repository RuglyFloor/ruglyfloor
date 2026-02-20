import React from 'react';

export const generateProductSchema = (product) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://ruglyfloor.com/shop`
    },
    brand: {
      '@type': 'Brand',
      name: 'Rugly Floor'
    }
  };
};

export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rugly Floor - Homesteads, LLC',
    url: 'https://ruglyfloor.com',
    logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/9a05f04b4_RUGLYMASTERLOGO-92.png',
    description: 'Custom hand-painted rugs handcrafted in Lansing, Michigan. Shop Crugly, Rugly, and Rugly LX quality tiers.',
    telephone: '+15177778474',
    email: 'info@ruglyfloor.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Lansing',
      addressLocality: 'Lansing',
      addressRegion: 'MI',
      postalCode: '48910',
      addressCountry: 'US'
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=61585565308752',
      'https://instagram.com/ruglyfloor',
      'https://twitter.com/ruglyfloor',
      'https://tiktok.com/@ruglyfloor',
      'https://www.yelp.com/biz/rugly-floor-lansing'
    ]
  };
};

export const generateBreadcrumbSchema = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://ruglyfloor.com${item.url}`
    }))
  };
};

export const generateLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Rugly Floor',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/9a05f04b4_RUGLYMASTERLOGO-92.png',
    telephone: '+15177778474',
    email: 'info@ruglyfloor.com',
    url: 'https://ruglyfloor.com',
    priceRange: '$$',
    description: 'Custom hand-painted rugs handcrafted in Lansing, Michigan. Crugly, Rugly, and Rugly LX quality tiers. Free shipping on Crugly orders.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Lansing',
      addressLocality: 'Lansing',
      addressRegion: 'MI',
      postalCode: '48910',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 42.7325,
      longitude: -84.5555
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00'
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=61585565308752',
      'https://instagram.com/ruglyfloor',
      'https://www.yelp.com/biz/rugly-floor-lansing'
    ],
    hasMap: 'https://maps.google.com/?q=Lansing,MI',
    areaServed: {
      '@type': 'City',
      name: 'Lansing',
      containedInPlace: {
        '@type': 'State',
        name: 'Michigan'
      }
    }
  };
};

export default function SchemaGenerator({ type, data }) {
  let schema;
  
  switch(type) {
    case 'product':
      schema = generateProductSchema(data);
      break;
    case 'organization':
      schema = generateOrganizationSchema();
      break;
    case 'breadcrumb':
      schema = generateBreadcrumbSchema(data);
      break;
    case 'localBusiness':
      schema = generateLocalBusinessSchema();
      break;
    default:
      return null;
  }

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
}