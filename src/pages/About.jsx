import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Palette } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About Rugly
          </h1>
          <p className="text-xl text-gray-600">
            Where art meets the floor
          </p>
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
    </div>
  );
}