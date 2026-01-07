import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Palette, Sparkles, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Transform Your Space with
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Rugly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Custom-painted rugs designed by you. From logos to artwork, bring your vision to life on premium carpet-like rugs.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={createPageUrl('CustomBuilder')}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8">
                <Palette className="w-5 h-5 mr-2" />
                Design Your Rug
              </Button>
            </Link>
            <Link to={createPageUrl('Shop')}>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Shop Originals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fully Customizable</h3>
            <p className="text-gray-600">Choose your size, color, and upload any design. We'll hand-paint it perfectly.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Artist Quality</h3>
            <p className="text-gray-600">Each rug is hand-painted by our founder, a former artist with a unique technique.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Commercial Ready</h3>
            <p className="text-gray-600">Perfect for businesses needing branded flooring without the $5,000 price tag.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Create Something Unique?</h2>
          <p className="text-xl mb-8 opacity-90">Custom rugs starting at $900. Original designs from $700.</p>
          <Link to={createPageUrl('CustomBuilder')}>
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Designing Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}