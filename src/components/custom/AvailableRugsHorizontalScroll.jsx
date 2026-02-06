import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export default function AvailableRugsHorizontalScroll({ products, handleGrabIt, isCheckingOut }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || products.length === 0) return;

      const section = sectionRef.current;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Check if we're in the section
      if (scrollY >= sectionTop - windowHeight && scrollY <= sectionTop + sectionHeight) {
        isScrollingRef.current = true;
        
        // Calculate scroll progress within the section (0 to 1)
        const relativeScroll = scrollY - (sectionTop - windowHeight);
        const maxScroll = sectionHeight;
        const progress = Math.max(0, Math.min(1, relativeScroll / maxScroll));
        
        setScrollProgress(progress);

        // Prevent default scrolling while in this section
        if (progress < 1) {
          window.scrollTo(0, scrollY);
        }
      } else {
        isScrollingRef.current = false;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: false });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [products.length]);

  // Calculate horizontal scroll position
  const maxScrollLeft = products.length * 400; // 400px per brick
  const scrollLeft = scrollProgress * maxScrollLeft;

  return (
    <section 
      ref={sectionRef} 
      className="relative bg-white overflow-hidden"
      style={{ height: '300vh' }} // Make it tall enough for scrolling
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="w-full">
          <div className="text-center mb-12">
            <div className="flex items-center gap-3 justify-center">
              <Package className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold">AVAILABLE RUGS</h2>
            </div>
            <p className="text-gray-600 mt-2">Scroll to browse →</p>
          </div>

          {/* Horizontal scrolling brick container */}
          <div className="relative h-96">
            <div 
              ref={scrollContainerRef}
              className="absolute flex gap-6 transition-transform duration-100 ease-out"
              style={{ 
                transform: `translateX(-${scrollLeft}px)`,
                left: '50%',
                marginLeft: '-200px' // Center the first item
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-80 bg-gray-100 rounded-xl shadow-xl border-4 border-gray-800 overflow-hidden"
                  style={{
                    transform: 'perspective(1000px) rotateY(-2deg)',
                    boxShadow: '8px 8px 0px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="aspect-square bg-white relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className={`w-full h-full object-cover ${
                        !product.in_stock ? 'opacity-60' : ''
                      }`}
                    />
                    {!product.in_stock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 text-white font-bold text-2xl px-6 py-3 rounded-lg transform rotate-12">
                          SOLD
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                    <h3 className="text-xl font-bold mb-2 text-center">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 text-center line-clamp-2">
                      {typeof product.description === 'string' ? product.description : product.description?.description || ''}
                    </p>
                    <div className="flex flex-col items-center gap-3">
                      {product.in_stock ? (
                        <>
                          <span className="text-2xl font-bold text-blue-600">
                            ${product.price}
                          </span>
                          <Button 
                            onClick={() => handleGrabIt(product)}
                            disabled={isCheckingOut}
                            className="w-full border-2 border-gray-900 font-bold"
                          >
                            {isCheckingOut ? 'Loading...' : 'GRAB IT'}
                          </Button>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-red-600">SOLD OUT</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-12 max-w-md mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-100"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}