import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CheckCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const QUALITY_TIERS = [
  { id: 'budget', label: 'Budget Crugly', description: 'Synthetic but effective', priceMultiplier: 0.7 },
  { id: 'good', label: 'Standard Crugly', description: 'Standard rug lifespan', priceMultiplier: 1.0 },
  { id: 'highend', label: 'Rugly', description: 'Premium hand-painted', priceMultiplier: 2.5 }
];

const SIZES = [
  { id: 'tiny', label: 'Tiny', value: 'tiny', price: 79, measurement: '2x3' },
  { id: 'sm', label: 'Small', value: 'small', price: 200, measurement: '4x6' },
  { id: 'md', label: 'Medium', value: 'medium', price: 300, measurement: '5x7' },
  { id: 'lg', label: 'Large', value: 'large', price: 400, measurement: '8x10' }
];

const BASE_COLORS = [
  { name: 'Yellow', hex: '#f4d03f' },
  { name: 'Pink', hex: '#f8c9d4' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Green', hex: '#86cb92' },
  { name: 'Tan', hex: '#d2b48c' }
];

const PAINT_COLORS = [
  { name: 'Sun Yellow', hex: '#ffd700' },
  { name: 'Red', hex: '#dc143c' },
  { name: 'Blue', hex: '#2e5090' },
  { name: 'Black', hex: '#000000' }
];

export default function CustomBuilderDrawer() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    qualityTier: '',
    size: '',
    baseColor: '',
    paintColor: '',
    imageUrl: ''
  });

  const [openDrawer, setOpenDrawer] = useState(null);

  const currentPrice = () => {
    if (!config.size || !config.qualityTier) return 0;
    const selectedSize = SIZES.find(s => s.value === config.size);
    const selectedTier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
    return Math.round(selectedSize.price * selectedTier.priceMultiplier);
  };

  const handleAddToCart = () => {
    const selectedSize = SIZES.find(s => s.value === config.size);
    const selectedTier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
    
    const cartItem = {
      type: 'custom',
      qualityTier: config.qualityTier,
      qualityLabel: selectedTier.label,
      size: selectedSize.label,
      baseColor: config.baseColor,
      paintColor: config.paintColor,
      price: currentPrice(),
      name: `Custom ${selectedTier.label} Rug - ${selectedSize.label}`
    };

    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    navigate(createPageUrl('Cart'));
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Drawer-Based Builder</h1>
        <p className="text-center text-gray-600 mb-8">Click cards to customize in slide-out panels</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quality Card */}
            <Sheet open={openDrawer === 'quality'} onOpenChange={(open) => setOpenDrawer(open ? 'quality' : null)}>
              <SheetTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Quality Level</div>
                        <div className="text-xl font-bold">
                          {config.qualityTier 
                            ? QUALITY_TIERS.find(t => t.id === config.qualityTier)?.label 
                            : 'Choose Quality'}
                        </div>
                      </div>
                      <Settings className="w-6 h-6 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Choose Quality Level</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  {QUALITY_TIERS.map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => {
                        setConfig(prev => ({ ...prev, qualityTier: tier.id }));
                        setOpenDrawer(null);
                      }}
                      className={`w-full p-4 rounded-lg border-2 text-left ${
                        config.qualityTier === tier.id 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold">{tier.label}</div>
                          <div className="text-sm text-gray-600">{tier.description}</div>
                        </div>
                        {config.qualityTier === tier.id && <CheckCircle className="w-5 h-5 text-blue-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Size Card */}
            <Sheet open={openDrawer === 'size'} onOpenChange={(open) => setOpenDrawer(open ? 'size' : null)}>
              <SheetTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Size</div>
                        <div className="text-xl font-bold">
                          {config.size 
                            ? SIZES.find(s => s.value === config.size)?.label 
                            : 'Choose Size'}
                        </div>
                      </div>
                      <Settings className="w-6 h-6 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Choose Size</SheetTitle>
                </SheetHeader>
                <div className="space-y-3 mt-6">
                  {SIZES.map(size => (
                    <button
                      key={size.id}
                      onClick={() => {
                        setConfig(prev => ({ ...prev, size: size.value }));
                        setOpenDrawer(null);
                      }}
                      className={`w-full p-4 rounded-lg border-2 ${
                        config.size === size.value 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-bold">{size.label}</div>
                          <div className="text-sm text-gray-600">{size.measurement}</div>
                        </div>
                        <div className="text-lg font-bold">
                          ${config.qualityTier ? Math.round(size.price * QUALITY_TIERS.find(t => t.id === config.qualityTier).priceMultiplier) : size.price}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Colors Card */}
            <Sheet open={openDrawer === 'colors'} onOpenChange={(open) => setOpenDrawer(open ? 'colors' : null)}>
              <SheetTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Colors</div>
                        <div className="text-xl font-bold">
                          {config.baseColor && config.paintColor 
                            ? `${config.baseColor} / ${config.paintColor}` 
                            : 'Choose Colors'}
                        </div>
                      </div>
                      <Settings className="w-6 h-6 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Choose Colors</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <div className="font-semibold mb-3">Base Color</div>
                    <div className="grid grid-cols-3 gap-3">
                      {BASE_COLORS.map(color => (
                        <button
                          key={color.name}
                          onClick={() => setConfig(prev => ({ ...prev, baseColor: color.name }))}
                          className={`p-3 rounded-lg border-2 ${
                            config.baseColor === color.name ? 'border-blue-600' : 'border-gray-200'
                          }`}
                        >
                          <div 
                            className="w-full aspect-square rounded-lg mb-2" 
                            style={{ backgroundColor: color.hex }} 
                          />
                          <div className="text-xs text-center">{color.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold mb-3">Paint Color</div>
                    <div className="grid grid-cols-3 gap-3">
                      {PAINT_COLORS.map(color => (
                        <button
                          key={color.name}
                          onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                          className={`p-3 rounded-lg border-2 ${
                            config.paintColor === color.name ? 'border-blue-600' : 'border-gray-200'
                          }`}
                        >
                          <div 
                            className="w-full aspect-square rounded-lg mb-2" 
                            style={{ backgroundColor: color.hex }} 
                          />
                          <div className="text-xs text-center">{color.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Design Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-3">Design Your Rug</div>
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center text-gray-400">
                  Design Canvas Area
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky Summary */}
          <div className="hidden lg:block">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <div className="text-xl font-bold mb-4">Summary</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality:</span>
                    <span className="font-semibold">
                      {config.qualityTier ? QUALITY_TIERS.find(t => t.id === config.qualityTier)?.label : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-semibold">
                      {config.size ? SIZES.find(s => s.value === config.size)?.label : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Colors:</span>
                    <span className="font-semibold">
                      {config.baseColor && config.paintColor 
                        ? `${config.baseColor} / ${config.paintColor}` 
                        : '—'}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">${currentPrice()}</span>
                  </div>
                  <Button 
                    onClick={handleAddToCart} 
                    className="w-full"
                    disabled={!config.qualityTier || !config.size || !config.baseColor || !config.paintColor}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}