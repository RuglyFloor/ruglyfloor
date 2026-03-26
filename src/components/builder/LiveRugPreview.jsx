import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

// Detect if image is predominantly line-art (high contrast B&W)
function isLineArt(data) {
  let dark = 0, light = 0, total = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 30) continue;
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < 80) dark++;
    else if (lum > 200) light++;
    total++;
  }
  if (total === 0) return false;
  // If 70%+ of pixels are very dark or very light → line art
  return (dark + light) / total > 0.70;
}

// Line-art mode: dark pixels → paint color, light → transparent (base shows through)
function applyStencil(imageData, paintHex) {
  const data = imageData.data;
  const paint = hexToRgb(paintHex);
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 30) { data[i + 3] = 0; continue; }
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const threshold = 180;
    if (lum < threshold) {
      const intensity = 1 - lum / threshold;
      data[i] = paint.r;
      data[i + 1] = paint.g;
      data[i + 2] = paint.b;
      data[i + 3] = Math.round(intensity * 255);
    } else {
      data[i + 3] = 0;
    }
  }
  return imageData;
}

// Color-art mode: tint the image by blending toward paint color, preserve composition
function applyColorTint(imageData, paintHex, baseHex) {
  const data = imageData.data;
  const paint = hexToRgb(paintHex);
  const base = hexToRgb(baseHex);

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 30) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Very light/white pixels → tint toward base color slightly
    if (lum > 220) {
      data[i]     = Math.round(r * 0.6 + base.r * 0.4);
      data[i + 1] = Math.round(g * 0.6 + base.g * 0.4);
      data[i + 2] = Math.round(b * 0.6 + base.b * 0.4);
    } else if (lum < 60) {
      // Very dark pixels → tint toward paint color
      data[i]     = Math.round(r * 0.3 + paint.r * 0.7);
      data[i + 1] = Math.round(g * 0.3 + paint.g * 0.7);
      data[i + 2] = Math.round(b * 0.3 + paint.b * 0.7);
    }
    // Mid-tones keep their original color (preserves the design's character)
  }
  return imageData;
}

export default function LiveRugPreview({ config, pricingData }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cancel any pending proxy fetch
    if (abortRef.current) abortRef.current = false;
    const thisRender = {};
    abortRef.current = thisRender;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    const baseColorObj = config.baseColor
      ? pricingData.baseColors.find(c => c.name === config.baseColor)
      : null;
    const paintColorObj = config.paintColor
      ? pricingData.paintColors.find(c => c.name === config.paintColor)
      : null;

    const baseHex = baseColorObj?.hex || '#e5e7eb';
    const paintHex = paintColorObj?.hex || '#111827';

    // Fill base color
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, W, H);

    if (!config.qualityTier || !config.size || !config.baseColor) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Select options to preview', W / 2, H / 2);
      return;
    }

    if (!config.designUrl) return;

    const renderImage = (dataUrl) => {
      if (thisRender !== abortRef.current) return; // stale render
      const img = new Image();
      img.onload = () => {
        if (thisRender !== abortRef.current) return;

        const imgRatio = img.width / img.height;
        const canvasRatio = W / H;
        let drawWidth, drawHeight;
        if (imgRatio > canvasRatio) {
          drawWidth = W * 0.88;
          drawHeight = drawWidth / imgRatio;
        } else {
          drawHeight = H * 0.88;
          drawWidth = drawHeight * imgRatio;
        }
        const offsetX = (W - drawWidth) / 2;
        const offsetY = (H - drawHeight) / 2;

        const offscreen = document.createElement('canvas');
        offscreen.width = Math.round(drawWidth);
        offscreen.height = Math.round(drawHeight);
        const octx = offscreen.getContext('2d');
        octx.drawImage(img, 0, 0, offscreen.width, offscreen.height);

        // Sample pixels to decide rendering mode
        const imageData = octx.getImageData(0, 0, offscreen.width, offscreen.height);
        const lineArt = isLineArt(imageData.data);

        if (lineArt) {
          applyStencil(imageData, paintHex);
        } else {
          applyColorTint(imageData, paintHex, baseHex);
        }
        octx.putImageData(imageData, 0, 0);

        // Redraw base then composite
        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, W, H);

        // Subtle border/shadow for the design area
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 12;
        ctx.drawImage(offscreen, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();

        setLoading(false);
      };
      img.src = dataUrl;
    };

    setLoading(true);

    base44.functions.invoke('imageProxy', { imageUrl: config.designUrl })
      .then(res => {
        if (thisRender !== abortRef.current) return;
        if (res.data?.dataUrl) {
          renderImage(res.data.dataUrl);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        if (thisRender !== abortRef.current) return;
        setLoading(false);
      });

  }, [config, pricingData]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card className="p-4 shadow-2xl">
        <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ imageRendering: 'crisp-edges' }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {config.size && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg"
            >
              <p className="text-sm font-bold text-gray-900">
                {pricingData.sizes.find(s => s.id === config.size)?.measurement}
              </p>
            </motion.div>
          )}
        </div>
        {config.designUrl && config.paintColor && (
          <p className="text-xs text-center text-gray-400 mt-2">
            Real-time preview • Colors and design update instantly
          </p>
        )}
      </Card>
    </motion.div>
  );
}