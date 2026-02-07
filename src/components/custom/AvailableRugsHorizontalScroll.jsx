import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function AvailableRugsHorizontalScroll({ products, handleGrabIt, isCheckingOut }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || products.length === 0) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Only calculate when section is in view
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        const scrolledIntoSection = scrollY - sectionTop;
        const maxScroll = sectionHeight - windowHeight;
        const progress = Math.max(0, Math.min(1, scrolledIntoSection / maxScroll));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [products.length]);

  const currentIndex = Math.floor(scrollProgress * products.length);

  return (
    <section 
      ref={sectionRef} 
      className="relative bg-black overflow-hidden"
      style={{ height: `${products.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden px-16">
        <div 
          className="flex items-center gap-12 transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(calc(-${scrollProgress * products.length * 100}vw))`,
            width: `${products.length * 100}vw`
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-screen flex items-center justify-center gap-12 px-16"
            >
              <div className="relative w-[55%] aspect-[4/3] overflow-hidden shadow-2xl">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`w-full h-full object-cover ${
                    !product.in_stock ? 'opacity-60' : ''
                  }`}
                />
                {!product.in_stock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-red-600 text-white font-bold text-4xl px-12 py-6 rounded">
                      SOLD
                    </div>
                  </div>
                )}
              </div>

              <div className="w-[30%] bg-white rounded-3xl shadow-2xl p-10 flex flex-col justify-center min-h-[500px]">
                <h3 className="text-3xl font-bold mb-6">{product.name}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {typeof product.description === 'string' ? product.description : product.description?.description || ''}
                </p>
                
                <div className="mt-auto">
                  {product.in_stock ? (
                    <>
                      <div className="text-5xl font-bold text-blue-600 mb-6">
                        ${product.price}
                      </div>
                      <Button 
                        onClick={() => handleGrabIt(product)}
                        disabled={isCheckingOut}
                        className="w-full text-xl py-7"
                        size="lg"
                      >
                        {isCheckingOut ? 'Loading...' : 'GRAB IT'}
                      </Button>
                    </>
                  ) : (
                    <div className="text-4xl font-bold text-red-600">SOLD OUT</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          {products.map((_, index) => (
            <div
              key={index}
              className={`h-3 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'w-12 bg-white' : 'w-3 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}