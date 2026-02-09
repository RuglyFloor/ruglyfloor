import React from 'react';
import { Button } from '@/components/ui/button';

export default function AvailableRugsHorizontalScroll({ products, handleGrabIt, isCheckingOut }) {
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

  return (
    <section className="bg-black py-20 px-6">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="text-5xl font-bold text-white mb-16 text-center">Available Rugs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white overflow-hidden aspect-[3/4] hover:scale-[1.02] transition-all duration-300"
            >
              <div className="absolute inset-0">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`w-full h-full object-cover ${
                    !product.in_stock ? 'opacity-60' : ''
                  }`}
                />
                {!product.in_stock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="bg-red-600 text-white font-bold text-3xl px-8 py-4">
                      SOLD
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-white p-6 transform translate-y-[calc(100%-80px)] group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {typeof product.description === 'string' ? product.description : product.description?.description || ''}
                </p>
                
                {product.in_stock ? (
                  <>
                    <div className="text-3xl font-bold text-blue-600 mb-4">
                      ${product.price}
                    </div>
                    <Button 
                      onClick={() => handleGrabIt(product)}
                      disabled={isCheckingOut}
                      className="w-full"
                      size="lg"
                    >
                      {isCheckingOut ? 'Loading...' : 'GRAB IT'}
                    </Button>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-red-600">SOLD OUT</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}