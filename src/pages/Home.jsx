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

const HERO_VIDEOS = [
  'IT7Zkp4UwEA',
  'oGBsu7bQMAE',
];

export default function Home() {
  const seoData = useSEO('');
  const navigate = useNavigate();
  const [currentProduct, setCurrentProduct] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [currentHeroVideo, setCurrentHeroVideo] = useState(0);

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
    }, 5000);
    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const videoInterval = setInterval(() => {
      setCurrentHeroVideo((prev) => (prev + 1) % HERO_VIDEOS.length);
    }, 12000);
    return () => clearInterval(videoInterval);
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
          {HERO_VIDEOS.map((videoId, i) => (
            <iframe
              key={videoId}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
              allow="autoplay; encrypted-media"
              style={{ pointerEvents: 'none', opacity: currentHeroVideo === i ? 1 : 0 }}
            />
          ))}
          <div className="absolute inset-0 bg-black/50" />
          {/* Video dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {HERO_VIDEOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentHeroVideo(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ backgroundColor: currentHeroVideo === i ? 'white' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/7e922323a_RUGLYMASTERLOGO-61.png"
            alt="RUGLY"
            className="h-32 md:h-48 mx-auto mb-6" />

          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-white">Your Rug, Your Rules

          </h2>
          <p className="text-lg md:text-xl text-white mb-12 max-w-3xl mx-auto">Choose <strong>Crugly</strong>, <strong className="rugly-text">Rugly</strong>, or <strong className="rugly-text">Rugly LX</strong>. Pick colors, play with patterns, watch it live.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link to={createPageUrl('CustomBuilder')}>
              <button className="bg-transparent border border-white text-white font-black px-12 py-6 hover:bg-white/10 transition-all tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.575rem', textShadow: '2px 2px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5)' }}>
                Create It Now
              </button>
            </Link>
            <Link to={createPageUrl('Commission')}>
              <button className="bg-transparent border border-white/60 text-white/70 font-black px-7 py-2 hover:bg-white/10 hover:text-white/90 transition-all tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.95rem' }}>
                Custom Quote / Commercial
              </button>
            </Link>
          </div>
          {/* Trust bar */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-8 text-white/90 text-sm font-medium">
            <span>✦ From $79</span>
            <span>✦ Preview before you pay</span>
            <span>✦ Ready in 6 days</span>
            <span>✦ Free shipping on Crugly</span>
            <span>✦ Local pickup available</span>
          </div>
        </div>
      </section>

      {/* How It Works - Flip Cards */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3" style={{color:'#343634'}}>How It Works</h2>
          <p className="text-center text-gray-500 mb-2">Three steps. No guessing. No surprises.</p>
          <p className="text-center text-xs text-gray-400 mb-10 md:hidden">Tap a card to see it in action</p>
          <p className="text-center text-xs text-gray-400 mb-10 hidden md:block">Hover a card to see it in action</p>
          <style>{`
            .hiw-flip-card { perspective: 1000px; }
            .hiw-flip-inner {
              position: relative; width: 100%; height: 100%;
              transition: transform 0.65s cubic-bezier(0.4,0,0.2,1);
              transform-style: preserve-3d;
            }
            .hiw-flip-card.hiw-flipped .hiw-flip-inner { transform: rotateY(180deg); }
            @media (hover: hover) {
              .hiw-flip-card:hover .hiw-flip-inner { transform: rotateY(180deg); }
            }
            .hiw-front, .hiw-back {
              position: absolute; width: 100%; height: 100%;
              backface-visibility: hidden; -webkit-backface-visibility: hidden;
              border-radius: 1rem; overflow: hidden;
            }
            .hiw-back { transform: rotateY(180deg); }
          `}</style>
          <div className="grid md:grid-cols-3 gap-6" style={{minHeight:'300px'}}>
            {[
              {
                num:'01', title:'Upload / Design Your Rug', icon:'🎨',
                body:"Use our builder to pick your size, colors, and upload your design — or describe your vision and we'll handle it.",
                color:'#4075ff',
                images:[
                  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/db8fa3de2_Screenshot2026-02-20at115711.png",
                ]
              },
              {
                num:'02', title:'Deploy Your Design', icon:'✅',
                body:'We send you a digital preview before anything is painted. You approve it. Zero risk, zero surprises.',
                color:'#24f0a0',
                images:[
                  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/f59403e57_IMG_1559.jpg",
                  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/604e7c19a_IMG_1564.jpg",
                ]
              },
              {
                num:'03', title:'Stencil, Paint & Ship', icon:'📦',
                body:'Hand-painted in our Michigan studio. Free shipping on Crugly. Flat rate on Rugly. Or pick it up locally.',
                color:'#f04624',
                images:[
                  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/6ea7a20dd_IMG_1766.jpg",
                  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/3c3b3497d_finishedproduct.png",
                ]
              }
            ].map(s => {
              const [flipped, setFlipped] = React.useState(false);
              return (
                <div
                  key={s.num}
                  className={`hiw-flip-card${flipped ? ' hiw-flipped' : ''}`}
                  style={{height:'300px'}}
                  onClick={() => setFlipped(f => !f)}
                  onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setFlipped(true); }}
                  onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) setFlipped(false); }}
                >
                  <div className="hiw-flip-inner">
                    {/* Front */}
                    <div className="hiw-front bg-white flex flex-col justify-center items-center p-6 text-center" style={{border:`3px solid ${s.color}`}}>
                      <div className="text-5xl mb-3">{s.icon}</div>
                      <div className="text-xs font-black tracking-widest mb-2" style={{color:s.color}}>{s.num}</div>
                      <h3 className="text-xl font-bold mb-3" style={{color:'#343634'}}>{s.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
                      <div className="mt-4 text-xs" style={{color:s.color}}>Hover / tap to see →</div>
                    </div>
                    {/* Back - images */}
                    <div className="hiw-back" style={{backgroundColor: s.color}}>
                      <div className="w-full h-full flex">
                        {s.images.map((img, i) => (
                          <img key={i} src={img} alt={s.title} className="flex-1 object-cover" style={{width:`${100/s.images.length}%`}} />
                        ))}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 text-white font-bold text-sm text-center" style={{backgroundColor:`${s.color}cc`}}>
                        {s.title}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 px-6" style={{backgroundColor:'#343634'}}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-10">What Customers Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote:'I purchased a rug from Rugly Floor and I absolutely adore how it turned out. With a child and four pets, I opted for the budget-friendly choice since rugs in my home experience a lot of spills. However, I still wanted to incorporate decor that adds a stylish and unique flair, and my rug certainly achieves that. I receive numerous compliments on it.', name:'Melissa L.', loc:'Denver, CO', source:'Yelp' },
              { quote:'I received three rugs from Rugly Floor and I love all of them! I have them in my business and would highly recommend these rugs for home or commercial use!', name:'Laura B.', loc:'Lansing, MI', source:'Yelp' },
              { quote:'Ordered a portrait rug of my golden retriever for my boyfriend\'s birthday. Ryan sent over a digital preview first and it looked exactly like our dog. It arrived in like 11 days and we were both blown away. Already telling everyone about it.', name:'Brittany H.', loc:'Grand Rapids, MI', source:'Google' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex">{[...Array(5)].map((_,j) => <span key={j} className="text-yellow-400 text-lg">★</span>)}</div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{backgroundColor: t.source === 'Yelp' ? '#d32323' : '#4285F4', color:'white'}}>{t.source}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div className="font-bold text-sm" style={{color:'#343634'}}>{t.name}</div>
                <div className="text-xs text-gray-500">{t.loc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Yelp Reviews Section */}
      <section className="relative py-32 px-6 bg-white">
        {/* Background Images */}
        <div className="absolute inset-0 z-0 opacity-70">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/1ef1e78ef_IMG_1668.jpg"
            alt="Capital Hippie Store"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-96 object-cover rounded-r-3xl"
          />
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/cf829bd48_finishedproduct.png"
            alt="Finished Product"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-96 object-cover rounded-l-3xl"
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
            <p className="text-xl mb-8" style={{color: 'var(--brand-red)'}}>
              See what people are saying about their Rugly experience
            </p>
          </div>

          {/* Review Badges */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {/* Yelp Badge */}
            <a 
              href="https://www.yelp.com/biz/rugly-floor-lansing" 
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

            {/* Google Badge */}
            <a 
              href="https://g.page/r/rugly-floor-lansing/review" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl shadow-2xl p-12 hover:shadow-3xl transition-shadow"
            >
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-12 h-12" style={{color: 'var(--brand-blue)'}} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">Rated 5 Stars on Google</p>
                <p className="text-gray-600 mb-6">See what our customers are saying</p>
                <div className="inline-flex items-center gap-2 font-semibold text-lg" style={{color: '#4285F4'}}>
                  Read Our Reviews
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Shop for Original Ruglys Section - Horizontal Scroll */}
      <AvailableRugsHorizontalScroll products={products} handleGrabIt={handleGrabIt} isCheckingOut={isCheckingOut} />



      {/* Before Ordering Section */}
      <section className="py-20 px-6 bg-white">
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
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <p className="text-lg text-slate-700"><strong>If your design relies on tiny text, thin lines, or gradients</strong> → use Custom Quote for best results.</p>
            </div>
          </div>
          <div className="border-l-4 p-6 rounded" style={{borderColor:'var(--brand-blue)', backgroundColor:'rgba(64,117,255,0.06)'}}>
            <p className="text-lg italic text-slate-700">
              "The preview is accurate — but this is still hand work. Each rug has character. That's the point."
            </p>
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