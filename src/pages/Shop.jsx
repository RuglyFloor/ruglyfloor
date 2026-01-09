import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Shop() {
  const navigate = useNavigate();
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ category: 'original' }),
    initialData: []
  });

  const addToCart = (product) => {
    const cartItem = {
      type: 'original',
      product_id: product.id,
      name: product.name,
      size: product.size,
      price: product.price,
      imageUrl: product.image_url
    };

    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    
    navigate(createPageUrl('Cart'));
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Original Ruglys</h1>
          <p className="text-xl text-gray-600">Unique, hand-painted designs starting at $700</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-4">No original designs available yet.</p>
            <p className="text-gray-500">Check back soon for our hand-painted collection!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product) => {
              const [selectedImage, setSelectedImage] = React.useState(0);
              const allImages = [
                product.image_url,
                ...(product.images || [])
              ].filter(Boolean);
              
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100 relative">
                    {allImages.length > 0 && (
                      <>
                        <img 
                          src={allImages[selectedImage]} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                        {allImages.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 px-2 py-1.5 rounded-full">
                            {allImages.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === selectedImage ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{product.size}</span>
                      <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}