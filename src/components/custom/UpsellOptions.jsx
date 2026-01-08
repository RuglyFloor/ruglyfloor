import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Sparkles, Palette, Loader2, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [expandedSections, setExpandedSections] = useState({});

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-center">
        <h3 className="text-xl font-bold mb-1">✨ Optional Upgrades</h3>
        <p className="text-sm text-gray-700">
          Your design is ready! Add premium features or skip to checkout.
        </p>
      </div>

      {/* Compact Upgrade List */}
      <div className="space-y-3">
        {/* 3D Effect */}
        <div className="border-2 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={upsells.is3D}
                onCheckedChange={(checked) => {
                  handleUpsellChange({ is3D: checked });
                  if (checked) toggleSection('3d');
                }}
              />
              <div>
                <div className="font-semibold">3D Depth Effect</div>
                <div className="text-xs text-gray-600">Multiple tones for dimension</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-600">+${get3DPrice(size)}</span>
              <button 
                onClick={() => toggleSection('3d')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections['3d'] ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          {expandedSections['3d'] && (
            <div className="px-4 pb-4 border-t">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/8c2ad34fb_5.png"
                alt="3D Effect"
                className="w-full h-32 object-cover rounded-lg mt-3"
              />
            </div>
          )}
        </div>

        {/* Additional Colors */}
        <div className="border-2 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={!!upsells.thirdColor}
                onCheckedChange={(checked) => {
                  if (!checked) setUpsells(prev => ({ ...prev, thirdColor: '', fourthColor: '' }));
                  toggleSection('colors');
                }}
              />
              <div>
                <div className="font-semibold">Extra Paint Colors</div>
                <div className="text-xs text-gray-600">Add 3rd or 4th color</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-600">+${getAdditionalColorPrice(size)}+</span>
              <button 
                onClick={() => toggleSection('colors')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections['colors'] ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          {expandedSections['colors'] && (
            <div className="px-4 pb-4 border-t pt-3 space-y-3">
              <div>
                <Label className="text-sm mb-2 block">Third Color (+${getAdditionalColorPrice(size)})</Label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setUpsells(prev => ({ ...prev, thirdColor: '' }))}
                    className={`px-3 py-1 text-xs rounded border-2 ${!upsells.thirdColor ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                  >
                    None
                  </button>
                  {PAINT_COLORS.filter(color => selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light').slice(0, 6).map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setUpsells(prev => ({ ...prev, thirdColor: color.name }))}
                      className={`px-3 py-1 text-xs rounded border-2 flex items-center gap-1 ${upsells.thirdColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex }} />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
              {upsells.thirdColor && (
                <div>
                  <Label className="text-sm mb-2 block">Fourth Color (+${getAdditionalColorPrice(size)})</Label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setUpsells(prev => ({ ...prev, fourthColor: '' }))}
                      className={`px-3 py-1 text-xs rounded border-2 ${!upsells.fourthColor ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                    >
                      None
                    </button>
                    {PAINT_COLORS.filter(color => selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light').slice(0, 6).map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setUpsells(prev => ({ ...prev, fourthColor: color.name }))}
                        className={`px-3 py-1 text-xs rounded border-2 flex items-center gap-1 ${upsells.fourthColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex }} />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Second Image */}
        <div className="border-2 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={!!upsells.secondImageUrl}
                onCheckedChange={(checked) => {
                  if (!checked) setUpsells(prev => ({ ...prev, secondImageUrl: '' }));
                  toggleSection('image');
                }}
              />
              <div>
                <div className="font-semibold">Second Design Layer</div>
                <div className="text-xs text-gray-600">Blend two images together</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-600">+${getSecondImagePrice(size)}</span>
              <button 
                onClick={() => toggleSection('image')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections['image'] ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          {expandedSections['image'] && (
            <div className="px-4 pb-4 border-t pt-3">
              <Label htmlFor="second-image" className="cursor-pointer text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4" />
                {upsells.secondImageUrl ? 'Change Image' : 'Upload Image'}
              </Label>
              <input
                id="second-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {upsells.secondImageUrl && (
                <img src={upsells.secondImageUrl} alt="Second design" className="w-full h-24 object-cover rounded-lg mt-2" />
              )}
            </div>
          )}
        </div>

        {/* Beveled Lines */}
        <div className="border-2 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={upsells.bevelLines}
                onCheckedChange={(checked) => {
                  handleUpsellChange({ bevelLines: checked });
                  if (checked) toggleSection('bevel');
                }}
              />
              <div>
                <div className="font-semibold">Beveled Lines</div>
                <div className="text-xs text-gray-600">Raised edges with depth</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-600">+${getBevelPrice(size)}</span>
              <button 
                onClick={() => toggleSection('bevel')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections['bevel'] ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          {expandedSections['bevel'] && (
            <div className="px-4 pb-4 border-t">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/684e49dba_IMG_1570.jpg"
                alt="Beveled Lines"
                className="w-full h-32 object-cover rounded-lg mt-3"
              />
            </div>
          )}
        </div>

        {/* Background Relief */}
        <div className="border-2 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={upsells.backgroundRelief}
                onCheckedChange={(checked) => {
                  handleUpsellChange({ backgroundRelief: checked });
                  if (checked) toggleSection('relief');
                }}
              />
              <div>
                <div className="font-semibold">Background Relief</div>
                <div className="text-xs text-gray-600">Textured pop-out effect</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-600">+${getBackgroundReliefPrice(size)}</span>
              <button 
                onClick={() => toggleSection('relief')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections['relief'] ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          {expandedSections['relief'] && (
            <div className="px-4 pb-4 border-t">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/8c2ad34fb_5.png"
                alt="Background Relief"
                className="w-full h-32 object-cover rounded-lg mt-3"
              />
            </div>
          )}
        </div>

        {/* Carve Out */}
        <div className="border-2 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={upsells.carveOut}
                onCheckedChange={(checked) => {
                  handleUpsellChange({ carveOut: checked });
                  if (checked) toggleSection('carve');
                }}
              />
              <div>
                <div className="font-semibold">Carve Out Effect</div>
                <div className="text-xs text-gray-600">Bold negative space cuts</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-600">+${getCarveOutPrice(size)}</span>
              <button 
                onClick={() => toggleSection('carve')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections['carve'] ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          {expandedSections['carve'] && (
            <div className="px-4 pb-4 border-t">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/40e12a1d2_Screenshot2025-12-19at235301.png"
                alt="Carve Out"
                className="w-full h-32 object-cover rounded-lg mt-3"
              />
            </div>
          )}
        </div>
      </div>

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