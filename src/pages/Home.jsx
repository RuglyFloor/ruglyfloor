import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Palette, Sparkles, Package, CheckCircle } from 'lucide-react';

export default function Home() {
  const [currentProduct, setCurrentProduct] = useState(0);
  
  const products = [
    {
      image: "https://ruglyfloor.com/_next/image?url=%2Fimages%2Fready-to-ship-1.jpg&w=3840&q=75",
      title: "Pan Am Vintage Logo",
      description: "A classic aviation icon, hand-painted with precision on a low-pile base.",
      price: 299,
      sold: true
    },
    {
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/736432943_ChicagoRug.png",
      title: "Chicago Skyline",
      description: "Hand-painted using dye and fabric paint. Features Chicago's iconic skyline with all current buildings plus two under construction.",
      price: 400,
      sold: false
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <iframe
            className="absolute inset-0 w-full h-full object-cover"
            src="https://www.youtube.com/embed/oGBsu7bQMAE?autoplay=1&mute=1&loop=1&playlist=oGBsu7bQMAE&controls=0&showinfo=0&rel=0&modestbranding=1"
            allow="autoplay; encrypted-media"
            style={{ pointerEvents: 'none' }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/7e922323a_RUGLYMASTERLOGO-61.png"
            alt="RUGLY"
            className="h-32 md:h-48 mx-auto mb-6"
          />
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-white">
            ART FOR YOUR FLOOR.
          </h2>
          <p className="text-lg md:text-xl text-white mb-12 max-w-3xl mx-auto">
            Hand Painted, Dyed, and Stencilled Area Rugs to your design, your color, at your price
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={createPageUrl('Shop')}>
              <button className="bg-transparent border border-white text-white font-black text-4xl px-12 py-6 hover:bg-white/10 transition-all tracking-wide" style={{ fontFamily: 'Major Mono Display, monospace', textShadow: '2px 2px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5)' }}>
                Shop Ruglys
              </button>
            </Link>
            <Link to={createPageUrl('CustomBuilder')}>
              <button className="bg-transparent border border-white text-white font-black text-4xl px-12 py-6 hover:bg-white/10 transition-all tracking-wide" style={{ fontFamily: 'Major Mono Display, monospace', textShadow: '2px 2px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5)' }}>
                Create a Crugly
              </button>
            </Link>
            <Link to={createPageUrl('Commission')}>
              <button className="bg-transparent border border-white text-white font-black text-4xl px-12 py-6 hover:bg-white/10 transition-all tracking-wide" style={{ fontFamily: 'Major Mono Display, monospace', textShadow: '2px 2px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5)' }}>
                Fine Art to your taste
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Shop for Original Ruglys Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Package className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold">SHOP FOR ORIGINAL RUGLYS</h2>
          </div>
          <div className="relative">
            <div className={`group cursor-pointer transition-opacity duration-500 ${currentProduct === 0 ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-4 relative max-w-2xl mx-auto">
                <img 
                  src={products[0].image}
                  alt={products[0].title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 text-white font-bold text-3xl px-8 py-4 rounded-lg transform rotate-12">
                    SOLD
                  </div>
                </div>
              </div>
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-3">{products[0].title}</h3>
                <p className="text-slate-600 mb-4">{products[0].description}</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl font-bold text-red-600">SOLD OUT</span>
                  <Button disabled className="opacity-50">SOLD</Button>
                </div>
              </div>
            </div>
            <div className={`group cursor-pointer transition-opacity duration-500 ${currentProduct === 1 ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-4 max-w-2xl mx-auto">
                <img 
                  src={products[1].image}
                  alt={products[1].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-3">{products[1].title}</h3>
                <p className="text-slate-600 mb-4">{products[1].description}</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl font-bold text-blue-600">${products[1].price}</span>
                  <Button>GRAB IT</Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentProduct(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentProduct === index ? 'bg-blue-600 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Create Something Unique?</h2>
          <p className="text-xl mb-8 opacity-90">Custom Cruglys starting at $199. Premium originals from $700.</p>
          <Link to={createPageUrl('CustomBuilder')}>
            <Button size="lg" variant="secondary" className="text-lg px-10 py-7">
              Start Designing Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">FROM CONCEPT TO CREATION</h2>
          <div className="relative h-96 bg-slate-100 rounded-lg overflow-hidden">
            {[
              {
                image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/40e12a1d2_Screenshot2025-12-19at235301.png",
                caption: "1. Choose Your Design"
              },
              {
                image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/684e49dba_IMG_1570.jpg",
                caption: "2. Create the Stencil"
              },
              {
                image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/8c2ad34fb_5.png",
                caption: "3. Hand-Paint on Rug"
              },
              {
                image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/ebb74119a_Madonna.jpg",
                caption: "4. Ready for Your Space"
              }
            ].map((step, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  Math.floor(currentProduct / 1.25) % 4 === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img 
                  src={step.image}
                  alt={step.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white text-2xl font-bold text-center">{step.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before Ordering Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">READ THIS BEFORE ORDERING</h2>
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

      {/* Base Rug Details */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">BASE RUG DETAILS</h2>
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
            className="w-full h-full object-cover"
          />
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
              className="h-16"
            />
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/90995324f_RUGLYMASTERLOGO-6.png" 
              alt="Rugly Logo" 
              className="h-16"
            />
          </div>
        </div>
      </section>
    </div>
  );
}