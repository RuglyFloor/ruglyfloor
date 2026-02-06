import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export default function AvailableRugsHorizontalScroll({ products, handleGrabIt, isCheckingOut }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);
  const [isInSection, setIsInSection] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || products.length === 0) return;

      const section = sectionRef.current;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Check if we're entering the section
      const sectionStart = sectionTop;
      const sectionEnd = sectionTop + sectionHeight - windowHeight;

      if (scrollY >= sectionStart && scrollY <= sectionEnd) {
        setIsInSection(true);
        
        // Calculate progress (0 to 1) based on how far through the section we are
        const progress = (scrollY - sectionStart) / (sectionEnd - sectionStart);
        setScrollProgress(Math.max(0, Math.min(1, progress)));
      } else {
        setIsInSection(false);
        
        // Reset progress if before section, set to 1 if after
        if (scrollY < sectionStart) {
          setScrollProgress(0);
        } else {
          setScrollProgress(1);
        }
      }
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [products.length]);

  // Calculate horizontal scroll position
  const totalWidth = products.length * 450; // 450px per rug (380px width + 70px gap)
  const scrollLeft = scrollProgress * (totalWidth - 380); // Stop when last rug is centered

  return (
    <section 
      ref={sectionRef} 
      className="relative"
      style={{ height: `${products.length * 120}vh` }} // Taller for more scroll control
    >
      <div className="sticky top-0 h-screen w-full bg-white overflow-hidden">
        {/* Full screen white background with cutout for details */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-12 left-0 right-0 text-center z-20">
            <div className="flex items-center gap-3 justify-center mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold">AVAILABLE RUGS</h2>
            </div>
            <p className="text-gray-600">Scroll to browse →</p>
          </div>

          {/* Main brick scrolling area */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div 
              className="flex items-center gap-16 absolute transition-transform duration-200 ease-out"
              style={{ 
                transform: `translateX(calc(50vw - 190px - ${scrollLeft}px))`,
                willChange: 'transform'
              }}
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-96 bg-white rounded-2xl shadow-2xl border-4 border-gray-900 overflow-hidden"
                  style={{
                    transform: 'perspective(1200px) rotateY(-3deg)',
                    boxShadow: '12px 12px 0px rgba(0,0,0,0.4)'
                  }}
                >
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className={`w-full h-full object-cover ${
                        !product.in_stock ? 'opacity-60' : ''
                      }`}
                    />
                    {!product.in_stock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 text-white font-bold text-3xl px-8 py-4 rounded-xl transform rotate-12 shadow-xl">
                          SOLD
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                    <h3 className="text-2xl font-bold mb-3 text-center">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 text-center line-clamp-3">
                      {typeof product.description === 'string' ? product.description : product.description?.description || ''}
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      {product.in_stock ? (
                        <>
                          <span className="text-3xl font-bold text-blue-600">
                            ${product.price}
                          </span>
                          <Button 
                            onClick={() => handleGrabIt(product)}
                            disabled={isCheckingOut}
                            className="w-full border-2 border-gray-900 font-bold text-lg py-6"
                          >
                            {isCheckingOut ? 'Loading...' : 'GRAB IT'}
                          </Button>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-red-600">SOLD OUT</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-96">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-blue-600 transition-all duration-200 rounded-full"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              {Math.round(scrollProgress * 100)}% browsed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}