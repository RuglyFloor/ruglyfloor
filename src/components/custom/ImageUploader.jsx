import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Cropper from 'react-easy-crop';

const RUG_SHAPES = [
  { id: 'rectangle', label: 'Rectangle', aspect: 4 / 3 },
  { id: 'square', label: 'Square', aspect: 1 },
  { id: 'runner', label: 'Runner', aspect: 3 },
  { id: 'round', label: 'Round', aspect: 1, isRound: true },
];

// Map rug size values to shape presets
const SIZE_TO_SHAPE = {
  tiny:      { id: 'rectangle', aspect: 3 / 2 },   // 2x3
  small:     { id: 'rectangle', aspect: 6 / 4 },   // 4x6
  medium:    { id: 'rectangle', aspect: 7 / 5 },   // 5x7
  large:     { id: 'rectangle', aspect: 10 / 8 },  // 8x10
  huge:      { id: 'rectangle', aspect: 11 / 9 },  // 9x11
  '4ft round': { id: 'round', aspect: 1, isRound: true },
};

async function getCroppedImg(imageSrc, pixelCrop, isRound = false) {
  const image = await createImageBitmap(await (await fetch(imageSrc)).blob());
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  if (isRound) {
    ctx.beginPath();
    ctx.ellipse(
      pixelCrop.width / 2,
      pixelCrop.height / 2,
      pixelCrop.width / 2,
      pixelCrop.height / 2,
      0, 0, Math.PI * 2
    );
    ctx.clip();
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export default function ImageUploader({ onImageSelect, accept = 'image/*', rugSize }) {
  const [isDragging, setIsDragging] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Auto-select shape from rug size; fall back to rectangle
  const autoShape = rugSize && SIZE_TO_SHAPE[rugSize]
    ? { ...RUG_SHAPES.find(s => s.id === SIZE_TO_SHAPE[rugSize].id), ...SIZE_TO_SHAPE[rugSize] }
    : RUG_SHAPES[0];
  const [selectedShape, setSelectedShape] = useState(autoShape);

  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels, selectedShape.isRound);
    onImageSelect(URL.createObjectURL(blob), blob);
    setIsCropping(false);
    setImageSrc(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (isCropping && imageSrc) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="text-sm font-semibold text-gray-700">Crop & Fit to Rug Shape</div>

          {/* Shape selector */}
          <div className="flex gap-2 flex-wrap">
            {RUG_SHAPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => { setSelectedShape(shape); setCrop({ x: 0, y: 0 }); setZoom(1); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all"
                style={{
                  borderColor: selectedShape.id === shape.id ? '#4075ff' : '#e5e7eb',
                  color: selectedShape.id === shape.id ? '#4075ff' : '#6b7280',
                  backgroundColor: selectedShape.id === shape.id ? '#eff6ff' : 'white'
                }}
              >
                {shape.label}
              </button>
            ))}
          </div>

          {/* Cropper */}
          <div
            className="relative bg-gray-900 rounded-xl overflow-hidden"
            style={{ height: 320 }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={selectedShape.aspect}
              cropShape={selectedShape.isRound ? 'round' : 'rect'}
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <ZoomIn className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirm} className="flex-1 gap-2 text-white" style={{ backgroundColor: '#4075ff' }}>
              <Check className="w-4 h-4" />
              Apply Crop
            </Button>
            <Button
              variant="outline"
              onClick={() => { setIsCropping(false); setImageSrc(null); }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-12">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-12 cursor-pointer text-center transition-all ${
            isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Drop Your Image Here</h3>
          <p className="text-gray-600 mb-4">Or click to browse your files (PNG, JPG, GIF, etc.)</p>
          <Button type="button">Choose Image</Button>
          <p className="text-xs text-gray-500 mt-4">💡 Pro tip: Logos, photos, and artwork all work great!</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f); }}
        />
      </CardContent>
    </Card>
  );
}