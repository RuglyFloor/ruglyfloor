import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';

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
  const [showWarning, setShowWarning] = useState(false);
  const [pendingTab, setPendingTab] = useState('');
  
  const [config, setConfig] = useState({
    qualityTier: '',
    size: '',
    baseColor: '',
    paintColor: '',
    secondPaintColor: '',
    imageUrl: '',
    previewUrl: '',
    hasShading: false,
    hasSecondColor: false,
    referenceNotes: '',
    artworkMode: ''
  });

  const handleTabChange = (newTab) => {
    // If going back to quality and other fields are filled, warn user
    if (newTab === 'quality' && (config.size || config.paintColor || config.imageUrl)) {
      setShowWarning(true);
      setPendingTab(newTab);
      return;
    }
    // If going back to size and colors/design are filled, warn user
    if (newTab === 'size' && (config.paintColor || config.imageUrl)) {
      setShowWarning(true);
      setPendingTab(newTab);
      return;
    }
    // If going back to colors and design is filled, warn user
    if (newTab === 'colors' && config.imageUrl) {
      setShowWarning(true);
      setPendingTab(newTab);
      return;
    }
    setActiveTab(newTab);
  };

  const confirmTabChange = () => {
    // Reset dependent fields based on which tab we're going back to
    if (pendingTab === 'quality') {
      setConfig(prev => ({ ...prev, size: '', baseColor: '', paintColor: '', imageUrl: '', artworkMode: '', referenceNotes: '' }));
    } else if (pendingTab === 'size') {
      setConfig(prev => ({ ...prev, baseColor: '', paintColor: '', imageUrl: '', artworkMode: '', referenceNotes: '' }));
    } else if (pendingTab === 'colors') {
      setConfig(prev => ({ ...prev, imageUrl: '', artworkMode: '', referenceNotes: '' }));
    }
    setActiveTab(pendingTab);
    setShowWarning(false);
    setPendingTab('');
  };

  const currentPrice = () => {
    if (!config.size || !config.qualityTier) return 0;
    const selectedSize = SIZES.find(s => s.value === config.size);
    const selectedTier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
    return Math.round(selectedSize.price * selectedTier.priceMultiplier);
  };

  const handleAddToCart = async () => {
    const selectedSize = SIZES.find(s => s.value === config.size);
    const selectedTier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
    
    // Submit to Notion
    try {
      await base44.functions.invoke('submitArtworkToNotion', {
        qualityLevel: selectedTier.label,
        size: selectedSize.label,
        color: config.baseColor,
        artworkMode: config.artworkMode || 'Paint (in-browser)',
        artworkFile: config.imageUrl,
        referenceNotes: config.referenceNotes
      });
      console.log('Artwork submitted to Notion');
    } catch (error) {
      console.error('Failed to submit to Notion:', error);
    }

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
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="size">Size</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
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
                    <div>
                      <Label className="mb-2 block">Artwork Method</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            setDesignMode('draw');
                            setConfig(prev => ({ ...prev, artworkMode: 'Paint (in-browser)' }));
                          }}
                          className={`p-4 rounded-lg border-2 ${
                            designMode === 'draw' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <Pencil className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-sm font-semibold">Paint (in-browser)</div>
                        </button>
                        <button
                          onClick={() => {
                            setDesignMode('upload');
                            setConfig(prev => ({ ...prev, artworkMode: 'Upload image' }));
                          }}
                          className={`p-4 rounded-lg border-2 ${
                            designMode === 'upload' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <Upload className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-sm font-semibold">Upload Image</div>
                        </button>
                      </div>
                    </div>

                    {designMode === 'upload' && (
                      <div>
                        <Label>Upload Your Design</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const formData = new FormData();
                              formData.append('file', file);
                              const { file_url } = await base44.integrations.Core.UploadFile({ file });
                              setConfig(prev => ({ ...prev, imageUrl: file_url }));
                            }
                          }}
                          className="mt-2 w-full border-2 border-gray-200 rounded-lg p-2"
                        />
                      </div>
                    )}

                    <div>
                      <Label>Notes for AI (Optional)</Label>
                      <Textarea
                        value={config.referenceNotes}
                        onChange={(e) => setConfig(prev => ({ ...prev, referenceNotes: e.target.value }))}
                        placeholder="Example: Make it bold, vintage style, vibrant colors..."
                        className="mt-2"
                      />
                    </div>

                    {(config.imageUrl || designMode === 'draw') && (
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

        {/* Warning Dialog */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="text-yellow-600">⚠️ Warning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Changing this option will reset your selections for the following steps. You'll need to re-choose:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {pendingTab === 'quality' && (
                    <>
                      <li>Size</li>
                      <li>Colors</li>
                      <li>Design & Artwork</li>
                    </>
                  )}
                  {pendingTab === 'size' && (
                    <>
                      <li>Colors</li>
                      <li>Design & Artwork</li>
                    </>
                  )}
                  {pendingTab === 'colors' && (
                    <li>Design & Artwork</li>
                  )}
                </ul>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowWarning(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={confirmTabChange} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}