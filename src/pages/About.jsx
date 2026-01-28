import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Palette, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { useSEO } from '../components/seo/useSEO';
import { motion } from 'framer-motion';

export default function About() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
  }, []);

  const seoData = useSEO('about');

  return (
    <div className="min-h-screen">
      <SEOHead
        title={seoData?.seo_title || "Rugly Floors - About"}
        description={typeof seoData?.seo_description === 'string' ? seoData.seo_description : "Meet Ryan Hensley, founder of Rugly Floor. Learn about our passion for large-scale art and hand-painted custom rugs that transform spaces."}
        keywords={Array.isArray(seoData?.seo_keywords) ? seoData.seo_keywords : ['about rugly', 'ryan hensley', 'custom rug artist', 'hand painted rug creator']}
        url="/about"
      />
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6TTAgMTZjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHptMzYgMzZjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHpNMCA1MmMwLTQuNDE4IDMuNTgyLTggOC04czggMy41ODIgOCA4LTMuNTgyIDgtOCA4LTgtMy41ODItOC04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-blue-100 text-sm font-medium">Hand-Painted Custom Rugs</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Rugly</span>
          </h1>
          <p className="text-2xl md:text-3xl text-blue-100 mb-12 font-light">
            Where art meets the floor
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('CustomBuilder')}>
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-6 h-auto font-bold shadow-2xl">
                <Palette className="w-5 h-5 mr-2" />
                Design Custom Rug
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Shop')}>
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 h-auto border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Originals
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Ryan's Story */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/59b0dcad2_ryanhensley.png"
                alt="Ryan Hensley at work"
                className="rounded-2xl shadow-2xl w-full relative z-10"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="inline-block px-4 py-2 bg-blue-50 rounded-full mb-6">
                <span className="text-blue-600 font-semibold text-sm">Founder & Artist</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">Meet Ryan Hensley</h2>
              <div className="space-y-5 text-gray-600 leading-relaxed text-lg">
                <p>
                  For as long as I can remember, I've been drawn to scale. Large canvases, bold statements, art that commands a room. But here's the problem I kept running into: who actually buys large-scale art? And even if they do, how do you ship it? Store it? The logistics and costs made it nearly impossible to turn my passion into something sustainable.
                </p>
                <p>
                  Art and design have been my calling since I was young. That passion led me to the School of the Art Institute of Chicago, where I attended on a merit scholarship while working full time to support myself. After leaving, I tried to make it in the creative world, but reality had other plans. I ended up in corporate real estate, paying the bills but feeling disconnected from what truly mattered to me.
                </p>
                <p className="text-2xl font-semibold text-gray-900 italic">
                  Then it hit me: what if the floor could be my canvas?
                </p>
                <p>
                  I put everything I had—literally my last cent—into this venture. Rugly is my way of staying true to my calling while solving the challenges that held me back. By painting on rugs, I can create large-scale art that's affordable, shippable, and accessible. Every piece is hand-painted, one-of-a-kind, and designed to transform spaces in ways traditional art never could.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 p-6 rounded-lg">
                  <p className="font-semibold text-gray-900 text-xl">
                    This is more than a business. It's my art, my passion, and my commitment to delivering large-scale creativity to the world—one floor at a time.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Featured Work */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-purple-50 rounded-full mb-4">
                <span className="text-purple-600 font-semibold text-sm">Portfolio</span>
              </div>
              <h3 className="text-4xl font-bold text-gray-900">Featured Work</h3>
            </div>
            <div className="relative group max-w-4xl mx-auto">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-xl" />
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/e411705e7_Screenshot2026-01-07at015736.png"
                alt="Custom Pan Am rug design"
                className="rounded-2xl shadow-2xl w-full relative z-10"
              />
            </div>
          </motion.div>

          {/* Before You Order - Foundation Guide */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-gray-200"
          >
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-white rounded-full mb-4 shadow-sm">
                <span className="text-gray-900 font-semibold text-sm">Essential Info</span>
              </div>
              <h3 className="text-4xl font-bold text-gray-900">Foundation Guide</h3>
              <p className="text-gray-600 text-lg mt-2">Read before ordering</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h4 className="font-bold text-xl mb-3 text-gray-900">Hand-Painted, Not Printed</h4>
                <p className="text-gray-600 leading-relaxed">Every Rugly is hand-painted in our studio. This is real hand work, not a printed design. Each piece has unique character and slight variations that make it one-of-a-kind.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h4 className="font-bold text-xl mb-3 text-gray-900">Bold Designs Work Best</h4>
                <p className="text-gray-600 leading-relaxed">High contrast designs with clear edges paint the cleanest. Bold, simple shapes and patterns will give you the most professional-looking result.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🖌️</span>
                </div>
                <h4 className="font-bold text-xl mb-3 text-gray-900">Stencil Process</h4>
                <p className="text-gray-600 leading-relaxed">We create custom stencils for each design. Thin lines, gradients, and extremely fine details may be simplified to work with the stencil painting process.</p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl max-w-3xl mx-auto shadow-xl"
            >
              <p className="text-xl italic leading-relaxed text-center">
                "The preview you see is accurate — but this is still hand work. Each rug has character and small variations. That's the point of custom, hand-painted art."
              </p>
            </motion.div>
          </motion.div>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mt-16 bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-8 md:p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6TTAgMTZjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHptMzYgMzZjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHpNMCA1MmMwLTQuNDE4IDMuNTgyLTggOC04czggMy41ODIgOCA4LTMuNTgyIDgtOCA4LTgtMy41ODItOC04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-bold mb-4 text-white">Ready to Transform Your Space?</h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Let's create something unique together
              </p>
              <Link to={createPageUrl('CustomBuilder')}>
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-6 h-auto font-bold shadow-2xl">
                  <Palette className="w-5 h-5 mr-2" />
                  Start Your Design
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Yelp Reviews Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-red-600 rounded-full mb-6">
              <span className="text-white font-semibold text-sm">⭐ Customer Reviews</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Read real reviews from people who've transformed their spaces with Rugly
            </p>
            <a 
              href="https://www.yelp.com/biz/rugly-floor-detroit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-10 py-6 h-auto font-bold shadow-xl">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                View Our Yelp Reviews
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Video Background Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <iframe
            className="absolute inset-0 w-full h-full object-cover scale-110"
            src="https://www.youtube.com/embed/oGBsu7bQMAE?autoplay=1&mute=1&loop=1&playlist=oGBsu7bQMAE&controls=0&showinfo=0&rel=0&modestbranding=1"
            allow="autoplay; encrypted-media"
            style={{ pointerEvents: 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Art That Lives <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Where You Do</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Every Rugly is hand-painted in our studio, crafted to bring bold, beautiful design into your everyday life.
          </p>
          <Link to={createPageUrl('Shop')}>
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-12 py-6 h-auto font-bold shadow-2xl">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop Original Ruglys
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}