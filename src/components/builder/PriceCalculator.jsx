import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function PriceCalculator({ config, pricingData, completionPercentage }) {
  const navigate = useNavigate();

  const calculatePrice = () => {
    if (!config.qualityTier || !config.size) return 0;

    const tier = pricingData.qualityTiers.find(t => t.id === config.qualityTier);
    const size = pricingData.sizes.find(s => s.id === config.size);
    
    if (!tier || !size) return 0;

    const basePrice = Math.round(size.basePrice * tier.multiplier);
    
    // Calculate add-ons
    let addOnsTotal = 0;
    pricingData.addOns.forEach(addon => {
      if (addon.feeType === 'size-based') {
        const fee = addon.baseFee + (addon.stepMultiplier * size.step);
        if (addon.name === 'Shading' && config.hasShading) {
          addOnsTotal += fee;
        }
        if (addon.name === '2nd Color' && config.hasSecondColor) {
          addOnsTotal += fee;
        }
      }
    });

    return basePrice + addOnsTotal;
  };

  const handleAddToCart = () => {
    const tier = pricingData.qualityTiers.find(t => t.id === config.qualityTier);
    const size = pricingData.sizes.find(s => s.id === config.size);
    
    const cartItem = {
      type: 'custom',
      qualityTier: config.qualityTier,
      qualityLabel: tier.name,
      size: size.name,
      baseColor: config.baseColor,
      paintColor: config.paintColor,
      secondPaintColor: config.secondPaintColor,
      imageUrl: config.designUrl,
      previewUrl: config.designUrl,
      hasShading: config.hasShading,
      hasSecondColor: config.hasSecondColor,
      price: calculatePrice(),
      name: `Custom ${tier.name} Rug - ${size.name}`
    };

    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    
    navigate(createPageUrl('Cart'));
  };

  const price = calculatePrice();
  const isComplete = completionPercentage === 100;

  return (
    <Card className="p-6 shadow-lg sticky top-6">
      <div className="space-y-4">
        {/* Price Display */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Total Price</p>
          <motion.div
            key={price}
            initial={{ scale: 1.2, color: '#3b82f6' }}
            animate={{ scale: 1, color: '#111827' }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-black"
          >
            ${price}
          </motion.div>
        </div>

        {/* Breakdown */}
        {config.qualityTier && config.size && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t pt-4 space-y-2 text-sm"
          >
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-semibold">
                ${Math.round(
                  pricingData.sizes.find(s => s.id === config.size)?.basePrice *
                  pricingData.qualityTiers.find(t => t.id === config.qualityTier)?.multiplier
                )}
              </span>
            </div>
            
            {config.hasShading && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shading:</span>
                <span className="font-semibold text-purple-600">
                  +${pricingData.addOns.find(a => a.name === 'Shading')?.baseFee || 0}
                </span>
              </div>
            )}
            
            {config.hasSecondColor && (
              <div className="flex justify-between">
                <span className="text-gray-600">2nd Color:</span>
                <span className="font-semibold text-yellow-600">
                  +${pricingData.addOns.find(a => a.name === '2nd Color')?.baseFee || 0}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Add-ons Toggle */}
        <div className="border-t pt-4 space-y-2">
          <button
            onClick={() => {}}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left text-sm ${
              config.hasShading 
                ? 'border-purple-600 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">✨ Add Shading</span>
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
          </button>

          <button
            onClick={() => {}}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left text-sm ${
              config.hasSecondColor 
                ? 'border-yellow-600 bg-yellow-50' 
                : 'border-gray-200 hover:border-yellow-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">🎨 2nd Paint Color</span>
              <Zap className="w-4 h-4 text-yellow-600" />
            </div>
          </button>
        </div>

        {/* Add to Cart Button */}
        <motion.div
          animate={isComplete ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: isComplete ? Infinity : 0, duration: 1.5 }}
        >
          <Button
            onClick={handleAddToCart}
            disabled={!isComplete}
            className={`w-full h-14 text-lg font-bold ${
              isComplete
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-300'
            }`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isComplete ? 'Add to Cart' : `${completionPercentage}% Complete`}
          </Button>
        </motion.div>
      </div>
    </Card>
  );
}