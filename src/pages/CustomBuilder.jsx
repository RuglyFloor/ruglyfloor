import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, CheckCircle, Pencil, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StencilCreator from '../components/custom/StencilCreator';

import DrawingCanvas from '../components/custom/DrawingCanvas';
import DesignLibrary from '../components/custom/DesignLibrary';
import InteractiveRugPreview from '../components/custom/InteractiveRugPreview';
import BuilderSidebar from '../components/custom/BuilderSidebar';
import SEOHead from '../components/seo/SEOHead';
import { useSEO } from '../components/seo/useSEO';

const SIZES = [
  { id: 'tiny', label: 'Tiny', value: 'tiny', price: 79, originalPrice: 99, measurement: '2x3' },
  { id: 'sm', label: 'Small', value: 'small', price: 200, originalPrice: 225, measurement: '4x6' },
  { id: 'md', label: 'Medium', value: 'medium', price: 300, originalPrice: 350, measurement: '5x7' },
  { id: 'lg', label: 'Large', value: 'large', price: 400, originalPrice: 450, measurement: '8x10' },
  { id: 'hg', label: 'Huge', value: 'huge', price: 500, originalPrice: 550, measurement: '9x11' },
  { id: 'rd', label: '3.14', value: '4ft round', price: 250, originalPrice: 275, measurement: '4 foot round' }
];

const getColorPrice = (size, numColors) => {
  if (numColors === 2) return 0;
  const sizeMap = { tiny: 39, small: 69, medium: 99, large: 129, huge: 159, '4ft round': 69 };
  const basePrice = sizeMap[size] || 39;
  if (numColors === 3) return basePrice;
  if (numColors === 4) return basePrice * 2;
  return 0;
};

const get3DPrice = (size) => {
  const sizeMap = { tiny: 100, small: 200, medium: 250, large: 300, huge: 350, '4ft round': 200 };
  return sizeMap[size] || 200;
};

const BASE_COLORS = [
  { name: 'Yellow', hex: '#f4d03f', type: 'light' },
  { name: 'Pink', hex: '#f8c9d4', type: 'light' },
  { name: 'White', hex: '#ffffff', type: 'light' },
  { name: 'Burnt Orange', hex: '#cc5500', type: 'dark' },
  { name: 'Grey', hex: '#9ca3af', type: 'light' },
  { name: 'Green', hex: '#86cb92', type: 'light' },
  { name: 'Tan', hex: '#d2b48c', type: 'light' },
  { name: 'Khaki', hex: '#c3b091', type: 'light' }
];

const PAINT_COLORS = [
  // First set - Only for light base rugs
  { name: 'Sun Yellow', hex: '#ffd700', type: 'dark' },
  { name: 'Bright Orange', hex: '#ff4500', type: 'dark' },
  { name: 'Red', hex: '#dc143c', type: 'dark' },
  { name: 'Violet', hex: '#7851a9', type: 'dark' },
  { name: 'Blue', hex: '#2e5090', type: 'dark' },
  { name: 'Bright Green', hex: '#00a651', type: 'dark' },
  { name: 'Black', hex: '#000000', type: 'dark' },
  { name: 'White', hex: '#ffffff', type: 'dark' },
  // Second set - Works with both light and dark base rugs
  { name: 'Emerald Green', hex: '#046307', type: 'both' },
  { name: 'Crimson', hex: '#c8102e', type: 'both' },
  { name: 'Purple', hex: '#5b3a70', type: 'both' },
  { name: 'Dioxazine Purple', hex: '#1c0d82', type: 'both' },
  { name: 'Hansa Yellow', hex: '#ffd300', type: 'both' },
  { name: 'Vermillion', hex: '#ff4500', type: 'both' }
];

export default function CustomBuilder() {
  const navigate = useNavigate();
  const seoData = useSEO('custom-builder');
  const [step, setStep] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [designMode, setDesignMode] = useState('draw'); // 'library', 'upload', or 'draw'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);
  const [config, setConfig] = useState({
    size: '',
    baseColor: '',
    paintColor: '',
    secondPaintColor: '',
    imageFile: null,
    imageUrl: '',
    previewUrl: '',
    numColors: 2,
    designInstructions: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setConfig(prev => ({ ...prev, imageFile: file, imageUrl: file_url, previewUrl: file_url }));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrawingSave = async (drawingFile) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: drawingFile });
      // For drawings, use the actual drawing as both the design and preview
      setConfig(prev => ({ ...prev, imageFile: drawingFile, imageUrl: file_url, previewUrl: file_url }));
    } catch (error) {
      alert('Failed to save drawing');
    } finally {
      setUploading(false);
    }
  };



  const handleAddToCart = () => {
    const selectedSize = SIZES.find(s => s.value === config.size);
    const basePrice = selectedSize.price;
    const colorPrice = getColorPrice(config.size, config.numColors);
    const price = basePrice + colorPrice;
    
    const cartItem = {
      type: 'custom',
      size: selectedSize.label,
      baseColor: config.baseColor,
      paintColor: config.paintColor,
      secondPaintColor: config.secondPaintColor || null,
      imageUrl: config.imageUrl,
      previewUrl: config.previewUrl,
      numColors: config.numColors,
      designInstructions: config.designInstructions || '',
      price: price,
      name: `Custom Rug - ${selectedSize.label}`
    };

    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    
    navigate(createPageUrl('Cart'));
  };

  const currentPrice = () => {
    if (!config.size) return 0;
    const selectedSize = SIZES.find(s => s.value === config.size);
    const basePrice = selectedSize.price;
    const colorPrice = getColorPrice(config.size, config.numColors);
    return basePrice + colorPrice;
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <SEOHead
        title={seoData?.seo_title || "Custom Rug Builder | Perfect Mother's Day & Father's Day Gifts"}
        description={seoData?.seo_description || "Design custom hand-painted rugs online - unique mothers day gifts, fathers day gifts, and personalized gifts for anyone. Create personalized floor art rugs with our builder. Customizable stencil rug designs, washable custom painted rugs for any space. Perfect for interior designers and homeowners."}
        keywords={seoData?.seo_keywords || ['mothers day gifts unique', 'fathers day gifts personalized', 'gifts for hard to buy for people', 'custom hand-painted rugs for interior designers', 'personalized floor art rugs', 'customizable stencil rug designs', 'custom painted washable rugs', 'hand-painted low-pile rugs for high traffic', 'personalized rugs for nursery hand-painted', 'custom painted rugs for Airbnb decor']}
        url="/custom-builder"
      />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Design Your Custom Rug</h1>
        <p className="text-center text-gray-600 mb-8">Create a one-of-a-kind piece in three simple steps</p>

        {/* Progress Indicator */}
        <div className="relative mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Size' },
              { num: 2, label: 'Colors' },
              { num: 3, label: 'Design & Confirm' }
            ].map((s, idx) => (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  step >= s.num 
                    ? 'border-4 border-gray-900 bg-white text-gray-900 shadow-lg scale-110' 
                    : 'border-2 border-gray-300 bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                </div>
                <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {idx < 2 && (
                  <div className="absolute top-6 left-0 right-0 h-0.5 -z-10" style={{ 
                    left: `${(idx * 50) + 25}%`, 
                    width: '50%',
                    background: step > s.num ? '#1f2937' : '#e5e7eb'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {config.previewUrl && step === 3 && (
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="border-4 border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-bold shadow-2xl"
          >
            Add to Cart - ${currentPrice()}
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Size Selection */}
            {step === 1 && (
           <div className={`space-y-6 transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 text-gray-900">
                Pick Your Perfect Size
              </h2>
              <p className="text-gray-600 text-lg">All sizes come with our signature hand-painted quality</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => {
                    setTransitioning(true);
                    setConfig(prev => ({ ...prev, size: size.value }));
                    setTimeout(() => {
                      setStep(2);
                      setTransitioning(false);
                    }, 400);
                  }}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    config.size === size.value 
                      ? 'border-4 border-gray-900 shadow-2xl scale-105' 
                      : 'border-2 border-gray-300 hover:border-gray-400 hover:shadow-xl hover:scale-102 shadow-md'
                  }`}
                >
                  <div className={`absolute inset-0 transition-opacity ${
                    config.size === size.value 
                      ? 'bg-white opacity-100' 
                      : 'bg-gray-50 opacity-100 group-hover:bg-white'
                  }`} />

                  <div className="relative p-8 flex flex-col items-center">
                    {config.size === size.value && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    )}

                    <div className={`w-24 h-24 mb-4 rounded-xl flex items-center justify-center transition-all ${
                      config.size === size.value 
                        ? 'border-2 border-gray-900' 
                        : 'border-2 border-gray-300'
                    }`}>
                      <div className={`text-5xl font-black ${
                        config.size === size.value ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {size.id === 'rd' ? 'π' : size.label.charAt(0)}
                      </div>
                    </div>

                    <div className={`font-bold text-2xl mb-2 ${
                      config.size === size.value ? 'text-gray-900' : 'text-gray-900'
                    }`}>
                      {size.label}
                    </div>

                    <div className={`text-sm mb-4 ${
                      config.size === size.value ? 'text-gray-600' : 'text-gray-600'
                    }`}>
                      {size.measurement}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className={`text-lg line-through ${
                        config.size === size.value ? 'text-gray-400' : 'text-gray-400'
                      }`}>
                        ${size.originalPrice}
                      </span>
                      <span className={`text-3xl font-black ${
                        config.size === size.value ? 'text-gray-900' : 'text-gray-900'
                      }`}>
                        ${size.price}
                      </span>
                    </div>

                    <div className={`mt-3 text-xs font-semibold ${
                      config.size === size.value ? 'text-green-600' : 'text-green-600'
                    }`}>
                      SAVE ${size.originalPrice - size.price}
                    </div>
                  </div>
                </button>
              ))}
            </div>


            </div>
          )}

          {/* Step 2: Color Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900">
                    Choose Colors
                  </h2>
                  <p className="text-gray-600 text-lg">Pick the actual rug color and the paint color for your design</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg mb-3 block">Rug Base Color</Label>
                    <div className="grid grid-cols-4 gap-4">
                      {BASE_COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setConfig(prev => ({ ...prev, baseColor: color.name }))}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all group relative ${
                            config.baseColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          title={`Set ${color.name} as your rug's base color`}
                        >
                          <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            Make the base color of your rug {color.name}
                          </span>
                          <div 
                           className="relative w-16 h-12 rounded-sm border-2 border-white shadow-md overflow-hidden"
                           style={{ backgroundColor: color.hex }}
                          >
                           <div 
                             className="absolute inset-0 opacity-30"
                             style={{
                               backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.15' fill-rule='evenodd'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
                               backgroundSize: '6px 6px'
                             }}
                           />
                          </div>
                          <span className="text-xs text-center">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-lg mb-3 block">1st Paint Color for Design</Label>

                    {/* First Set - Base-specific colors */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Primary Colors</p>
                      <div className="grid grid-cols-3 gap-4">
                        {PAINT_COLORS.filter(color => {
                          if (!config.baseColor) return color.type === 'dark';
                          const selectedBase = BASE_COLORS.find(c => c.name === config.baseColor);
                          if (!selectedBase) return color.type === 'dark';
                          return selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light';
                        }).map((color) => (
                          <button
                            key={`primary-${color.name}-${color.hex}`}
                            onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all group relative ${
                              config.paintColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            title={`Paint your design in ${color.name}`}
                          >
                            <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                              Paint your design in {color.name}
                            </span>
                            <div 
                              className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-md"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs text-center">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs text-gray-500">Add 2nd Color (Optional +${getColorPrice(config.size, 3)})</span>
                      </div>
                    </div>

                    {/* Second Set - Universal colors for 2nd paint color */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">2nd Paint Color (Universal Colors)</p>
                      <div className="grid grid-cols-3 gap-4">
                        {PAINT_COLORS.filter(color => color.type === 'both').map((color, idx) => (
                          <button
                            key={`both-${color.name}-${color.hex}-${idx}`}
                            onClick={() => setConfig(prev => ({ 
                              ...prev, 
                              secondPaintColor: prev.secondPaintColor === color.name ? '' : color.name,
                              numColors: prev.secondPaintColor === color.name ? 2 : 3
                            }))}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all group relative ${
                              config.secondPaintColor === color.name ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            title={`Add ${color.name} as a second color (+$${getColorPrice(config.size, 3)})`}
                          >
                            <span className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                              Add {color.name} as 2nd paint color<br/>Adds ${getColorPrice(config.size, 3)} to price
                            </span>
                            <div 
                              className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-md"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs text-center">{color.name}</span>
                          </button>
                        ))}
                      </div>
                      {config.secondPaintColor && (
                        <p className="text-xs text-green-600 mt-2 font-semibold">
                          ✓ 2nd color selected: {config.secondPaintColor}
                        </p>
                      )}
                    </div>


                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                   <Button variant="outline" onClick={() => setStep(1)}>
                     Back
                   </Button>
                   <Button 
                     onClick={() => setStep(3)} 
                     disabled={!config.baseColor || !config.paintColor}
                     title="Continue to design selection"
                     className="flex-1 border-4 border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-bold text-lg py-6 group relative disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     BUILD MY RUG →
                     <span className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                       Next: Choose or create your design
                     </span>
                   </Button>
                 </div>
                 </CardContent>
                 </Card>
                 )}

          {/* Step 3: Create Design & Confirm */}
          {step === 3 && (
            <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <CardTitle className="flex-1">Step 3: Create Your Design & Confirm</CardTitle>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Design your rug and preview before adding to cart
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mode Selection */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => setDesignMode('library')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      designMode === 'library' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <div className="font-semibold text-lg mb-1">Design Library</div>
                    <div className="text-sm text-gray-600">Choose from our collection</div>
                  </button>
                  <button
                    onClick={() => setDesignMode('draw')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      designMode === 'draw' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Pencil className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <div className="font-semibold text-lg mb-1">Draw Your Own</div>
                    <div className="text-sm text-gray-600">Create with our drawing tools</div>
                  </button>
                  <button
                    onClick={() => setDesignMode('upload')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      designMode === 'upload' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <div className="font-semibold text-lg mb-1">Upload & Convert</div>
                    <div className="text-sm text-gray-600">Upload an image and convert to stencil</div>
                  </button>
                </div>

                {/* Design Library Mode */}
                {designMode === 'library' && (
                  <>
                    <DesignLibrary
                      onSelectDesign={(url) => {
                        setConfig(prev => ({ ...prev, imageUrl: url, previewUrl: url }));
                      }}
                    />
                  </>
                )}



                {/* Upload Mode */}
                {designMode === 'upload' && (
                  <StencilCreator
                    paintColor={PAINT_COLORS.find(c => c.name === config.paintColor)?.hex || '#000000'}
                    baseColor={BASE_COLORS.find(c => c.name === config.baseColor)?.hex || '#86cb92'}
                    onSaveStencil={(stencilUrl) => {
                      setConfig(prev => ({ ...prev, imageUrl: stencilUrl, previewUrl: stencilUrl }));
                    }}
                    onConfigChange={({ colors }) => {
                      setConfig(prev => ({ ...prev, numColors: colors }));
                    }}
                  />
                )}

                {/* Drawing Mode */}
                {designMode === 'draw' && (
                  <DrawingCanvas 
                    onSaveDrawing={handleDrawingSave}
                    onColorCountChange={(count) => {
                      setConfig(prev => ({ ...prev, numColors: count }));
                    }}
                    availableColors={[
                      { name: config.paintColor, hex: PAINT_COLORS.find(c => c.name === config.paintColor)?.hex || '#000000' },
                      ...(config.secondPaintColor ? [{ name: config.secondPaintColor, hex: PAINT_COLORS.find(c => c.name === config.secondPaintColor)?.hex }] : [])
                    ].filter(c => c.hex)}
                    size={config.size}
                  />
                )}

                {config.previewUrl && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <Label className="block mb-2 font-semibold text-green-900">✨ Your Custom Rug Preview</Label>
                      <InteractiveRugPreview
                        designUrl={config.previewUrl}
                        baseColor={BASE_COLORS.find(c => c.name === config.baseColor)?.hex || '#ffffff'}
                        paintColor={PAINT_COLORS.find(c => c.name === config.paintColor)?.hex || '#000000'}
                        size={config.size}
                      />
                      <p className="text-sm text-green-700 my-4">
                        Real-time preview • Colors and design update instantly
                      </p>

                        {/* Final Summary */}
                        <div className="bg-white rounded-lg p-4 mb-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Size:</span>
                            <span className="font-semibold">{SIZES.find(s => s.value === config.size)?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base Color:</span>
                            <span className="font-semibold">{config.baseColor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Paint Colors:</span>
                            <span className="font-semibold">{config.paintColor}{config.secondPaintColor ? `, ${config.secondPaintColor}` : ''}</span>
                          </div>
                        </div>

                        <Button
                          onClick={handleAddToCart}
                          className="w-full border-4 border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-bold text-lg py-6 group relative"
                          title="Add this custom rug to your shopping cart"
                        >
                          Add to Cart - ${currentPrice()}
                          <span className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Adds this rug to your cart • You can checkout or keep designing
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Base Price:</span>
                    <span className="text-3xl font-bold text-blue-600">${currentPrice()}</span>
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>{SIZES.find(s => s.value === config.size)?.label} Base:</span>
                      <span className="font-semibold">${SIZES.find(s => s.value === config.size)?.price}</span>
                    </div>
                    {config.numColors > 2 && (
                      <div className="flex justify-between">
                        <span>{config.numColors} Colors:</span>
                        <span className="font-semibold">+${getColorPrice(config.size, config.numColors)}</span>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </CardContent>
          </Card>
          )}


        </div>

        <div className="hidden lg:block sticky top-6 self-start">
          <BuilderSidebar
            step={step}
            config={config}
            currentPrice={currentPrice()}
            baseColors={BASE_COLORS}
            paintColors={PAINT_COLORS}
            key={`${config.baseColor}-${config.paintColor}-${config.imageUrl}`}
          />
        </div>
      </div>
      </div>
    </div>
  );
}