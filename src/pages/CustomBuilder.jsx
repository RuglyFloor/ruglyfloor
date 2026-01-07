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
  { id: 's', label: 'Small (4x6)', value: '4x6', price: 900 },
  { id: 'm', label: 'Medium (5x7)', value: '5x7', price: 1000 },
  { id: 'l', label: 'Large (6x9)', value: '6x9', price: 1200 },
  { id: 'h', label: 'Huge (9x12)', value: '9x12', price: 1500 },
  { id: 'r', label: 'Round (5ft)', value: '5ft Round', price: 950 }
];

const BASE_COLORS = [
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Charcoal', hex: '#36454f' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Forest Green', hex: '#228b22' },
  { name: 'Tan', hex: '#d2b48c' },
  { name: 'Gray', hex: '#808080' }
];

export default function CustomBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    size: '',
    baseColor: '',
    imageFile: null,
    imageUrl: '',
    numColors: 1
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

  const handleAddToCart = () => {
    const selectedSize = SIZES.find(s => s.value === config.size);
    const price = selectedSize.price + (config.numColors === 2 ? 100 : 0);
    
    const cartItem = {
      type: 'custom',
      size: config.size,
      baseColor: config.baseColor,
      imageUrl: config.imageUrl,
      numColors: config.numColors,
      price: price,
      name: `Custom Rug - ${config.size}`
    };

    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    
    navigate(createPageUrl('Cart'));
  };

  const currentPrice = () => {
    const selectedSize = SIZES.find(s => s.value === config.size);
    if (!selectedSize) return 0;
    return selectedSize.price + (config.numColors === 2 ? 100 : 0);
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
              <RadioGroup value={config.size} onValueChange={(value) => setConfig(prev => ({ ...prev, size: value }))}>
                <div className="grid md:grid-cols-2 gap-4">
                  {SIZES.map((size) => (
                    <div key={size.id} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={size.value} id={size.id} />
                      <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                        <div className="font-semibold">{size.label}</div>
                        <div className="text-sm text-gray-600">Starting at ${size.price}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
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
              <CardTitle>Step 2: Choose Base Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
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
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => setStep(3)} 
                  disabled={!config.baseColor}
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
                  <Label>Number of Colors in Design</Label>
                  <RadioGroup 
                    value={config.numColors.toString()} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, numColors: parseInt(value) }))}
                  >
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1">
                        <RadioGroupItem value="1" id="one-color" />
                        <Label htmlFor="one-color" className="cursor-pointer">
                          <div className="font-semibold">1 Color</div>
                          <div className="text-sm text-gray-600">Included</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1">
                        <RadioGroupItem value="2" id="two-colors" />
                        <Label htmlFor="two-colors" className="cursor-pointer">
                          <div className="font-semibold">2 Colors</div>
                          <div className="text-sm text-gray-600">+$100</div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total Price:</span>
                    <span className="text-2xl font-bold text-blue-600">${currentPrice()}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {config.size} • {config.baseColor} base • {config.numColors} color(s)
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600" 
                    onClick={handleAddToCart}
                    disabled={!config.imageUrl}
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