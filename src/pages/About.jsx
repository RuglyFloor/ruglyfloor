import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Palette, ArrowRight, ShoppingBag } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { useSEO } from '../components/seo/useSEO';

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const seoData = useSEO('about');

  return (
    <div className="min-h-screen">
      <SEOHead
        title={seoData?.seo_title || "Rugly Floors - About"}
        description={seoData?.seo_description || "Meet Ryan Hensley, founder of Rugly Floor. Learn about our passion for large-scale art and hand-painted custom rugs that transform spaces."}
        keywords={seoData?.seo_keywords || ['about rugly', 'ryan hensley', 'custom rug artist', 'hand painted rug creator']}
        url="/about"
      />
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About Rugly
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Where art meets the floor
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('CustomBuilder')}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
                <Palette className="w-5 h-5 mr-2" />
                Design Custom Rug
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Shop')}>
              <Button size="lg" variant="outline" className="text-lg px-8 border-2">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Originals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ryan's Story */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/59b0dcad2_ryanhensley.png"
                alt="Ryan Hensley at work"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Meet Ryan Hensley</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  For as long as I can remember, I've been drawn to scale. Large canvases, bold statements, art that commands a room. But here's the problem I kept running into: who actually buys large-scale art? And even if they do, how do you ship it? Store it? The logistics and costs made it nearly impossible to turn my passion into something sustainable.
                </p>
                <p>
                  Art and design have been my calling since I was young. That passion led me to the School of the Art Institute of Chicago, where I attended on a merit scholarship while working full time to support myself. After leaving, I tried to make it in the creative world, but reality had other plans. I ended up in corporate real estate, paying the bills but feeling disconnected from what truly mattered to me.
                </p>
                <p>
                  Then it hit me: what if the floor could be my canvas?
                </p>
                <p>
                  I put everything I had—literally my last cent—into this venture. Rugly is my way of staying true to my calling while solving the challenges that held me back. By painting on rugs, I can create large-scale art that's affordable, shippable, and accessible. Every piece is hand-painted, one-of-a-kind, and designed to transform spaces in ways traditional art never could.
                </p>
                <p className="font-semibold text-gray-900">
                  This is more than a business. It's my art, my passion, and my commitment to delivering large-scale creativity to the world—one floor at a time.
                </p>
              </div>
            </div>
          </div>

          {/* Featured Work */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8">Featured Work</h3>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/e411705e7_Screenshot2026-01-07at015736.png"
              alt="Custom Pan Am rug design"
              className="rounded-lg shadow-2xl w-full max-w-3xl mx-auto"
            />
          </div>

          {/* Before You Order - Foundation Guide */}
          <div className="mt-16 bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Foundation Guide: Read Before Ordering</h3>
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Hand-Painted, Not Printed</h4>
                  <p className="text-gray-700">Every Rugly is hand-painted in our studio. This is real hand work, not a printed design. Each piece has unique character and slight variations that make it one-of-a-kind.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Bold Designs Work Best</h4>
                  <p className="text-gray-700">High contrast designs with clear edges paint the cleanest. Bold, simple shapes and patterns will give you the most professional-looking result.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Stencil Process</h4>
                  <p className="text-gray-700">We create custom stencils for each design. Thin lines, gradients, and extremely fine details may be simplified to work with the stencil painting process.</p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded mt-6">
                <p className="text-lg italic text-gray-700">
                  "The preview you see is accurate — but this is still hand work. Each rug has character and small variations. That's the point of custom, hand-painted art."
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Space?</h3>
            <p className="text-xl text-gray-600 mb-6">
              Let's create something unique together
            </p>
            <Link to={createPageUrl('CustomBuilder')}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                <Palette className="w-5 h-5 mr-2" />
                Start Your Design
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Background Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <iframe
            className="absolute inset-0 w-full h-full object-cover"
            src="https://www.youtube.com/embed/oGBsu7bQMAE?autoplay=1&mute=1&loop=1&playlist=oGBsu7bQMAE&controls=0&showinfo=0&rel=0&modestbranding=1"
            allow="autoplay; encrypted-media"
            style={{ pointerEvents: 'none' }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Art That Lives Where You Do
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Every Rugly is hand-painted in our studio, crafted to bring bold, beautiful design into your everyday life.
          </p>
          <Link to={createPageUrl('Shop')}>
            <Button size="lg" variant="secondary" className="text-lg px-12 py-6 font-bold">
              Shop Original Ruglys
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}