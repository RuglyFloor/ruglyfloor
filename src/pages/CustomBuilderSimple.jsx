import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const QUALITY_TIERS = [
  { id: 'budget', label: 'Budget Crugly', price: 79, description: 'Perfect for dorms & kids' },
  { id: 'good', label: 'Standard Crugly', price: 200, description: 'Our best seller' },
  { id: 'highend', label: 'Rugly', price: 500, description: 'Premium quality' }
];

const SIZES = [
  { id: 'sm', label: 'Small', value: 'small', icon: '□' },
  { id: 'md', label: 'Medium', value: 'medium', icon: '▢' },
  { id: 'lg', label: 'Large', value: 'large', icon: '▣' }
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
  { name: 'Yellow', hex: '#ffd700' },
  { name: 'Red', hex: '#dc143c' },
  { name: 'Blue', hex: '#2e5090' },
  { name: 'Black', hex: '#000000' }
];

export default function CustomBuilderSimple() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    qualityTier: '',
    size: '',
    baseColor: '',
    paintColor: ''
  });

  const currentPrice = () => {
    if (!config.qualityTier) return 0;
    return QUALITY_TIERS.find(t => t.id === config.qualityTier)?.price || 0;
  };

  const handleAddToCart = () => {
    const selectedTier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
    const selectedSize = SIZES.find(s => s.value === config.size);
    
    const cartItem = {
      type: 'custom',
      qualityTier: config.qualityTier,
      qualityLabel: selectedTier.label,
      size: selectedSize.label,
      baseColor: config.baseColor,
      paintColor: config.paintColor,
      price: currentPrice(),
      name: `Custom ${selectedTier.label} Rug`
    };

    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    navigate(createPageUrl('Cart'));
  };

  const canProceed = () => {
    if (step === 1) return config.qualityTier;
    if (step === 2) return config.size;
    if (step === 3) return config.baseColor && config.paintColor;
    return false;
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Simplified Builder</h1>
        <p className="text-center text-gray-600 mb-8">Quick and easy 3-step process</p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Quality</span>
            <span>Size & Colors</span>
            <span>Design</span>
          </div>
        </div>

        {/* Step 1: Quality */}
        {step === 1 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Step 1: Choose Your Quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {QUALITY_TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setConfig(prev => ({ ...prev, qualityTier: tier.id }))}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    config.qualityTier === tier.id 
                      ? 'border-blue-600 bg-blue-50 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xl font-bold mb-1">{tier.label}</div>
                      <div className="text-sm text-gray-600">{tier.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">${tier.price}</div>
                      {config.qualityTier === tier.id && (
                        <CheckCircle className="w-6 h-6 text-blue-600 mt-2 ml-auto" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Size & Colors */}
        {step === 2 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Step 2: Size & Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Size */}
              <div>
                <div className="font-semibold mb-3">Choose Size</div>
                <div className="grid grid-cols-3 gap-4">
                  {SIZES.map(size => (
                    <button
                      key={size.id}
                      onClick={() => setConfig(prev => ({ ...prev, size: size.value }))}
                      className={`p-6 rounded-lg border-2 ${
                        config.size === size.value 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-4xl mb-2">{size.icon}</div>
                      <div className="font-bold">{size.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Color */}
              <div>
                <div className="font-semibold mb-3">Base Color</div>
                <div className="grid grid-cols-6 gap-3">
                  {BASE_COLORS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setConfig(prev => ({ ...prev, baseColor: color.name }))}
                      className={`aspect-square rounded-lg border-2 ${
                        config.baseColor === color.name 
                          ? 'border-blue-600 ring-2 ring-blue-300' 
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Paint Color */}
              <div>
                <div className="font-semibold mb-3">Paint Color</div>
                <div className="grid grid-cols-4 gap-3">
                  {PAINT_COLORS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                      className={`aspect-square rounded-lg border-2 ${
                        config.paintColor === color.name 
                          ? 'border-blue-600 ring-2 ring-blue-300' 
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Design */}
        {step === 3 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Step 3: Create Your Design</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center text-gray-400 mb-6">
                Design Canvas Area
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">${currentPrice()}</div>
                  <div className="text-sm text-gray-600">
                    {QUALITY_TIERS.find(t => t.id === config.qualityTier)?.label} • 
                    {SIZES.find(s => s.value === config.size)?.label}
                  </div>
                </div>
                <Button onClick={handleAddToCart} className="w-full" size="lg">
                  Add to Cart <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            ← Back
          </Button>
          {step < 3 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}