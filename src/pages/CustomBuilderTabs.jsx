import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, Pencil, FileText, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StencilCreator from '../components/custom/StencilCreator';
import DrawingCanvas from '../components/custom/DrawingCanvas';
import DesignLibrary from '../components/custom/DesignLibrary';
import InteractiveRugPreview from '../components/custom/InteractiveRugPreview';
import AIAssistant from '../components/custom/AIAssistant';

const QUALITY_TIERS = [
  { id: 'budget', label: 'Budget Crugly', description: 'Synthetic but effective', priceMultiplier: 0.7 },
  { id: 'good', label: 'Standard Crugly', description: 'Standard rug lifespan', priceMultiplier: 1.0 },
  { id: 'highend', label: 'Rugly', description: 'Premium hand-painted', priceMultiplier: 2.5 }
];

const SIZES = [
  { id: 'tiny', label: 'Tiny', value: 'tiny', price: 79, measurement: '2x3' },
  { id: 'sm', label: 'Small', value: 'small', price: 200, measurement: '4x6' },
  { id: 'md', label: 'Medium', value: 'medium', price: 300, measurement: '5x7' },
  { id: 'lg', label: 'Large', value: 'large', price: 400, measurement: '8x10' },
  { id: 'hg', label: 'Huge', value: 'huge', price: 500, measurement: '9x11' },
  { id: 'rd', label: '3.14', value: '4ft round', price: 250, measurement: '4 foot round' }
];

const BASE_COLORS = [
  { name: 'Yellow', hex: '#f4d03f' },
  { name: 'Pink', hex: '#f8c9d4' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Burnt Orange', hex: '#cc5500' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Green', hex: '#86cb92' },
  { name: 'Tan', hex: '#d2b48c' },
  { name: 'Khaki', hex: '#c3b091' }
];

const PAINT_COLORS = [
  { name: 'Sun Yellow', hex: '#ffd700' },
  { name: 'Bright Orange', hex: '#ff4500' },
  { name: 'Red', hex: '#dc143c' },
  { name: 'Violet', hex: '#7851a9' },
  { name: 'Blue', hex: '#2e5090' },
  { name: 'Bright Green', hex: '#00a651' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' }
];

export default function CustomBuilderTabs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('quality');
  const [designMode, setDesignMode] = useState('draw');
  
  const [config, setConfig] = useState({
    qualityTier: '',
    size: '',
    baseColor: '',
    paintColor: '',
    secondPaintColor: '',
    imageUrl: '',
    previewUrl: '',
    hasShading: false,
    hasSecondColor: false
  });

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
      imageUrl: config.imageUrl,
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
        <h1 className="text-4xl font-bold text-center mb-2">Tab-Based Builder</h1>
        <p className="text-center text-gray-600 mb-8">Navigate through tabs to customize your rug</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Builder Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="size" disabled={!config.qualityTier}>Size</TabsTrigger>
                <TabsTrigger value="colors" disabled={!config.size}>Colors</TabsTrigger>
                <TabsTrigger value="design" disabled={!config.paintColor}>Design</TabsTrigger>
              </TabsList>

              {/* Quality Tab */}
              <TabsContent value="quality">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Quality Level</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {QUALITY_TIERS.map(tier => (
                      <button
                        key={tier.id}
                        onClick={() => {
                          setConfig(prev => ({ ...prev, qualityTier: tier.id }));
                          setActiveTab('size');
                        }}
                        className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                          config.qualityTier === tier.id 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-xl">{tier.label}</div>
                            <div className="text-sm text-gray-600 mt-1">{tier.description}</div>
                          </div>
                          {config.qualityTier === tier.id && <CheckCircle className="w-6 h-6 text-blue-600" />}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Size Tab */}
              <TabsContent value="size">
                <Card>
                  <CardHeader>
                    <CardTitle>Pick Your Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {SIZES.map(size => (
                        <button
                          key={size.id}
                          onClick={() => {
                            setConfig(prev => ({ ...prev, size: size.value }));
                            setActiveTab('colors');
                          }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            config.size === size.value 
                              ? 'border-blue-600 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-xl font-bold mb-2">{size.label}</div>
                          <div className="text-sm text-gray-600 mb-2">{size.measurement}</div>
                          <div className="text-lg font-bold">
                            ${config.qualityTier ? Math.round(size.price * QUALITY_TIERS.find(t => t.id === config.qualityTier).priceMultiplier) : size.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-3 block">Base Color</Label>
                      <div className="grid grid-cols-4 gap-3">
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
                      <Label className="text-lg font-semibold mb-3 block">Paint Color</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {PAINT_COLORS.map(color => (
                          <button
                            key={color.name}
                            onClick={() => {
                              setConfig(prev => ({ ...prev, paintColor: color.name }));
                              setActiveTab('design');
                            }}
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Your Design</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setDesignMode('draw')}
                        className={`p-4 rounded-lg border-2 ${
                          designMode === 'draw' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <Pencil className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-semibold">Draw</div>
                      </button>
                      <button
                        onClick={() => setDesignMode('upload')}
                        className={`p-4 rounded-lg border-2 ${
                          designMode === 'upload' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <Upload className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-semibold">Upload</div>
                      </button>
                    </div>

                    {config.imageUrl && (
                      <Button onClick={handleAddToCart} className="w-full" size="lg">
                        Add to Cart - ${currentPrice()}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Summary Sidebar */}
          <div className="hidden lg:block">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Your Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
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
                    <span className="text-gray-600">Base Color:</span>
                    <span className="font-semibold">{config.baseColor || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paint Color:</span>
                    <span className="font-semibold">{config.paintColor || '—'}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">${currentPrice()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}