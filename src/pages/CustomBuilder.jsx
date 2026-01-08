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
  { id: 'rd', label: 'Pie', value: '4ft round', price: 200, originalPrice: 225, measurement: '4 feet round' }
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

  const generatePreview = async (upsellOptions = null) => {
    if (!config.imageUrl || !config.baseColor || !config.paintColor) return;
    
    setProcessing(true);
    try {
      const sizeLabel = SIZES.find(s => s.value === config.size)?.label || config.size;
      const upsells = upsellOptions || config.upsells;
      
      // Build effect descriptions
      let effectDescription = '';
      if (upsells.is3D) {
        effectDescription += '3D depth effect with multiple tones and shading for dimension. ';
      }
      if (upsells.bevelLines) {
        effectDescription += 'Beveled raised edges with dimensional depth on the lines. ';
      }
      if (upsells.backgroundRelief) {
        effectDescription += 'Textured relief background creating a pop-out effect for the design. ';
      }
      if (upsells.carveOut) {
        effectDescription += 'Bold carved-out sections with negative space cut into the rug. ';
      }
      
      if (!effectDescription) {
        effectDescription = '1-2 color flat stencil style';
      }
      
      // Build color description
      let colorInfo = `painted in ${config.paintColor}`;
      if (upsells.thirdColor) {
        colorInfo += ` and ${upsells.thirdColor}`;
      }
      if (upsells.fourthColor) {
        colorInfo += ` and ${upsells.fourthColor}`;
      }
      
      const imageUrls = [config.imageUrl];
      let secondImageNote = '';
      if (upsells.secondImageUrl) {
        imageUrls.push(upsells.secondImageUrl);
        secondImageNote = 'Additionally, blend in a second design from the second uploaded image in a complementary way. ';
      }
      
      const prompt = `Create a realistic mockup image showing a ${sizeLabel} carpet rug in ${config.baseColor} base color lying on a floor at a slight angle (perspective view from above). 
      The design from the uploaded image should be ${colorInfo} with these effects: ${effectDescription}
      ${secondImageNote}
      IMPORTANT: If the uploaded image contains text, words, or letters, reproduce them clearly and legibly on the rug - the text must be readable and accurate.
      The rug should have visible carpet texture and the design should look professionally hand-painted on the rug surface with the specified effects clearly visible.
      Make it look professional and realistic, as if photographed in a well-lit room.`;
      
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: prompt,
        existing_image_urls: imageUrls
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
        <div className="relative mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Size' },
              { num: 2, label: 'Colors' },
              { num: 3, label: 'Design' },
              { num: 4, label: 'Upgrades' }
            ].map((s, idx) => (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  step >= s.num 
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                </div>
                <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {idx < 3 && (
                  <div className="absolute top-6 left-0 right-0 h-0.5 -z-10" style={{ 
                    left: `${(idx * 33.33) + 16.66}%`, 
                    width: '33.33%',
                    background: step > s.num ? 'linear-gradient(to right, #2563eb, #9333ea)' : '#e5e7eb'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Size Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pick Your Perfect Size
              </h2>
              <p className="text-gray-600 text-lg">All sizes come with our signature hand-painted quality</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setConfig(prev => ({ ...prev, size: size.value }))}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    config.size === size.value 
                      ? 'ring-4 ring-blue-500 shadow-2xl scale-105' 
                      : 'hover:shadow-xl hover:scale-102 shadow-md'
                  }`}
                >
                  <div className={`absolute inset-0 transition-opacity ${
                    config.size === size.value 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 opacity-100' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 opacity-100 group-hover:from-blue-50 group-hover:to-purple-50'
                  }`} />

                  <div className="relative p-8 flex flex-col items-center">
                    {config.size === size.value && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    )}

                    <div className={`w-24 h-24 mb-4 rounded-xl flex items-center justify-center transition-all ${
                      config.size === size.value 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-white/50 group-hover:bg-white/70'
                    }`}>
                      <div className={`text-5xl font-black ${
                        config.size === size.value ? 'text-white' : 'text-gray-700'
                      }`}>
                        {size.label.charAt(0)}
                      </div>
                    </div>

                    <div className={`font-bold text-2xl mb-2 ${
                      config.size === size.value ? 'text-white' : 'text-gray-900'
                    }`}>
                      {size.label}
                    </div>

                    <div className={`text-sm mb-4 ${
                      config.size === size.value ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {size.measurement}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className={`text-lg line-through ${
                        config.size === size.value ? 'text-white/60' : 'text-gray-400'
                      }`}>
                        ${size.originalPrice}
                      </span>
                      <span className={`text-3xl font-black ${
                        config.size === size.value ? 'text-white' : 'text-blue-600'
                      }`}>
                        ${size.price}
                      </span>
                    </div>

                    <div className={`mt-3 text-xs font-semibold ${
                      config.size === size.value ? 'text-white/80' : 'text-green-600'
                    }`}>
                      SAVE ${size.originalPrice - size.price}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button 
                size="lg"
                className="px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" 
                onClick={() => setStep(2)} 
                disabled={!config.size}
              >
                {config.size ? '✨ Continue to Colors' : 'Choose a size to continue'}
              </Button>
            </div>
          </div>
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

                {config.imageUrl && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <Label className="block mb-2 font-semibold text-blue-900">🎨 Generate Realistic Preview</Label>
                      <p className="text-sm text-gray-700 mb-3">
                        See what your rug will actually look like with AI-generated preview
                      </p>
                      <Button
                        onClick={generatePreview}
                        disabled={processing || !config.imageUrl}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Preview...
                          </>
                        ) : (
                          'Generate AI Preview'
                        )}
                      </Button>
                    </div>
                    
                    {config.previewUrl && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <Label className="block mb-2 font-semibold text-green-900">✨ Preview Ready!</Label>
                        <img 
                          src={config.previewUrl} 
                          alt="Rug preview" 
                          className="w-full rounded-lg shadow-lg mb-3"
                        />
                        <p className="text-sm text-green-700">
                          Your realistic preview is ready! Continue to see premium upgrade options.
                        </p>
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
                currentPreview={config.previewUrl}
                isGenerating={processing}
                onPreviewUpdate={(upsells) => generatePreview(upsells)}
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