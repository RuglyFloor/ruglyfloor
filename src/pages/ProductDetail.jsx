import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import { createPageUrl } from '../utils';

export default function ProductDetail() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId
  });

  const rugTypeColor =
    product?.rug_type === 'Crugly' ? '#2de89a' :
    product?.rug_type === 'Rugly'  ? '#4d7eff' :
    product?.rug_type === 'Ruglux' ? '#3d3d3d' :
    product?.rug_type === 'Square' ? '#e83a1a' : '#4d7eff';

  const rugTypeTextColor = product?.rug_type === 'Crugly' ? '#1a1a1a' : '#ffffff';

  // Inline SVG checkmark — uses style attr so global CSS class overrides can't touch it
  const CheckmarkIcon = () => (
    <span style={{display:'inline-flex', flexShrink:0, marginTop:2}}>
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
        <rect width="20" height="20" rx="5" fill={rugTypeColor} style={{fill: rugTypeColor + ' !important'}} />
        <path d="M5 10.5L8.5 14L15 7" fill="none" stroke={rugTypeTextColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{stroke: rugTypeTextColor, fill:'none'}}/>
      </svg>
    </span>
  );

  // Inline SVG icons for trust badges — bypasses global CSS color overrides
  const iconStyle = { color: rugTypeColor, stroke: rugTypeColor, fill: 'none' };
  const PaintIcon = () => (
    <span style={{display:'inline-flex'}}>
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" style={{fill:'none', stroke: rugTypeColor, strokeWidth:'2'}}/>
        <path d="M8 12l3 3 5-5" style={{fill:'none', stroke: rugTypeColor, strokeWidth:'2', strokeLinecap:'round', strokeLinejoin:'round'}}/>
      </svg>
    </span>
  );
  const ShieldIcon = () => (
    <span style={{display:'inline-flex'}}>
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7L12 3z" style={{fill:'none', stroke: rugTypeColor, strokeWidth:'2', strokeLinecap:'round', strokeLinejoin:'round'}}/>
      </svg>
    </span>
  );
  const LockIcon = () => (
    <span style={{display:'inline-flex'}}>
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="11" width="14" height="10" rx="2" style={{fill:'none', stroke: rugTypeColor, strokeWidth:'2'}}/>
        <path d="M8 11V7a4 4 0 0 1 8 0v4" style={{fill:'none', stroke: rugTypeColor, strokeWidth:'2', strokeLinecap:'round'}}/>
      </svg>
    </span>
  );
  const TruckIcon = () => (
    <span style={{display:'inline-flex', flexShrink:0}}>
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" style={{fill:'none', stroke: rugTypeColor, strokeWidth:'2', strokeLinecap:'round', strokeLinejoin:'round'}}/>
        <circle cx="5.5" cy="18.5" r="2.5" style={{fill:'none', stroke: rugTypeColor, strokeWidth:'2'}}/>
        <circle cx="18.5" cy="18.5" r="2.5" style={{fill:'none', stroke: rugTypeColor, strokeWidth:'2'}}/>
      </svg>
    </span>
  );

  const images = product?.all_images?.filter(img => img.selected)
    .sort((a, b) => a.order - b.order)
    .map(img => img.url) || 
    (product?.image_url ? [product.image_url, ...(product?.images || [])] : []);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBuyNow = () => {
    const cartItem = {
      type: 'original',
      product_id: product.id,
      name: product.name,
      size: product.size || '',
      imageUrl: images[0] || product.image_url || '',
      previewUrl: images[0] || product.image_url || '',
      price: product.price,
      qualityTier: 'original',
      qualityLabel: 'Original Rugly',
    };
    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    navigate(createPageUrl('Cart'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Button onClick={() => navigate(createPageUrl('Shop'))}>
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEOHead
        title={product.seo_title || `${product.name} - Hand-Painted Rug | Rugly Floors`}
        description={product.seo_description || product.description || `Shop ${product.name} - ${product.size} hand-painted rug. Premium quality custom floor art.`}
        keywords={product.seo_keywords || []}
        image={images[0] || product.image_url}
        url={`/ProductDetail?id=${product.id}`}
        type="product"
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Shop'))}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx ? 'border-blue-600 scale-105' : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {/* Rug Type Brand Logo Image */}
              {product.rug_type && (() => {
                const brandImages = {
                  Crugly: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/874535578_Crugly.png',
                  Ruglux: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/778093650_RugLux.png',
                  Rugly:  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/eadd56d42_Rugly.png',
                  Square: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/beb1872d7_Square.png',
                };
                const img = brandImages[product.rug_type];
                return img ? (
                  <div className="mb-3">
                    <img src={img} alt={product.rug_type} style={{height:48, borderRadius:8, objectFit:'contain'}} />
                  </div>
                ) : (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3"
                    style={{ backgroundColor: rugTypeColor, color: rugTypeTextColor }}>
                    {product.rug_type}
                  </span>
                );
              })()}
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
              {product.size && (
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {product.size}
                </Badge>
              )}
            </div>

            <div className="text-5xl font-bold" style={{ color: rugTypeColor }}>
              ${product.price}
            </div>

            {product.in_stock ? (
              <span className="inline-block text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: rugTypeColor, color: rugTypeTextColor }}>In Stock</span>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">About This Rug</h3>
                {/* Parse description: lines starting with ✅ become branded checkmark items */}
                {(() => {
                  const text = product.long_description || product.description || '';
                  if (!text) return <p style={{color:'#374151', lineHeight:'1.6'}}>This stunning hand-painted rug is a one-of-a-kind piece of functional art.</p>;
                  const lines = text.split('\n');
                  return lines.map((line, i) => {
                    const cleaned = line.replace(/^✅\s*/, '');
                    if (line.trimStart().startsWith('✅')) {
                      return (
                        <div key={i} style={{display:'flex', alignItems:'flex-start', gap:10, marginBottom:6}}>
                          <span style={{display:'inline-flex', flexShrink:0, marginTop:2}}>
                            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <rect width="20" height="20" rx="5" fill={rugTypeColor}/>
                              <path d="M5 10.5L8.5 14L15 7" fill="none" stroke={rugTypeTextColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span style={{color:'#374151'}}>{cleaned}</span>
                        </div>
                      );
                    }
                    return line.trim() ? <p key={i} style={{color:'#374151', lineHeight:'1.6', marginBottom:8}}>{line}</p> : <br key={i}/>;
                  });
                })()}
              
              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                  <div className="mb-1"><PaintIcon /></div>
                  <span className="text-xs font-medium" style={{color:'#4b5563'}}>Hand-painted in Lansing, MI</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                  <div className="mb-1"><ShieldIcon /></div>
                  <span className="text-xs font-medium" style={{color:'#4b5563'}}>Full replacement if damaged</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                  <div className="mb-1"><LockIcon /></div>
                  <span className="text-xs font-medium" style={{color:'#4b5563'}}>Secure checkout via Stripe</span>
                </div>
              </div>

              {/* Shipping info */}
              <div className="mt-3 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: rugTypeColor + '22' }}>
                <TruckIcon />
                <span className="text-sm font-medium" style={{ color: rugTypeColor }}>
                  {product.shipping_info || 'Ships for $15 — 3 to 5 business days'}
                </span>
              </div>
            </CardContent>
            </Card>

            {/* Product Details */}
            {(product.material || product.care_instructions || product.backing || product.warranty || product.shipping_info) && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Product Details</h3>
                  <div className="space-y-3 text-sm">
                    {product.size && (
                      <div className="flex items-start gap-3">
                        <span className="font-semibold min-w-[100px]">Size:</span>
                        <span className="text-gray-700">{product.size}</span>
                      </div>
                    )}
                    {product.material && (
                      <div className="flex items-start gap-3">
                        <span className="font-semibold min-w-[100px]">Material:</span>
                        <span className="text-gray-700">{product.material}</span>
                      </div>
                    )}
                    {product.care_instructions && (
                      <div className="flex items-start gap-3">
                        <span className="font-semibold min-w-[100px]">Care:</span>
                        <span className="text-gray-700">{product.care_instructions}</span>
                      </div>
                    )}
                    {product.backing && (
                      <div className="flex items-start gap-3">
                        <span className="font-semibold min-w-[100px]">Backing:</span>
                        <span className="text-gray-700">{product.backing}</span>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="flex items-start gap-3">
                        <span className="font-semibold min-w-[100px]">Warranty:</span>
                        <span className="text-gray-700">{product.warranty}</span>
                      </div>
                    )}
                    {product.shipping_info && (
                      <div className="flex items-start gap-3">
                        <span className="font-semibold min-w-[100px]">Shipping:</span>
                        <span className="text-gray-700">{product.shipping_info}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Features</h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckmarkIcon />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Features</h3>
                  <ul className="space-y-3">
                    {['Hand-painted by professional artists','Premium quality materials','Durable and easy to clean','One-of-a-kind design','Free shipping on all orders'].map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckmarkIcon />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Purchase Button */}
            <div className="space-y-4">
              <Button
              onClick={handleBuyNow}
              disabled={!product.in_stock}
              className="w-full h-14 text-lg"
              style={{ backgroundColor: rugTypeColor, color: rugTypeTextColor }}
              >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Secure checkout powered by Stripe
              </p>
            </div>

            {/* Additional Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-bold mb-2">Have questions or want something custom?</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Contact us or visit our custom builder to create your perfect rug.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(createPageUrl('Contact'))}
                    className="flex-1"
                  >
                    Contact Us
                  </Button>
                  <Button 
                    onClick={() => navigate(createPageUrl('CustomBuilder'))}
                    className="flex-1"
                  >
                    Custom Builder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}