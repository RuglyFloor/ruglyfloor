import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Sparkles, Palette, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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

const get3DPrice = (size) => {
  const sizeMap = { small: 200, medium: 250, large: 300, huge: 350, '4ft round': 200 };
  return sizeMap[size] || 200;
};

const getAdditionalColorPrice = (size) => {
  const sizeMap = { small: 49, medium: 99, large: 149, huge: 199, '4ft round': 49 };
  return sizeMap[size] || 49;
};

const getSecondImagePrice = (size) => {
  const sizeMap = { small: 99, medium: 149, large: 199, huge: 249, '4ft round': 99 };
  return sizeMap[size] || 99;
};

const getBevelPrice = (size) => {
  const sizeMap = { small: 150, medium: 200, large: 250, huge: 300, '4ft round': 150 };
  return sizeMap[size] || 150;
};

const getBackgroundReliefPrice = (size) => {
  const sizeMap = { small: 175, medium: 225, large: 275, huge: 325, '4ft round': 175 };
  return sizeMap[size] || 175;
};

const getCarveOutPrice = (size) => {
  const sizeMap = { small: 125, medium: 175, large: 225, huge: 275, '4ft round': 125 };
  return sizeMap[size] || 125;
};

export default function UpsellOptions({ size, baseColor, currentPreview, isGenerating, onPreviewUpdate, onContinue, onBack }) {
  const [upsells, setUpsells] = useState({
    is3D: false,
    thirdColor: '',
    fourthColor: '',
    secondImageUrl: '',
    bevelLines: false,
    backgroundRelief: false,
    carveOut: false
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUpsells(prev => ({ ...prev, secondImageUrl: file_url }));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    if (upsells.is3D) total += get3DPrice(size);
    if (upsells.thirdColor) total += getAdditionalColorPrice(size);
    if (upsells.fourthColor) total += getAdditionalColorPrice(size);
    if (upsells.secondImageUrl) total += getSecondImagePrice(size);
    if (upsells.bevelLines) total += getBevelPrice(size);
    if (upsells.backgroundRelief) total += getBackgroundReliefPrice(size);
    if (upsells.carveOut) total += getCarveOutPrice(size);
    return total;
  };

  const selectedBase = { type: baseColor === 'Yellow' || baseColor === 'Pink' || baseColor === 'White' || baseColor === 'Grey' || baseColor === 'Green' ? 'light' : 'dark' };

  const handleUpsellChange = (changes) => {
    const newUpsells = { ...upsells, ...changes };
    setUpsells(newUpsells);
    if (onPreviewUpdate) {
      onPreviewUpdate(newUpsells);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      {currentPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}
              <img 
                src={currentPreview} 
                alt="Rug preview" 
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {isGenerating ? 'Updating preview with selected effects...' : 'Preview updates as you select options below'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Skip or Enhance Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center">
        <h3 className="text-2xl font-bold mb-2">✨ Enhance Your Design</h3>
        <p className="text-gray-700">
          Your basic design is ready! Add premium features below, or skip to checkout if you're budget-conscious.
        </p>
      </div>

      {/* 3D Effect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            3D Effect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleUpsellChange({ is3D: false })}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                !upsells.is3D ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-lg">Standard Flat</div>
              <div className="text-sm text-gray-600">Classic stencil design</div>
              <div className="text-sm font-semibold text-gray-700 mt-1">Included</div>
            </button>
            <button
              type="button"
              onClick={() => handleUpsellChange({ is3D: true })}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                upsells.is3D ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-lg">3D Depth Effect</div>
              <div className="text-sm text-gray-600">Multiple tones for dimension</div>
              <div className="text-sm font-semibold text-blue-600 mt-1">
                +${get3DPrice(size)}
              </div>
            </button>
          </div>
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/8c2ad34fb_5.png"
            alt="3D Effect Example"
            className="w-full h-48 object-cover rounded-lg mt-4"
          />
        </CardContent>
      </Card>

      {/* Additional Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-600" />
            Add More Colors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-base">Third Paint Color</Label>
                <span className="text-sm font-semibold text-blue-600">
                  +${getAdditionalColorPrice(size)}
                </span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                <button
                  onClick={() => setUpsells(prev => ({ ...prev, thirdColor: '' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    !upsells.thirdColor ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <span className="text-xs">None</span>
                </button>
                {PAINT_COLORS.filter(color => selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light').map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setUpsells(prev => ({ ...prev, thirdColor: color.name }))}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                      upsells.thirdColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs text-center leading-tight">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {upsells.thirdColor && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base">Fourth Paint Color</Label>
                  <span className="text-sm font-semibold text-blue-600">
                    +${getAdditionalColorPrice(size)}
                  </span>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  <button
                    onClick={() => setUpsells(prev => ({ ...prev, fourthColor: '' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      !upsells.fourthColor ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-xs">None</span>
                  </button>
                  {PAINT_COLORS.filter(color => selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light').map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setUpsells(prev => ({ ...prev, fourthColor: color.name }))}
                      className={`flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                        upsells.fourthColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs text-center leading-tight">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Second Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" />
            Add Second Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Combine two designs on your rug for a unique layered look.
          </p>
          <div className="flex justify-between items-center mb-4">
            <Label htmlFor="second-image" className="cursor-pointer text-blue-600 hover:text-blue-700 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {upsells.secondImageUrl ? 'Change Second Image' : 'Upload Second Image'}
            </Label>
            <span className="text-sm font-semibold text-blue-600">
              +${getSecondImagePrice(size)}
            </span>
          </div>
          <input
            id="second-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          {upsells.secondImageUrl && (
            <div className="mt-3">
              <img src={upsells.secondImageUrl} alt="Second design" className="w-full h-32 object-cover rounded-lg" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced 3D Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Advanced 3D Effects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bevel Lines */}
            <div 
              onClick={() => handleUpsellChange({ bevelLines: !upsells.bevelLines })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                upsells.bevelLines ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-lg">Beveled Lines</div>
                  <div className="text-sm text-gray-600">Raised edges with dimensional depth</div>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  +${getBevelPrice(size)}
                </span>
              </div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/684e49dba_IMG_1570.jpg"
                alt="Beveled Lines Example"
                className="w-full h-32 object-cover rounded-lg mt-2"
              />
            </div>

            {/* Background Relief */}
            <div 
              onClick={() => handleUpsellChange({ backgroundRelief: !upsells.backgroundRelief })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                upsells.backgroundRelief ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-lg">Background Relief</div>
                  <div className="text-sm text-gray-600">Textured background creates pop-out effect</div>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  +${getBackgroundReliefPrice(size)}
                </span>
              </div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/8c2ad34fb_5.png"
                alt="Background Relief Example"
                className="w-full h-32 object-cover rounded-lg mt-2"
              />
            </div>

            {/* Carve Out */}
            <div 
              onClick={() => handleUpsellChange({ carveOut: !upsells.carveOut })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                upsells.carveOut ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-lg">Carve Out Effect</div>
                  <div className="text-sm text-gray-600">Remove sections for bold negative space</div>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  +${getCarveOutPrice(size)}
                </span>
              </div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/40e12a1d2_Screenshot2025-12-19at235301.png"
                alt="Carve Out Example"
                className="w-full h-32 object-cover rounded-lg mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total & Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-lg">Premium Upgrades Total:</span>
          <span className="text-3xl font-bold text-blue-600">${calculateTotal()}</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button 
            onClick={() => onContinue(upsells, calculateTotal())} 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {calculateTotal() > 0 ? 'Add Upgrades & Continue' : 'Skip Upgrades'}
          </Button>
        </div>
      </div>
    </div>
  );
}