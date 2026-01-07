import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const SIZES = [
  { id: 'sm', label: 'Small', value: 'small', price: 199 },
  { id: 'md', label: 'Medium', value: 'medium', price: 299 },
  { id: 'lg', label: 'Large', value: 'large', price: 399 },
  { id: 'hg', label: 'Huge', value: 'huge', price: 499 },
  { id: 'rd', label: '4 Foot Round', value: '4ft round', price: 199 }
];

const get3DPrice = (size) => {
  const sizeMap = { small: 200, medium: 250, large: 300, huge: 350, '4ft round': 200 };
  return sizeMap[size] || 200;
};

const BASE_COLORS = [
  { name: 'Yellow', hex: '#f4d03f' },
  { name: 'Pink', hex: '#f8c9d4' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Burnt Orange', hex: '#cc5500' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Green', hex: '#86cb92' }
];

const PAINT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Forest Green', hex: '#0f4d2a' },
  { name: 'Charcoal', hex: '#36454f' },
  { name: 'Dark Brown', hex: '#3e2723' }
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
    is3D: false
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
      alert('Failed to generate preview');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddToCart = () => {
    const selectedSize = SIZES.find(s => s.value === config.size);
    const basePrice = selectedSize.price;
    const price = basePrice + (config.is3D ? get3DPrice(config.size) : 0);
    
    const cartItem = {
      type: 'custom',
      size: selectedSize.label,
      baseColor: config.baseColor,
      paintColor: config.paintColor,
      imageUrl: config.imageUrl,
      previewUrl: config.previewUrl,
      is3D: config.is3D,
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
    return basePrice + (config.is3D ? get3DPrice(config.size) : 0);
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Design Your Custom Rug</h1>
        <p className="text-center text-gray-600 mb-8">Create a one-of-a-kind piece in three simple steps</p>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
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
                    <div className="font-bold text-xl mb-1">{size.label}</div>
                    <div className="text-2xl font-bold text-blue-600">${size.price}</div>
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
                    {PAINT_COLORS.map((color) => (
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

        {/* Step 3: Image Upload */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Upload Your Design</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Upload Image (logo, text, artwork)</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                    {config.imageUrl ? (
                      <div>
                        <img src={config.imageUrl} alt="Uploaded design" className="max-h-64 mx-auto mb-4" />
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload').click()}>
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-400 mt-1">PNG, JPG, SVG up to 10MB</p>
                      </label>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </div>
                  {uploading && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-lg mb-3 block">Design Style</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, is3D: false }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        !config.is3D ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-lg">Standard</div>
                      <div className="text-sm text-gray-600">Flat stencil design</div>
                      <div className="text-sm font-semibold text-gray-700 mt-1">Included</div>
                    </button>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, is3D: true }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        config.is3D ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-lg">3-D Effect</div>
                      <div className="text-sm text-gray-600">Multiple colors for depth</div>
                      <div className="text-sm font-semibold text-blue-600 mt-1">
                        +${config.size ? get3DPrice(config.size) : 200}
                      </div>
                    </button>
                  </div>
                </div>

                {config.imageUrl && !config.previewUrl && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    onClick={generatePreview}
                    disabled={processing || !config.paintColor}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Preview...
                      </>
                    ) : (
                      'Generate Preview on Rug'
                    )}
                  </Button>
                )}

                {config.previewUrl && (
                  <div className="border rounded-lg p-4 bg-white">
                    <Label className="block mb-2 font-semibold">Your Custom Rug Preview</Label>
                    <img src={config.previewUrl} alt="Rug preview" className="w-full rounded-lg shadow-md" />
                    <Button 
                      variant="outline" 
                      className="w-full mt-3"
                      onClick={generatePreview}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        'Regenerate Preview'
                      )}
                    </Button>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total Price:</span>
                    <span className="text-2xl font-bold text-blue-600">${currentPrice()}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {SIZES.find(s => s.value === config.size)?.label} • {config.baseColor} base • {config.paintColor} paint • {config.is3D ? '3-D Effect' : 'Standard'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700" 
                    onClick={handleAddToCart}
                    disabled={!config.previewUrl}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}