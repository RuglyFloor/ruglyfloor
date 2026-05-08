import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function ScrollDrivenRugs({ products, handleGrabIt, isCheckingOut }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Each product takes an equal slice of the scroll progress
  const count = products?.length || 0;
  // Translate from 0% to -(count-1)*100vw as scroll goes 0 -> 1
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `-${(count - 1) * 100}vw`]);

  if (!products || count === 0) return null;

  // Height: 100vh (sticky) + extra scroll room for each panel
  const sectionHeight = `${(count + 1) * 100}vh`;

  return (
    <section
      ref={containerRef}
      style={{ height: sectionHeight }}
      className="relative"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden bg-gradient-to-b from-white via-blue-50 to-white">
        {/* Section header — inside sticky so always visible */}
        <div className="absolute top-0 left-0 right-0 z-10 text-center pt-5 pb-2 px-6 pointer-events-none">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-0.5">Available Rugs</h2>
          <p className="text-gray-500 text-sm">Scroll to browse — ready to ship</p>
        </div>

        {/* Progress bar */}
        <motion.div
          className="absolute top-0 left-0 h-1 origin-left"
          style={{
            scaleX: scrollYProgress,
            backgroundColor: 'var(--brand-blue)',
            width: '100%',
            transformOrigin: '0%',
          }}
        />

        {/* Horizontal track */}
        <motion.div
          style={{ x }}
          className="flex h-full will-change-transform"
        >
          {products.map((product, i) => {
            const images = getImages(product);
            return (
              <div
                key={product.id}
                className="min-w-[100vw] w-screen h-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-4 md:px-20 pt-20 pb-4 md:pt-16 md:pb-0"
              >
                {/* Image */}
                <div className="flex-shrink-0 w-full md:w-1/2 max-w-lg" style={{ maxHeight: '45vh', height: '45vh' }}>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white h-full">
                    <img
                      src={(() => {
                        const url = images[0]?.url || product.image_url || '';
                        if (url.includes('supabase.co')) return `${url}?width=600&quality=75`;
                        return url;
                      })()}
                      alt={product.name}
                      className="w-full h-full object-contain p-3"
                      loading="lazy"
                      width="600" height="600"
                    />
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-bold text-xl px-4 py-2 rounded-lg">SOLD OUT</span>
                      </div>
                    )}
                    {/* Counter badge */}
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {i + 1} / {count}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="w-full md:w-1/2 max-w-md text-center md:text-left">
                  <h3 className="text-2xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-3">{product.name}</h3>
                  <p className="text-gray-600 text-sm md:text-lg leading-relaxed mb-2 md:mb-4 line-clamp-3 md:line-clamp-none">
                    {typeof product.description === 'string'
                      ? product.description
                      : product.description?.description || 'Handcrafted custom rug design'}
                  </p>
                  {product.size && (
                    <p className="text-gray-500 text-sm mb-2 md:mb-4">Size: {product.size}</p>
                  )}
                  <div className="text-3xl md:text-5xl font-bold mb-4 md:mb-8" style={{ color: 'var(--brand-blue)' }}>
                    ${product.price}
                  </div>
                  <div className="flex flex-row gap-2 md:gap-3 justify-center md:justify-start">
                    <Button
                      size="default"
                      className="font-bold md:text-lg md:py-6 md:px-8"
                      onClick={() => navigate(createPageUrl('ProductDetail') + `?id=${product.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      className="font-bold md:text-lg md:py-6 md:px-8"
                      onClick={() => navigate(createPageUrl('CustomBuilder'))}
                    >
                      Customize Similar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function getImages(product) {
  if (product.all_images?.length > 0) {
    const selected = product.all_images.filter(img => img.selected);
    return selected.length > 0 ? selected : product.all_images;
  }
  return product.image_url ? [{ url: product.image_url }] : [];
}