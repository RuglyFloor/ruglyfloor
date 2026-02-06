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
import AvailableRugsHorizontalScroll from '../components/custom/AvailableRugsHorizontalScroll';

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
        title={seoData?.seo_title || "Rugly Floor — Custom Painted Rugs"}
        description={typeof seoData?.seo_description === 'string' ? seoData.seo_description : "Custom hand-painted rugs designed for your space. Choose from Crugly (budget), Rugly (premium), or Rugly LX (luxury) quality tiers. Hand-painted in our Michigan studio."}
        keywords={Array.isArray(seoData?.seo_keywords) ? seoData.seo_keywords : ['custom painted rugs', 'hand painted rugs', 'crugly', 'rugly', 'custom floor art', 'painted area rugs', 'unique home decor', 'custom rug design', 'hand-painted rugs for sale', 'personalized floor art', 'luxury hand-painted rugs', 'custom painted washable rugs']}
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
          <p className="text-lg md:text-xl text-white mb-12 max-w-3xl mx-auto">Design a rug that's as unique as you are. Choose from <strong>Crugly</strong> (budget), <strong className="rugly-text">Rugly</strong> (premium), or <strong className="rugly-text">Rugly LX</strong> (luxury). Pick your colors. Play with patterns. Watch it come to life in real-time.


          </p>
          <div className="flex gap-4 justify-center flex-wrap items-center">
            <Link to={createPageUrl('CustomBuilder')}>
              <button className="bg-transparent border border-white text-white font-black px-12 py-6 hover:bg-white/10 transition-all tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.575rem', textShadow: '2px 2px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5)' }}>
                Create It Now
              </button>
            </Link>
            <Link to={createPageUrl('Commission')}>
              <button className="bg-transparent border border-white text-white font-black px-12 py-6 hover:bg-white/10 transition-all tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.575rem', textShadow: '2px 2px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5)' }}>
                Custom Quote
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Yelp Reviews Section - Moved after hero */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-yellow-50 to-orange-50">
        {/* Background Images */}
        <div className="absolute inset-0 z-0 opacity-30">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/1ef1e78ef_IMG_1668.jpg"
            alt="Capital Hippie Store"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-full object-contain rounded-r-3xl blur-sm"
          />
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/cf829bd48_finishedproduct.png"
            alt="Finished Product"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full object-contain rounded-l-3xl blur-sm"
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
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

      {/* Shop for Original Ruglys Section - Horizontal Scroll */}
      <AvailableRugsHorizontalScroll products={products} handleGrabIt={handleGrabIt} isCheckingOut={isCheckingOut} />



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

      {/* Quality Tiers - Choose Your Level */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">CHOOSE YOUR QUALITY LEVEL</h2>
          <p className="text-center text-slate-600 mb-12 text-lg">From budget-friendly to luxury — we have the perfect rug for every space and budget</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white border-4 border-blue-500 rounded-2xl p-8 hover:shadow-2xl transition-all">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Crugly</h3>
                <p className="text-blue-600 font-semibold">Budget-Friendly Entry Tier</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Synthetic non-slip material</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Machine washable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">2-20+ year lifespan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">FREE shipping</span>
                </li>
              </ul>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-4">From $79</div>
                <Link to={createPageUrl('CustomBuilder')}>
                  <Button className="w-full border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 text-white">
                    Start Designing
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-white border-4 border-purple-600 rounded-2xl p-8 hover:shadow-2xl transition-all relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-center mb-4 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 rugly-text">Rugly</h3>
                <p className="text-purple-600 font-semibold">Premium Standard Tier</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Rabbit fur or premium material</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Standard rug lifespan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Machine washable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Flat rate shipping</span>
                </li>
              </ul>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-4">From $200</div>
                <Link to={createPageUrl('CustomBuilder')}>
                  <Button className="w-full border-2 border-purple-600 bg-purple-600 hover:bg-purple-700 text-white">
                    Start Designing
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-4 border-amber-500 rounded-2xl p-8 hover:shadow-2xl transition-all">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 rugly-text">Rugly LX</h3>
                <p className="text-amber-600 font-semibold">Luxury Premium Tier</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Shag, jute, or luxury materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Premium durability</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">White glove service</span>
                </li>
              </ul>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-4">Custom Quote</div>
                <Link to={createPageUrl('CustomBuilder')}>
                  <Button className="w-full border-2 border-amber-600 bg-amber-600 hover:bg-amber-700 text-white">
                    Start Designing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-slate-600 text-sm">All rugs are hand-painted in our Michigan studio • Low-pile/flat weave for crisp lines • Matte finish • Non-slip backing</p>
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