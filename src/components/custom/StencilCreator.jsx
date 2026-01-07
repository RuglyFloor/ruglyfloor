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

export default function StencilCreator({ onSaveStencil }) {
  const [originalImage, setOriginalImage] = useState(null);
  const [threshold, setThreshold] = useState(128);
  const [selectedColor, setSelectedColor] = useState(PAINT_COLORS[0]);
  const [blur, setBlur] = useState(2);
  const [layers, setLayers] = useState(2);
  
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
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas size
    const maxSize = 800;
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

    // Apply blur for smoother edges
    if (blur > 0) {
      imageData = applyGaussianBlur(imageData, blur);
    }

    // Apply threshold with layers
    const layerStep = 255 / layers;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray = imageData.data[i];
      const layerValue = Math.floor(gray / layerStep) * layerStep;
      
      if (layerValue < threshold) {
        // Apply selected color
        imageData.data[i] = parseInt(selectedColor.hex.slice(1, 3), 16);
        imageData.data[i + 1] = parseInt(selectedColor.hex.slice(3, 5), 16);
        imageData.data[i + 2] = parseInt(selectedColor.hex.slice(5, 7), 16);
      } else {
        // White background
        imageData.data[i] = 255;
        imageData.data[i + 1] = 255;
        imageData.data[i + 2] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [originalImage, threshold, selectedColor, blur, layers]);

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
    setBlur(2);
    setLayers(2);
    setSelectedColor(PAINT_COLORS[0]);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
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
        <div className="space-y-6">
          {/* Canvas Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="bg-white rounded-lg shadow-inner p-4 flex items-center justify-center min-h-[400px]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[600px] rounded shadow-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Color Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Paint Color</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {PAINT_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        selectedColor.hex === color.hex
                          ? 'border-blue-600 bg-blue-50 scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-full shadow-md border-2 border-white"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs font-medium text-center">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Threshold */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-base font-semibold">Contrast</Label>
                  <span className="text-sm text-gray-600">{threshold}</span>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={(val) => setThreshold(val[0])}
                  min={0}
                  max={255}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Adjust to control detail level</p>
              </div>

              {/* Layers */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-base font-semibold">Detail Layers</Label>
                  <span className="text-sm text-gray-600">{layers}</span>
                </div>
                <Slider
                  value={[layers]}
                  onValueChange={(val) => setLayers(val[0])}
                  min={1}
                  max={3}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">More layers = smoother gradients</p>
              </div>

              {/* Smoothing */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-base font-semibold">Edge Smoothing</Label>
                  <span className="text-sm text-gray-600">{blur}</span>
                </div>
                <Slider
                  value={[blur]}
                  onValueChange={(val) => setBlur(val[0])}
                  min={0}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Smooths edges for cleaner paint lines</p>
              </div>
            </CardContent>
          </Card>

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