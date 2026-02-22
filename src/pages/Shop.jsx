import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import SEOHead from '../components/seo/SEOHead';

function ProductStructuredData({ products }) {
  React.useEffect(() => {
    // Remove any existing product schema scripts
    document.querySelectorAll('script[data-rugly-product-schema]').forEach(s => s.remove());

    products.forEach((product) => {
      const allImages = product.all_images
        ? product.all_images.filter(img => img.selected).map(img => img.url)
        : [product.image_url, ...(product.images || [])].filter(Boolean);

      const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "description": typeof product.description === 'string' ? product.description : (product.description?.description || ''),
        "image": allImages,
        "sku": product.product_number || product.id,
        "brand": {
          "@type": "Brand",
          "name": "Rugly"
        },
        "offers": {
          "@type": "Offer",
          "url": `https://ruglyfloor.com/ProductDetail?id=${product.id}`,
          "priceCurrency": "USD",
          "price": product.price,
          "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "availability": product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "itemCondition": "https://schema.org/NewCondition",
          "seller": {
            "@type": "Organization",
            "name": "Rugly Floor"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "59.00",
              "currency": "USD"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 2,
                "unitCode": "DAY"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 3,
                "maxValue": 5,
                "unitCode": "DAY"
              }
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "US"
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "US",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 24,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          }
        },
        ...(product.size ? { "size": product.size } : {}),
        ...(product.material ? { "material": product.material } : {})
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-rugly-product-schema', product.id);
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[data-rugly-product-schema]').forEach(s => s.remove());
    };
  }, [products]);

  return null;
}

export default function Shop() {
  const navigate = useNavigate();
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const result = await base44.entities.Product.filter({ category: 'original' });
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('[Shop] Product fetch error:', error);
        return [];
      }
    },
    staleTime: 60000,
    retry: 1
  });



  return (
    <div className="min-h-screen py-12 px-6">
      {products.length > 0 && <ProductStructuredData products={products} />}
      <SEOHead
        title="Hand-Painted Rugs for Sale | Original Custom Area Rugs & Floor Art"
        description="Buy custom hand-painted rugs online. Shop original bespoke area rugs, unique hand-painted home decor, and one-of-a-kind statement rugs. Best custom rug designers, ready to ship."
        keywords={['hand-painted rugs for sale', 'buy custom hand-painted rugs', 'bespoke hand-painted area rugs', 'unique hand-painted home decor', 'best custom rug designers', 'one-of-a-kind hand-painted statement rugs', 'durable hand-painted rug brands', 'artistic area rugs for modern homes']}
        url="/shop"
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Original Ruglys</h1>
          <p className="text-xl text-gray-600">Unique, hand-painted designs starting at $79</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-4">No original designs available yet.</p>
            <p className="text-gray-500">Check back soon for our hand-painted collection!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product) => {
              const ProductCard = () => {
                const [selectedImage, setSelectedImage] = React.useState(0);
                const allImages = product.all_images && product.all_images.filter(img => img.selected).length > 0
                  ? product.all_images.filter(img => img.selected).map(img => img.url)
                  : [product.image_url, ...(product.images || [])].filter(Boolean);
                
                return (
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-100 relative">
                      {allImages.length > 0 && (
                        <>
                          <img 
                            src={allImages[selectedImage]} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                          {allImages.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 px-2 py-1.5 rounded-full">
                              {allImages.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedImage(idx)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    idx === selectedImage ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{typeof product.description === 'string' ? product.description : product.description?.description || ''}</p>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">Size:</span>
                          <span>5x7 (60" × 84")</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">Material:</span>
                          <span>Low-pile synthetic, hand-painted</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">Care:</span>
                          <span>Machine washable, air dry</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">Backing:</span>
                          <span>Non-slip rubber</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">Warranty:</span>
                          <span>24-hour damage guarantee</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">Shipping:</span>
                          <span>$59 flat rate (3-5 days)</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate(createPageUrl('ProductDetail') + `?id=${product.id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                );
              };
              
              return <ProductCard key={product.id} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}