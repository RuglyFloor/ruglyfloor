import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MODES = [
  { id: 'edges', label: 'Edges' },
  { id: 'thin', label: 'Thin' },
  { id: 'threshold', label: 'Threshold' },
  { id: 'adaptive', label: 'Adaptive' },
  { id: 'color', label: 'Color' },
];

function applyFilter(imageData, mode, threshold) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const out = new Uint8ClampedArray(data);

  const getGray = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

  if (mode === 'color') {
    return new ImageData(new Uint8ClampedArray(data), width, height);
  }

  if (mode === 'threshold') {
    const t = threshold * 255;
    for (let i = 0; i < data.length; i += 4) {
      const g = getGray(i);
      const v = g > t ? 255 : 0;
      out[i] = out[i + 1] = out[i + 2] = v;
      out[i + 3] = 255;
    }
    return new ImageData(out, width, height);
  }

  if (mode === 'adaptive') {
    // Simple local threshold
    const t = threshold * 255;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const g = getGray(i);
        const neighbors = [];
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ny = Math.min(height - 1, Math.max(0, y + dy));
            const nx = Math.min(width - 1, Math.max(0, x + dx));
            neighbors.push(getGray((ny * width + nx) * 4));
          }
        }
        const local = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
        const v = g > local - (1 - threshold) * 20 ? 255 : 0;
        out[i] = out[i + 1] = out[i + 2] = v;
        out[i + 3] = 255;
      }
    }
    return new ImageData(out, width, height);
  }

  // edges / thin — Sobel edge detection
  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = getGray(i);
  }

  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const t = (1 - threshold) * 80 + 10;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const ny = Math.min(height - 1, Math.max(0, y + ky));
          const nx = Math.min(width - 1, Math.max(0, x + kx));
          const ki = (ky + 1) * 3 + (kx + 1);
          const g = gray[ny * width + nx];
          gx += sobelX[ki] * g;
          gy += sobelY[ki] * g;
        }
      }
      const mag = Math.sqrt(gx * gx + gy * gy);
      const i = (y * width + x) * 4;
      // White background, dark edges
      const v = mag > t ? 0 : 255;
      out[i] = out[i + 1] = out[i + 2] = v;
      // For thin mode, reduce edge thickness by requiring stronger signal
      if (mode === 'thin') {
        out[i] = out[i + 1] = out[i + 2] = mag > t * 1.5 ? 0 : 255;
      }
      out[i + 3] = 255;
    }
  }
  return new ImageData(out, width, height);
}

export default function DesignUploader({ onImageReady, onClear, tierColor = '#4075ff', uploading: parentUploading }) {
  const [localImage, setLocalImage] = useState(null); // { url, dataUrl, naturalWidth, naturalHeight }
  const [mode, setMode] = useState('edges');
  const [threshold, setThreshold] = useState(0.5);
  const [dividerX, setDividerX] = useState(0.5); // 0-1 fraction
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processedCanvas, setProcessedCanvas] = useState(null);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const imgRef = useRef(null);

  // Process the image with current mode/threshold
  const processImage = useCallback(() => {
    if (!imgRef.current || !originalCanvasRef.current || !resultCanvasRef.current) return;
    const img = imgRef.current;
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return;

    // Draw original
    const origCtx = originalCanvasRef.current.getContext('2d');
    originalCanvasRef.current.width = w;
    originalCanvasRef.current.height = h;
    origCtx.drawImage(img, 0, 0, w, h);

    // Process result
    const resCtx = resultCanvasRef.current.getContext('2d');
    resultCanvasRef.current.width = w;
    resultCanvasRef.current.height = h;
    resCtx.drawImage(img, 0, 0, w, h);

    if (mode !== 'color') {
      const imageData = resCtx.getImageData(0, 0, w, h);
      const processed = applyFilter(imageData, mode, threshold);
      resCtx.putImageData(processed, 0, 0);
    }

    setProcessedCanvas(resultCanvasRef.current);
  }, [mode, threshold]);

  useEffect(() => {
    if (localImage) {
      processImage();
    }
  }, [localImage, mode, threshold, processImage]);

  const handleFile = async (file) => {
    if (!file) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalImage({ dataUrl: e.target.result });
      setDividerX(0.5);
    };
    reader.readAsDataURL(file);

    // Upload in background
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (onImageReady) onImageReady(result.file_url);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
      setLocalImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleClear = () => {
    setLocalImage(null);
    setProcessedCanvas(null);
    if (onClear) onClear();
  };

  // Divider drag logic
  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      setDividerX(frac);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging]);

  if (!localImage) {
    return (
      <div>
        <button
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full border-4 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer"
          style={{ borderColor: tierColor, backgroundColor: `${tierColor}08` }}
        >
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-14 h-14" style={{ color: tierColor }} />
            <span className="text-xl font-black" style={{ color: tierColor, fontFamily: 'Barlow Condensed, sans-serif' }}>
              Click or Drag to Upload Your Design
            </span>
            <span className="text-sm text-gray-500">PNG · JPG · SVG · up to 20MB</span>
            <span className="text-xs text-gray-400 mt-1">Photos, logos, portraits, artwork — we'll trace it</span>
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-bold border-2 transition-all"
            style={{
              borderColor: mode === m.id ? tierColor : '#e5e7eb',
              backgroundColor: mode === m.id ? `${tierColor}15` : '#ffffff',
              color: mode === m.id ? tierColor : '#6b7280',
            }}
          >
            {m.label}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border-2 border-red-200 text-red-500 bg-white hover:bg-red-50 transition-all"
          >
            <X className="w-4 h-4" /> Remove
          </button>
        </div>
      </div>

      {/* Sharp/Soft slider */}
      {mode !== 'color' && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 w-10">Sharp</span>
          <input
            type="range" min={0} max={1} step={0.01}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: tierColor }}
          />
          <span className="text-xs font-semibold text-gray-500 w-8">Soft</span>
        </div>
      )}

      {/* Split view */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border-4 select-none"
        style={{ borderColor: tierColor, cursor: isDragging ? 'ew-resize' : 'default', minHeight: '240px', backgroundColor: '#f3f4f6' }}
      >
        {/* Upload progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 z-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            <span className="text-white font-bold text-sm">Uploading…</span>
          </div>
        )}

        {/* Hidden img for processing */}
        <img
          ref={imgRef}
          src={localImage.dataUrl}
          alt=""
          className="hidden"
          onLoad={processImage}
        />

        {/* Hidden canvases for processing */}
        <canvas ref={originalCanvasRef} className="hidden" />
        <canvas ref={resultCanvasRef} className="hidden" />

        {/* Original side (left) */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${Math.round((1 - dividerX) * 100)}% 0 0)` }}>
          <img src={localImage.dataUrl} alt="Original" className="w-full h-full object-contain" />
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
            ORIGINAL
          </div>
        </div>

        {/* Result side (right) - canvas processed */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${Math.round(dividerX * 100)}%)` }}>
          {processedCanvas ? (
            <img
              src={processedCanvas.toDataURL()}
              alt="Result"
              className="w-full h-full object-contain"
              style={{ backgroundColor: mode === 'color' ? 'transparent' : '#ffffff' }}
            />
          ) : (
            <img src={localImage.dataUrl} alt="Result" className="w-full h-full object-contain" />
          )}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
            RESULT
          </div>
        </div>

        {/* Divider line + handle */}
        <div
          className="absolute top-0 bottom-0 z-10 flex flex-col items-center justify-center"
          style={{ left: `calc(${dividerX * 100}% - 20px)`, width: '40px', cursor: 'ew-resize' }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div className="w-0.5 h-full absolute" style={{ backgroundColor: tierColor, left: '50%', transform: 'translateX(-50%)' }} />
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg z-10 border-2"
            style={{ backgroundColor: '#fff', borderColor: tierColor }}
          >
            <ChevronLeft className="w-3 h-3" style={{ color: tierColor }} />
            <ChevronRight className="w-3 h-3" style={{ color: tierColor }} />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Drag the divider to compare · The processed result will be used for your AI rug preview
      </p>
    </div>
  );
}