import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function AvailableRugsHorizontalScroll({ products, handleGrabIt, isCheckingOut }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);
  const [hasEnteredSection, setHasEnteredSection] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || products.length === 0) return;

      const section = sectionRef.current;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Check if user has entered the section
      const sectionStart = sectionTop - windowHeight / 2;
      const sectionEnd = sectionTop + sectionHeight - windowHeight / 2;

      if (scrollY >= sectionStart && scrollY <= sectionEnd) {
        setHasEnteredSection(true);
        
        // Calculate progress (0 to 1 across all products)
        const relativeScroll = scrollY - sectionStart;
        const scrollRange = sectionEnd - sectionStart;
        const progress = Math.max(0, Math.min(1, relativeScroll / scrollRange));
        
        setScrollProgress(progress);
      } else if (scrollY < sectionStart) {
        setHasEnteredSection(false);
        setScrollProgress(0);
      } else {
        setScrollProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [products.length]);

  // Calculate horizontal scroll
  const itemWidth = typeof window !== 'undefined' ? window.innerWidth * 0.7 : 800;
  const totalWidth = products.length * (itemWidth + 60);
  const scrollLeft = scrollProgress * (totalWidth - itemWidth);

  return (
    <section 
      ref={sectionRef} 
      className="relative bg-black overflow-hidden"
      style={{ height: `${products.length * 120}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-start overflow-hidden">
        {/* Fullscreen horizontal container */}
        <div 
          className="flex items-center gap-16 transition-transform duration-200 ease-out"
          style={{ 
            transform: `translateX(calc(15vw - ${scrollLeft}px))`,
            willChange: 'transform'
          }}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex-shrink-0 flex items-center gap-8"
              style={{ width: `${itemWidth}px` }}
            >
              {/* Image - borderless, contemporary */}
              <div className="relative w-2/3 aspect-[4/3] overflow-hidden shadow-2xl">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`w-full h-full object-cover ${
                    !product.in_stock ? 'opacity-60' : ''
                  }`}
                />
                {!product.in_stock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-red-600 text-white font-bold text-3xl px-8 py-4 rounded">
                      SOLD
                    </div>
                  </div>
                )}
              </div>

              {/* White cutout section for details */}
              <div className="w-1/3 bg-white rounded-2xl shadow-2xl p-8 flex flex-col justify-center min-h-[400px]">
                <h3 className="text-2xl font-bold mb-4">{product.name}</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {typeof product.description === 'string' ? product.description : product.description?.description || ''}
                </p>
                
                <div className="mt-auto">
                  {product.in_stock ? (
                    <>
                      <div className="text-4xl font-bold text-blue-600 mb-4">
                        ${product.price}
                      </div>
                      <Button 
                        onClick={() => handleGrabIt(product)}
                        disabled={isCheckingOut}
                        className="w-full text-lg py-6"
                        size="lg"
                      >
                        {isCheckingOut ? 'Loading...' : 'GRAB IT'}
                      </Button>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-red-600">SOLD OUT</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex gap-2">
            {products.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  scrollProgress >= index / products.length && scrollProgress < (index + 1) / products.length
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}