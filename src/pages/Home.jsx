import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Palette, Sparkles, Package, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import SEOHead from '../components/seo/SEOHead';
import { generateOrganizationSchema } from '../components/seo/SchemaGenerator';
import { useSEO } from '../components/seo/useSEO';

export default function Home() {
  const seoData = useSEO('');
  const navigate = useNavigate();
  const [currentProduct, setCurrentProduct] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => base44.entities.Product.filter({ category: 'original' })
  });

  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(() => {
        setCurrentProduct((prev) => (prev + 1) % products.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [products.length]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(stepInterval);
  }, []);

  const handleGrabIt = async (product) => {
    // Check if we're in an iframe (Base44 preview)
    if (window.self !== window.top) {
      alert('Checkout is only available on the published app. Please visit the live site to complete your purchase.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const cartItem = {
        type: 'original',
        product_id: product.id,
        name: product.name,
        size: product.size,
        price: product.price,
        imageUrl: product.image_url,
        previewUrl: product.image_url
      };

      // Simple customer info collection - they'll complete it in Stripe Checkout
      const customerInfo = {
        name: '',
        email: '',
        phone: '',
        timeOnSite: Math.floor((Date.now() - parseInt(sessionStorage.getItem('rugly_site_start_time') || Date.now())) / 1000),
        referrerSource: sessionStorage.getItem('rugly_referrer') || 'direct'
      };

      const response = await base44.functions.invoke('createCheckout', {
        cart: [cartItem],
        customerInfo: customerInfo,
        designInstructions: ''
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unable to start checkout. Please try adding to cart instead.');
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title={seoData?.seo_title || "Buy Custom Hand-Painted Rugs | Unique Gifts for Mother's Day & Father's Day"}
        description={typeof seoData?.seo_description === 'string' ? seoData.seo_description : "Shop custom hand-painted rugs for sale - perfect Mother's Day gifts, Father's Day gifts, and unique gifts for hard to buy for people. Commission bespoke rug designs, personalized floor art, and unique hand-painted home decor. Luxury hand-painted carpet designs for modern homes and interior designers."}
        keywords={Array.isArray(seoData?.seo_keywords) ? seoData.seo_keywords : ['mothers day gifts', 'fathers day gifts', 'unique gifts for hard to buy for people', 'buy custom hand-painted rugs', 'bespoke hand-painted area rugs', 'commission custom rug design', 'hand-painted rugs for sale', 'personalized floor art rugs', 'unique hand-painted home decor', 'luxury hand-painted carpet designs', 'artistic area rugs for modern homes', 'custom painted washable rugs']}
        url="/"
        type="website"
        schema={generateOrganizationSchema()} />

      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <iframe
            className="absolute inset-0 w-full h-full object-cover"
            src="https://www.youtube.com/embed/oGBsu7bQMAE?autoplay=1&mute=1&loop=1&playlist=oGBsu7bQMAE&controls=0&showinfo=0&rel=0&modestbranding=1"
            allow="autoplay; encrypted-media"
            style={{ pointerEvents: 'none' }} />

          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/7e922323a_RUGLYMASTERLOGO-61.png"
            alt="RUGLY"
            className="h-32 md:h-48 mx-auto mb-6" />

          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-white">Your Rug, Your Rules

          </h2>
          <p className="text-lg md:text-xl text-white mb-12 max-w-3xl mx-auto">Design a rug that's as unique as you are. Because your space should tell YOUR story. Pick your colors. Play with patterns. Watch it come to life in real-time.


          </p>
          <div className="flex gap-4 justify-center flex-wrap items-center">
            <Link to={createPageUrl('CustomBuilder')}>
              <button className="bg-transparent border border-white text-white font-black px-12 py-6 hover:bg-white/10 transition-all tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.575rem', textShadow: '2px 2px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5)' }}>
                Create It Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Shop for Original Ruglys Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-12 justify-center">
            <Package className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold">SHOP FOR ORIGINAL RUGLYS</h2>
          </div>
          <div className="mb-16">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Loading featured rugs...</p>
              </div>
            ) : (
              <div className="relative" style={{ minHeight: '900px' }}>
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      currentProduct === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    style={{ willChange: 'opacity' }}
                  >
                    <div className="max-w-3xl mx-auto">
                      <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-6 relative">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className={`w-full h-full object-cover ${
                            !product.in_stock ? 'opacity-60' : ''
                          }`}
                        />
                        {!product.in_stock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-red-600 text-white font-bold text-3xl px-8 py-4 rounded-lg transform rotate-12">
                              SOLD
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center space-y-4">
                        <h3 className="text-2xl font-bold">{product.name}</h3>
                        <p className="text-slate-600 text-lg">{typeof product.description === 'string' ? product.description : product.description?.description || ''}</p>
                        <div className="flex flex-col items-center justify-center gap-4 pt-4">
                          {product.in_stock ? (
                            <>
                              <span className="text-3xl font-bold text-blue-600">
                                ${product.price}
                              </span>
                              <Button 
                                size="lg"
                                onClick={() => handleGrabIt(product)}
                                disabled={isCheckingOut}
                                className="min-w-[120px]"
                              >
                                {isCheckingOut ? 'Loading...' : 'GRAB IT'}
                              </Button>
                            </>
                          ) : (
                            <div className="text-center space-y-2">
                              <span className="text-3xl font-bold text-red-600 block">SOLD OUT</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-center gap-2">
            {products.map((_, index) =>
            <button
              key={index}
              onClick={() => setCurrentProduct(index)}
              className={`w-3 h-3 rounded-full transition-all ${
              currentProduct === index ? 'bg-blue-600 w-8' : 'bg-gray-300'}`
              } />

            )}
          </div>
        </div>
      </section>

      {/* Yelp Reviews Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-yellow-50 to-orange-50 mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-red-600 rounded-full mb-6">
              <span className="text-white font-semibold text-sm">⭐ Customer Reviews</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real Customers, Real Reviews
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              See what people are saying about their Rugly experience
            </p>
          </div>

          {/* Yelp Badge Widget */}
          <div className="flex justify-center">
            <span 
              className="yelp-review" 
              data-review-id="rugly-floors-lansing" 
              data-hostname="www.yelp.com"
            >
              <a 
                href="https://www.yelp.com/biz/rugly-floors-lansing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-white rounded-2xl shadow-2xl p-12 hover:shadow-3xl transition-shadow"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">Rated 5 Stars on Yelp</p>
                  <p className="text-gray-600 mb-6">See what our customers are saying</p>
                  <div className="inline-flex items-center gap-2 text-red-600 font-semibold text-lg">
                    Read Our Reviews
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            </span>
          </div>
        </div>
      </section>

      {/* Before Ordering Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">READ THIS BEFORE ORDERING</h2>
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <p className="text-lg text-slate-700">Rugs are painted, not printed. This is hand work.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <p className="text-lg text-slate-700">Bold designs work best. High contrast = clean edges.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <p className="text-lg text-slate-700">Thin lines & gradients may be simplified for the stencil.</p>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <p className="text-lg italic text-slate-700">
              "The preview is accurate — but this is still hand work. Each rug has character. That's the point."
            </p>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">FROM CONCEPT TO CREATION</h2>
          <div className="relative h-96 bg-slate-100 rounded-lg overflow-hidden mb-6">
            {[
            {
              image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/40e12a1d2_Screenshot2025-12-19at235301.png",
              caption: "Step One: Decide on what you want on your floor"
            },
            {
              image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/684e49dba_IMG_1570.jpg",
              caption: "Step Two: We draft stencils or hand dye your design (depending on complexity and need for line) and we create your vision"
            },
            {
              image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/8c2ad34fb_5.png",
              caption: "Step Three: Your Crugly is shipped from our studio to your home"
            }].
            map((step, index) =>
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
              currentStep === index ? 'opacity-100' : 'opacity-0'}`
              }
              style={{ willChange: 'opacity' }}>

                <img
                src={step.image}
                alt={step.caption}
                className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="relative h-20">
            {[
            {
              caption: "Step One: Decide on what you want on your floor"
            },
            {
              caption: "Step Two: We draft stencils or hand dye your design (depending on complexity and need for line) and we create your vision"
            },
            {
              caption: "Step Three: Your Crugly is shipped from our studio to your home"
            }].
            map((step, index) =>
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${
              currentStep === index ? 'opacity-100' : 'opacity-0'}`
              }>
                <p className="text-slate-700 text-xl md:text-2xl font-bold text-center leading-relaxed">{step.caption}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Base Rug Details */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">BASE RUG DETAILS</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">LOW-PILE</h3>
              <p className="text-slate-600 text-sm">Flat weave for clean paint lines</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">MATTE FINISH</h3>
              <p className="text-slate-600 text-sm">No glare, just pure color</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">WASHABLE</h3>
              <p className="text-slate-600 text-sm">Easy to clean and maintain</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">NON-SLIP</h3>
              <p className="text-slate-600 text-sm">Stays exactly where you put it</p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Story */}
      <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/684e49dba_IMG_1570.jpg"
            alt="Rugly Background"
            className="w-full h-full object-cover" />

        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">FROM THE STUDIO TO YOUR LIVING ROOM.</h2>
          <div className="space-y-4 text-lg text-slate-300 mb-8">
            <p>
              Rugly was born at the intersection of fine art and functional design. Founder Ryan Hensley brings years of experience in commercial space design, building unique Airbnbs, and creating brand identities to the most overlooked canvas in your home: the floor.
            </p>
            <p>
              As a canvas artist with a background in interior design, he realized that flooring was either mass-produced and soulless, or custom-tufted and prohibitively expensive. Rugly is the middle ground. We use high-quality base rugs as our canvas and hand-paint every design in our studio.
            </p>
            <p>
              Whether it's a <strong>Rugly Premium</strong> original or a custom <strong>Crugly</strong> of your own design, you're getting a piece of hand-painted art that is built to be lived on.
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 mt-8">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/f4f7d59d4_Screenshot2026-01-07at180950.png"
              alt="Ryan Hensley - Founder & Artist"
              className="h-16" />

            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/90995324f_RUGLYMASTERLOGO-6.png"
              alt="Rugly Logo"
              className="h-16" />

          </div>
        </div>
      </section>
    </div>);

}