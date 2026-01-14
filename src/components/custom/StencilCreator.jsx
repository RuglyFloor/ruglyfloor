import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Download, Share2, RotateCcw, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from './ImageUploader';

const PAINT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Forest Green', hex: '#0f4d2a' },
  { name: 'Charcoal', hex: '#36454f' },
  { name: 'Dark Brown', hex: '#3e2723' }
];

export default function StencilCreator({ onSaveStencil, onConfigChange, paintColor, baseColor }) {
  const [originalImage, setOriginalImage] = useState(null);
  const [threshold, setThreshold] = useState(128);
  const [colors, setColors] = useState(2);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [opacity, setOpacity] = useState(100);
  
  const blur = 5;
  const canvasRef = useRef(null);

  const handleImageSelect = (imageDataUrl) => {
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
    };
    img.src = imageDataUrl;
  };

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({ colors, brightness, saturation, threshold, opacity });
    }
  }, [colors, brightness, saturation, threshold, opacity, onConfigChange]);

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas size
    const maxSize = 600;
    const scale = Math.min(maxSize / originalImage.width, maxSize / originalImage.height);
    canvas.width = originalImage.width * scale;
    canvas.height = originalImage.height * scale;

    // Clear to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw original image
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Get image data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply brightness and saturation adjustments
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness
      r = Math.min(255, r * (brightness / 100));
      g = Math.min(255, g * (brightness / 100));
      b = Math.min(255, b * (brightness / 100));

      // Apply saturation
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      r = Math.round(gray + (r - gray) * (saturation / 100));
      g = Math.round(gray + (g - gray) * (saturation / 100));
      b = Math.round(gray + (b - gray) * (saturation / 100));

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    // Apply blur
    imageData = applyGaussianBlur(imageData, blur);

    // Apply threshold with colors/layers
    const layerStep = 255 / colors;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray = imageData.data[i];
      const layerValue = Math.floor(gray / layerStep) * layerStep;
      
      if (layerValue < threshold) {
        imageData.data[i] = parseInt(paintColor.slice(1, 3), 16);
        imageData.data[i + 1] = parseInt(paintColor.slice(3, 5), 16);
        imageData.data[i + 2] = parseInt(paintColor.slice(5, 7), 16);
        imageData.data[i + 3] = Math.round(255 * (opacity / 100));
      } else {
        imageData.data[i] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [originalImage, threshold, paintColor, colors, brightness, saturation, opacity]);

  const applyGaussianBlur = (imageData, radius) => {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);

    const kernelSize = radius * 2 + 1;
    const kernel = [];
    let sum = 0;

    // Create Gaussian kernel
    for (let i = 0; i < kernelSize; i++) {
      const x = i - radius;
      const value = Math.exp(-(x * x) / (2 * radius * radius));
      kernel.push(value);
      sum += value;
    }

    // Normalize kernel
    for (let i = 0; i < kernelSize; i++) {
      kernel[i] /= sum;
    }

    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
        for (let k = 0; k < kernelSize; k++) {
          const px = Math.min(Math.max(x + k - radius, 0), width - 1);
          const idx = (y * width + px) * 4;
          r += data[idx] * kernel[k];
          g += data[idx + 1] * kernel[k];
          b += data[idx + 2] * kernel[k];
        }
        const idx = (y * width + x) * 4;
        output[idx] = r;
        output[idx + 1] = g;
        output[idx + 2] = b;
      }
    }

    // Vertical pass
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let r = 0, g = 0, b = 0;
        for (let k = 0; k < kernelSize; k++) {
          const py = Math.min(Math.max(y + k - radius, 0), height - 1);
          const idx = (py * width + x) * 4;
          r += output[idx] * kernel[k];
          g += output[idx + 1] * kernel[k];
          b += output[idx + 2] * kernel[k];
        }
        const idx = (y * width + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
      }
    }

    return new ImageData(data, width, height);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'rugly-stencil.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve));
      const file = new File([blob], 'rugly-stencil.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Rugly Stencil Design',
          text: 'Check out my custom rug stencil design! 🎨'
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.log('Share failed:', err);
      handleDownload();
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setThreshold(128);
    setColors(2);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    // Save as PNG with transparency
    const imageUrl = canvasRef.current.toDataURL('image/png');
    
    // Download to user's machine
    const link = document.createElement('a');
    link.download = 'rugly-stencil-design.png';
    link.href = imageUrl;
    link.click();
    
    // Also save for preview
    onSaveStencil && onSaveStencil(imageUrl);
  };

  return (
    <div className="space-y-6">
      {!originalImage ? (
        <ImageUploader onImageSelect={handleImageSelect} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Canvas Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card>
              <CardContent className="p-4">
                <div className="rounded-lg p-4 flex items-center justify-center" style={{ 
                  backgroundColor: baseColor || '#86cb92'
                }}>
                  <canvas
                    ref={canvasRef}
                    className="max-w-full rounded shadow-2xl"
                  />
                </div>
                <p className="text-xs text-center text-gray-600 mt-2">
                  Preview showing your design in {paintColor || 'paint'} on the base rug color
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Controls & Actions */}
          <div className="space-y-4 flex flex-col">
            {/* Brightness */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Brightness
                  </Label>
                  <span className="text-xs font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{brightness}%</span>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={(val) => setBrightness(val[0])}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1.5">Lighten or darken</p>
              </CardContent>
            </Card>

            {/* Saturation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Saturation
                  </Label>
                  <span className="text-xs font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded">{saturation}%</span>
                </div>
                <Slider
                  value={[saturation]}
                  onValueChange={(val) => setSaturation(val[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1.5">Color intensity</p>
              </CardContent>
            </Card>

            {/* Opacity */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Paint Opacity
                  </Label>
                  <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">{opacity}%</span>
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={(val) => setOpacity(val[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1.5">Design transparency</p>
              </CardContent>
            </Card>

            {/* Contrast */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-bold">Contrast</Label>
                  <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">{threshold}</span>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={(val) => setThreshold(val[0])}
                  min={0}
                  max={255}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1.5">Detail vs. clean look</p>
              </CardContent>
            </Card>

            {/* Colors/Layers */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-bold">Number of Colors</Label>
                  <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">{colors} colors</span>
                </div>
                <div className="flex gap-2 mb-2">
                  {[2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setColors(num)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                        colors === num
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Paint + background layers</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons - Stay at Bottom */}
          <div className="mt-auto pt-4 space-y-2 flex flex-col">
           <Button
             type="button"
             onClick={handleSave}
             className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-6 text-lg shadow-lg"
           >
             ✅ Use This Design
           </Button>
           <div className="grid grid-cols-3 gap-2">
             <Button
               type="button"
               variant="outline"
               onClick={handleShare}
               size="sm"
               className="gap-1"
             >
               <Share2 className="w-3 h-3" />
               Share
             </Button>
             <Button
               type="button"
               variant="outline"
               onClick={handleDownload}
               size="sm"
               className="gap-1"
             >
               <Download className="w-3 h-3" />
               Download
             </Button>
             <Button
               type="button"
               variant="outline"
               onClick={handleReset}
               size="sm"
               className="gap-1"
             >
               <RotateCcw className="w-3 h-3" />
               New
             </Button>
           </div>
          </div>
          </div>
          )}
    </div>
  );
}