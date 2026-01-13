import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, Download, Share2, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PAINT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Forest Green', hex: '#0f4d2a' },
  { name: 'Charcoal', hex: '#36454f' },
  { name: 'Dark Brown', hex: '#3e2723' }
];

export default function StencilCreator({ onSaveStencil, onConfigChange, paintColor }) {
  const [originalImage, setOriginalImage] = useState(null);
  const [threshold, setThreshold] = useState(128);
  const [colors, setColors] = useState(2);
  
  const blur = 5; // Always at max
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({ colors });
    }
  }, [colors, onConfigChange]);

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas size
    const maxSize = 600;
    const scale = Math.min(maxSize / originalImage.width, maxSize / originalImage.height);
    canvas.width = originalImage.width * scale;
    canvas.height = originalImage.height * scale;

    // Draw original image
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Get image data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    // Apply max blur for smoothest edges
    imageData = applyGaussianBlur(imageData, blur);

    // Apply threshold with colors/layers
    const layerStep = 255 / colors;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray = imageData.data[i];
      const layerValue = Math.floor(gray / layerStep) * layerStep;
      
      if (layerValue < threshold) {
        // Apply paint color from config
        imageData.data[i] = parseInt(paintColor.slice(1, 3), 16);
        imageData.data[i + 1] = parseInt(paintColor.slice(3, 5), 16);
        imageData.data[i + 2] = parseInt(paintColor.slice(5, 7), 16);
        imageData.data[i + 3] = 255; // Opaque
      } else {
        // Transparent background
        imageData.data[i] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = 0; // Fully transparent
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [originalImage, threshold, paintColor, colors]);

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
    link.href = canvasRef.current.toDataURL();
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
    
    // Download to user's machine
    const link = document.createElement('a');
    link.download = 'rugly-stencil-design.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    // Also save for preview
    const imageUrl = canvasRef.current.toDataURL();
    onSaveStencil && onSaveStencil(imageUrl);
  };

  return (
    <div className="space-y-6">
      {!originalImage ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-500 transition-colors cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Create Your Stencil</h3>
                <p className="text-gray-600 mb-4">Upload any image to transform it into a rug-ready stencil design</p>
                <Button type="button">Choose Image</Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Canvas Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card>
              <CardContent className="p-4">
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center" style={{ 
                  backgroundImage: 'repeating-linear-gradient(45deg, #f9fafb 0px, #f9fafb 10px, #e5e7eb 10px, #e5e7eb 20px)',
                  backgroundSize: '20px 20px'
                }}>
                  <canvas
                    ref={canvasRef}
                    className="max-w-full rounded shadow-2xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-4">
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
                <p className="text-xs text-gray-500 mt-1.5">More detail vs. cleaner look</p>
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
                <p className="text-xs text-gray-500">Paint + background (2 min)</p>
              </CardContent>
            </Card>


          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Use This Design
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}