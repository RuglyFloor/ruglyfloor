import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StencilCreator from '../components/custom/StencilCreator';
import UpsellOptions from '../components/custom/UpsellOptions';

const SIZES = [
  { id: 'sm', label: 'Small', value: 'small', price: 200, originalPrice: 225, measurement: '4x6' },
  { id: 'md', label: 'Medium', value: 'medium', price: 300, originalPrice: 350, measurement: '5x7' },
  { id: 'lg', label: 'Large', value: 'large', price: 400, originalPrice: 450, measurement: '8x10' },
  { id: 'hg', label: 'Huge', value: 'huge', price: 500, originalPrice: 550, measurement: '9x11' },
  { id: 'rd', label: '4 Foot Round', value: '4ft round', price: 200, originalPrice: 225, measurement: '4 feet round' }
];

const getColorPrice = (size, numColors) => {
  if (numColors === 2) return 0;
  const sizeMap = { small: 0, medium: 50, large: 100, huge: 150, '4ft round': 0 };
  const sizeUpcharge = sizeMap[size] || 0;
  if (numColors === 3) return 49 + sizeUpcharge;
  if (numColors === 4) return (49 + sizeUpcharge) * 2;
  return 0;
};

const getBorderPrice = (size) => {
  const sizeMap = { small: 99, medium: 149, large: 199, huge: 249, '4ft round': 99 };
  return sizeMap[size] || 99;
};

const get3DPrice = (size) => {
  const sizeMap = { small: 200, medium: 250, large: 300, huge: 350, '4ft round': 200 };
  return sizeMap[size] || 200;
};

const BASE_COLORS = [
  { name: 'Yellow', hex: '#f4d03f', type: 'light' },
  { name: 'Pink', hex: '#f8c9d4', type: 'light' },
  { name: 'White', hex: '#ffffff', type: 'light' },
  { name: 'Burnt Orange', hex: '#cc5500', type: 'dark' },
  { name: 'Grey', hex: '#9ca3af', type: 'light' },
  { name: 'Green', hex: '#86cb92', type: 'light' }
];

const PAINT_COLORS = [
  { name: 'Black', hex: '#000000', type: 'dark' },
  { name: 'Navy', hex: '#1e3a5f', type: 'dark' },
  { name: 'Burgundy', hex: '#800020', type: 'dark' },
  { name: 'Forest Green', hex: '#0f4d2a', type: 'dark' },
  { name: 'Charcoal', hex: '#36454f', type: 'dark' },
  { name: 'Dark Brown', hex: '#3e2723', type: 'dark' },
  { name: 'White', hex: '#ffffff', type: 'light' },
  { name: 'Cream', hex: '#fffdd0', type: 'light' },
  { name: 'Light Blue', hex: '#add8e6', type: 'light' },
  { name: 'Light Grey', hex: '#d3d3d3', type: 'light' },
  { name: 'Beige', hex: '#f5f5dc', type: 'light' }
];

export default function CustomBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    size: '',
    baseColor: '',
    paintColor: '',
    imageFile: null,
    imageUrl: '',
    previewUrl: '',
    is3D: false,
    numColors: 2,
    shaveBorders: false,
    upsells: {
      is3D: false,
      thirdColor: '',
      fourthColor: '',
      secondImageUrl: '',
      bevelLines: false,
      backgroundRelief: false,
      carveOut: false
    },
    upsellTotal: 0
  });
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setConfig(prev => ({ ...prev, imageFile: file, imageUrl: file_url }));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const generatePreview = async () => {
    if (!config.imageUrl || !config.baseColor || !config.paintColor) return;
    
    setProcessing(true);
    try {
      const sizeLabel = SIZES.find(s => s.value === config.size)?.label || config.size;
      const colorDescription = config.is3D ? '2 colors creating depth and dimension' : '1-2 color stencil style';
      
      const prompt = `Create a realistic mockup image showing a ${sizeLabel} carpet rug in ${config.baseColor} color lying on a floor at a slight angle (perspective view from above). 
      The design from the uploaded image should be painted onto the rug in ${config.paintColor} color as a simplified ${colorDescription}. 
      IMPORTANT: If the uploaded image contains text, words, or letters, reproduce them clearly and legibly on the rug - the text must be readable and accurate.
      The rug should have visible carpet texture and the design should look professionally hand-painted on the rug surface. 
      Make it look professional and realistic, as if photographed in a well-lit room.`;
      
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: prompt,
        existing_image_urls: [config.imageUrl]
      });
      
      setConfig(prev => ({ ...prev, previewUrl: url }));
    } catch (error) {
      console.error('Preview generation error:', error);
      alert(`Failed to generate preview: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddToCart = () => {
    const selectedSize = SIZES.find(s => s.value === config.size);
    const basePrice = selectedSize.price;
    const colorPrice = getColorPrice(config.size, config.numColors);
    const borderPrice = config.shaveBorders ? getBorderPrice(config.size) : 0;
    const price = basePrice + colorPrice + borderPrice + config.upsellTotal;
    
    const cartItem = {
      type: 'custom',
      size: selectedSize.label,
      baseColor: config.baseColor,
      paintColor: config.paintColor,
      imageUrl: config.imageUrl,
      previewUrl: config.previewUrl,
      numColors: config.numColors,
      shaveBorders: config.shaveBorders,
      upsells: config.upsells,
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
    const borderPrice = config.shaveBorders ? getBorderPrice(config.size) : 0;
    return basePrice + colorPrice + borderPrice + config.upsellTotal;
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Design Your Custom Rug</h1>
        <p className="text-center text-gray-600 mb-8">Create a one-of-a-kind piece in three simple steps</p>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Size Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Choose Your Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setConfig(prev => ({ ...prev, size: size.value }))}
                    className={`flex flex-col items-center p-6 border-2 rounded-lg transition-all ${
                      config.size === size.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-4xl mb-1">{size.label}</div>
                    <div className="text-lg mb-2" style={{ fontFamily: 'Qwitcher Grypen, cursive' }}>{size.measurement}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl line-through text-gray-400" style={{ fontFamily: 'Qwitcher Grypen, cursive' }}>${size.originalPrice}</span>
                      <span className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Qwitcher Grypen, cursive' }}>${size.price}</span>
                    </div>
                  </button>
                ))}
              </div>
              <Button 
                className="w-full mt-6" 
                onClick={() => setStep(2)} 
                disabled={!config.size}
              >
                Continue to Colors
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Color Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Choose Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-lg mb-3 block">Rug Base Color</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {BASE_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setConfig(prev => ({ ...prev, baseColor: color.name }))}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          config.baseColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs text-center">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-lg mb-3 block">Paint Color for Design</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {PAINT_COLORS.filter(color => {
                      if (!config.baseColor) return true;
                      const selectedBase = BASE_COLORS.find(c => c.name === config.baseColor);
                      if (!selectedBase) return true;
                      // If base is light, show dark paints; if base is dark, show light paints
                      return selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light';
                    }).map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          config.paintColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-md"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs text-center">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => setStep(3)} 
                  disabled={!config.baseColor || !config.paintColor}
                >
                  Continue to Design
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Create Stencil Design */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Create Your Stencil Design</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Upload any image and turn it into a perfect rug stencil with adjustable details and colors
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <StencilCreator
                  onSaveStencil={(stencilUrl) => {
                    setConfig(prev => ({ ...prev, previewUrl: stencilUrl }));
                  }}
                  onConfigChange={({ colors, shaveBorders }) => {
                    setConfig(prev => ({ ...prev, numColors: colors, shaveBorders }));
                  }}
                />

                {config.previewUrl && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <Label className="block mb-2 font-semibold text-green-900">✨ Your Stencil is Ready!</Label>
                    <p className="text-sm text-green-700">
                      Your design is ready! Continue to see premium upgrade options.
                    </p>
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
                    {config.shaveBorders && (
                      <div className="flex justify-between">
                        <span>Shaved Borders:</span>
                        <span className="font-semibold">+${getBorderPrice(config.size)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700" 
                    onClick={() => setStep(4)}
                    disabled={!config.previewUrl}
                  >
                    Continue to Upgrades
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Upsell Options */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Premium Upgrades (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <UpsellOptions
                size={config.size}
                baseColor={config.baseColor}
                onContinue={(upsells, upsellTotal) => {
                  setConfig(prev => ({ ...prev, upsells, upsellTotal }));
                  handleAddToCart();
                }}
                onBack={() => setStep(3)}
              />
            </CardContent>
          </Card>
        )}
        </div>
        </div>
        );
        }