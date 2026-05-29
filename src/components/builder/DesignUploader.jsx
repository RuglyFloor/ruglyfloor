import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, ChevronLeft, ChevronRight, Crop, RotateCw, ZoomIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Cropper from 'react-easy-crop';

const MODES = [
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

  return new ImageData(out, width, height);
}

// Returns a cropped image blob URL from the original image and pixel crop area
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, 'image/png');
  });
}

export default function DesignUploader({ onImageReady, onProcessedImageReady, onClear, tierColor = '#4075ff' }) {
  const [rawImage, setRawImage] = useState(null);       // original file dataUrl before crop
  const [localImage, setLocalImage] = useState(null);   // after crop applied
  const [showCropper, setShowCropper] = useState(false);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [mode, setMode] = useState('threshold');
  const [threshold, setThreshold] = useState(0.5);
  const [dividerX, setDividerX] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processedCanvas, setProcessedCanvas] = useState(null);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const imgRef = useRef(null);

  const processImage = useCallback(() => {
    if (!imgRef.current || !originalCanvasRef.current || !resultCanvasRef.current) return;
    const img = imgRef.current;
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return;

    const origCtx = originalCanvasRef.current.getContext('2d');
    originalCanvasRef.current.width = w;
    originalCanvasRef.current.height = h;
    origCtx.drawImage(img, 0, 0, w, h);

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
    if (localImage) processImage();
  }, [localImage, mode, threshold, processImage]);

  useEffect(() => {
    if (processedCanvas && onProcessedImageReady) {
      onProcessedImageReady(processedCanvas.toDataURL('image/png'), mode);
    }
  }, [processedCanvas, mode]);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawImage(e.target.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    const croppedUrl = await getCroppedImg(rawImage, croppedAreaPixels, rotation);
    setLocalImage({ dataUrl: croppedUrl });
    setShowCropper(false);
    setDividerX(0.5);

    // Upload original in background
    setUploading(true);
    try {
      const blob = await fetch(croppedUrl).then(r => r.blob());
      const file = new File([blob], 'design.png', { type: 'image/png' });
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

  const handleCropSkip = () => {
    // Use raw image as-is
    setLocalImage({ dataUrl: rawImage });
    setShowCropper(false);
    setDividerX(0.5);

    setUploading(true);
    fetch(rawImage)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], 'design.png', { type: 'image/png' });
        return base44.integrations.Core.UploadFile({ file });
      })
      .then(result => { if (onImageReady) onImageReady(result.file_url); })
      .catch(err => { console.error('Upload error:', err); alert('Upload failed.'); setLocalImage(null); })
      .finally(() => setUploading(false));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleClear = () => {
    setLocalImage(null);
    setRawImage(null);
    setProcessedCanvas(null);
    setShowCropper(false);
    if (onClear) onClear();
  };

  const handleReCrop = () => {
    if (!rawImage) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setShowCropper(true);
  };

  // Divider drag logic
  const startDrag = (e) => { e.preventDefault(); setIsDragging(true); };

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

  // ── Crop UI ──────────────────────────────────────────────────────────────────
  if (showCropper && rawImage) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg" style={{ color: tierColor, fontFamily: 'Barlow Condensed, sans-serif' }}>
            Crop &amp; Adjust Your Image
          </h3>
          <button onClick={handleCropSkip} className="text-sm text-gray-400 underline">Skip</button>
        </div>

        {/* Cropper canvas */}
        <div className="relative rounded-2xl overflow-hidden border-4" style={{ borderColor: tierColor, height: 320, backgroundColor: '#111' }}>
          <Cropper
            image={rawImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-500 w-10">Zoom</span>
            <input
              type="range" min={1} max={3} step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: tierColor }}
            />
            <span className="text-xs text-gray-400 w-10">{zoom.toFixed(1)}×</span>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-3">
            <RotateCw className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-500 w-10">Rotate</span>
            <input
              type="range" min={-180} max={180} step={1}
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: tierColor }}
            />
            <span className="text-xs text-gray-400 w-10">{rotation}°</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCropConfirm}
            className="flex-1 py-3 rounded-xl font-black text-white text-sm"
            style={{ backgroundColor: tierColor }}
          >
            <Crop className="w-4 h-4 inline mr-1" /> Apply Crop
          </button>
        </div>
      </div>
    );
  }

  // ── Upload UI ─────────────────────────────────────────────────────────────────
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

  // ── Filter / Preview UI ───────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Mode tabs + controls */}
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
        <div className="ml-auto flex items-center gap-2">
          {rawImage && (
            <button
              onClick={handleReCrop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-all"
              style={{ borderColor: tierColor, color: tierColor, backgroundColor: `${tierColor}10` }}
            >
              <Crop className="w-4 h-4" /> Re-crop
            </button>
          )}
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
        {uploading && (
          <div className="absolute inset-0 bg-black/40 z-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            <span className="text-white font-bold text-sm">Uploading…</span>
          </div>
        )}

        <img ref={imgRef} src={localImage.dataUrl} alt="" className="hidden" onLoad={processImage} />
        <canvas ref={originalCanvasRef} className="hidden" />
        <canvas ref={resultCanvasRef} className="hidden" />

        {/* Original side */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${Math.round((1 - dividerX) * 100)}% 0 0)` }}>
          <img src={localImage.dataUrl} alt="Original" className="w-full h-full object-contain" />
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">ORIGINAL</div>
        </div>

        {/* Result side */}
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
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">RESULT</div>
        </div>

        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 z-10 flex flex-col items-center justify-center"
          style={{ left: `calc(${dividerX * 100}% - 20px)`, width: '40px', cursor: 'ew-resize' }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div className="w-0.5 h-full absolute" style={{ backgroundColor: tierColor, left: '50%', transform: 'translateX(-50%)' }} />
          <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg z-10 border-2" style={{ backgroundColor: '#fff', borderColor: tierColor }}>
            <ChevronLeft className="w-3 h-3" style={{ color: tierColor }} />
            <ChevronRight className="w-3 h-3" style={{ color: tierColor }} />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Drag the divider to compare · Adjust filter &amp; threshold to fine-tune your stencil
      </p>
    </div>
  );
}