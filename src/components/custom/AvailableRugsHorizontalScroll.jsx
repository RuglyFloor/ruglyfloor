import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function AvailableRugsHorizontalScroll({ products, handleGrabIt, isCheckingOut }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  if (!products || products.length === 0) {
    return (
      <section className="bg-white py-20 px-6">
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-16 text-center">Available Rugs</h2>
          <div className="text-center text-gray-600 text-xl">Loading rugs...</div>
        </div>
      </section>
    );
  }

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % products.length);
    setImageIndex(0);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
    setImageIndex(0);
  };

  const handleNextImage = () => {
    const images = getActiveImages();
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    const images = getActiveImages();
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getActiveImages = () => {
    const product = products[activeIndex];
    if (product.all_images && product.all_images.length > 0) {
      return product.all_images.filter(img => img.selected).length > 0 
        ? product.all_images.filter(img => img.selected)
        : product.all_images;
    }
    return product.image_url ? [{ url: product.image_url }] : [];
  };

  const getItemIndex = (i) => {
    return (i - activeIndex + products.length) % products.length;
  };

  const activeProduct = products[activeIndex];

  return (
    <section className="bg-gradient-to-b from-white via-blue-50 to-white py-20 px-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Available Rugs</h2>
          <p className="text-gray-600 text-lg">Handcrafted designs ready to transform your space</p>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl bg-gradient-to-b from-gray-100 to-white shadow-2xl">
            {/* Gallery Track */}
            <div className="flex items-center justify-center h-full relative">
              {products.map((product, i) => {
                const itemIndex = getItemIndex(i);
                const isCenter = itemIndex === 0;
                const distance = Math.abs(itemIndex - 0);
                const offset = itemIndex > 0 ? itemIndex * 100 : itemIndex * 100;

                return (
                  <motion.div
                    key={product.id}
                    initial={false}
                    animate={{
                      x: offset + (direction === 1 ? 200 : -200),
                      scale: isCenter ? 1 : Math.max(0.6, 1 - distance * 0.15),
                      opacity: isCenter ? 1 : Math.max(0.3, 1 - distance * 0.25),
                      zIndex: isCenter ? 10 : 10 - distance,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                  >
                    <div
                      className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${
                        isCenter ? 'cursor-pointer pointer-events-auto' : ''
                      }`}
                    >
                      {/* Image */}
                      <div className="relative w-[85%] md:w-[90%] h-[85%] md:h-[90%] rounded-xl overflow-hidden shadow-2xl group">
                        {isCenter && getActiveImages().length > 0 && (
                          <img
                            src={getActiveImages()[imageIndex].url}
                            alt={product.name}
                            className="w-full h-full object-contain transition-opacity duration-300"
                          />
                        )}
                        {!isCenter && (
                          <img
                            src={product.image_url || (product.all_images?.[0]?.url)}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        )}
                        {!product.in_stock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="bg-red-600 text-white font-bold text-3xl px-8 py-4 rounded-lg">
                              SOLD OUT
                            </div>
                          </div>
                        )}
                        {/* Image Navigation (Center Only) */}
                        {isCenter && getActiveImages().length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrevImage();
                              }}
                              className="absolute left-1 md:left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-1.5 md:p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextImage();
                              }}
                              className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-1.5 md:p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Spotlight Glow */}
                      {isCenter && (
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          animate={{
                            boxShadow: [
                              'inset 0 0 30px rgba(37, 99, 235, 0.3)',
                              'inset 0 0 50px rgba(37, 99, 235, 0.5)',
                              'inset 0 0 30px rgba(37, 99, 235, 0.3)',
                            ],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-blue-600 hover:text-white text-gray-900 rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 group"
              aria-label="Previous rug"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-blue-600 hover:text-white text-gray-900 rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 group"
              aria-label="Next rug"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Info Section Below */}
          <motion.div
            key={activeProduct.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-8 grid md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto"
          >
            {/* Details */}
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">{activeProduct.name}</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {typeof activeProduct.description === 'string'
                  ? activeProduct.description
                  : activeProduct.description?.description || 'Handcrafted custom rug design'}
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-bold text-blue-600">${activeProduct.price}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => navigate(createPageUrl('ProductDetail') + `?id=${activeProduct.id}`)}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-6 shadow-lg"
              >
                View Details
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(createPageUrl('CustomBuilder'))}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-lg py-6"
              >
                Customize Similar
              </Button>
            </div>
          </motion.div>

          {/* Product Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > activeIndex ? 1 : -1);
                  setActiveIndex(i);
                  setImageIndex(0);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
                }`}
                aria-label={`Go to rug ${i + 1}`}
              />
            ))}
          </div>

          {/* Image Indicators (for current product) */}
          {getActiveImages().length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {getActiveImages().map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === imageIndex ? 'bg-blue-400 w-6' : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                  }`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}