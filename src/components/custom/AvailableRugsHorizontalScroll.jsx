import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AvailableRugsHorizontalScroll({ products, handleGrabIt, isCheckingOut }) {
  const [activeId, setActiveId] = useState(null);
  const [ripples, setRipples] = useState({});

  if (!products || products.length === 0) {
    return (
      <section className="bg-black py-20 px-6">
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-5xl font-bold text-white mb-16 text-center">Available Rugs</h2>
          <div className="text-center text-white text-xl">Loading rugs...</div>
        </div>
      </section>
    );
  }

  const handleMouseMove = (productId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples(prev => ({
      ...prev,
      [productId]: { x, y, id: Math.random() }
    }));

    setTimeout(() => {
      setRipples(prev => {
        const newRipples = { ...prev };
        delete newRipples[productId];
        return newRipples;
      });
    }, 600);
  };

  const getDominantColor = (product) => {
    const colorMap = {
      'Yellow': '#f4d03f',
      'Pink': '#f8c9d4',
      'White': '#ffffff',
      'Burnt Orange': '#cc5500',
      'Grey': '#9ca3af',
      'Gray': '#9ca3af',
      'Green': '#86cb92',
      'Tan': '#d2b48c',
      'Khaki': '#c3b091'
    };
    return colorMap[product.name?.split(' ')[0]] || '#d2b48c';
  };

  return (
    <section className="bg-gradient-to-b from-black via-gray-950 to-black py-20 px-6 relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="text-5xl font-bold text-white mb-4 text-center">Available Rugs</h2>
        <p className="text-center text-gray-400 mb-16 text-lg">Hover to reveal. Each rug is a masterpiece.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product, idx) => {
            const isActive = activeId === product.id;
            const color = getDominantColor(product);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => setActiveId(product.id)}
                onMouseLeave={() => setActiveId(null)}
                onMouseMove={(e) => handleMouseMove(product.id, e)}
                className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer"
              >
                {/* Background blur/abstract representation */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    opacity: isActive ? 0 : 0.4
                  }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
                  }}
                />

                {/* Mosaic tile base - color blocks */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"
                  animate={{
                    opacity: isActive ? 0 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-20 h-20 rounded-lg opacity-80 shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </motion.div>

                {/* Actual rug image - revealed on hover */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.95
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className={`w-full h-full object-cover ${
                      !product.in_stock ? 'opacity-50' : ''
                    }`}
                  />
                  {!product.in_stock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="bg-red-600 text-white font-bold text-2xl px-6 py-3 rounded-lg">
                        SOLD OUT
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Ripple effect */}
                {ripples[product.id] && (
                  <motion.div
                    className="absolute pointer-events-none"
                    initial={{
                      width: 0,
                      height: 0,
                      left: ripples[product.id].x,
                      top: ripples[product.id].y,
                      opacity: 0.6,
                    }}
                    animate={{
                      width: 400,
                      height: 400,
                      left: ripples[product.id].x - 200,
                      top: ripples[product.id].y - 200,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.6 }}
                    style={{
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                    }}
                  />
                )}

                {/* Glow effect on active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      boxShadow: `inset 0 0 40px ${color}80, 0 0 40px ${color}60`
                    }}
                  />
                )}

                {/* Info overlay - appears on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6 rounded-lg"
                  animate={{
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  pointerEvents={isActive ? 'auto' : 'none'}
                >
                  <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-200 text-sm mb-4 line-clamp-2">
                    {typeof product.description === 'string' ? product.description : product.description?.description || 'Handcrafted custom rug'}
                  </p>
                  
                  {product.in_stock ? (
                    <>
                      <div className="text-3xl font-bold mb-4" style={{ color }}>
                        ${product.price}
                      </div>
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Button 
                          onClick={() => handleGrabIt(product)}
                          disabled={isCheckingOut}
                          className="w-full font-bold text-lg"
                          size="lg"
                          style={{ 
                            backgroundColor: color,
                            color: ['#f4d03f', '#c3b091', '#d2b48c', '#ffffff'].includes(color) ? '#000' : '#fff',
                            borderColor: color,
                            borderWidth: '2px'
                          }}
                        >
                          {isCheckingOut ? 'Loading...' : '✨ GRAB IT'}
                        </Button>
                      </motion.div>
                    </>
                  ) : null}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}