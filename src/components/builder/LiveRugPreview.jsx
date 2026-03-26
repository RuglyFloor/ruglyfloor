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

// Returns true if image is mostly high-contrast B&W (line art / logos)
function isLineArt(data) {
  let extremes = 0, total = 0;
  for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
    if (data[i + 3] < 30) continue;
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < 60 || lum > 210) extremes++;
    total++;
  }
  return total > 0 && extremes / total > 0.65;
}

// For B&W line art: map dark→paint color, light→transparent (base shows through)
function applyStencil(data, paintHex) {
  const p = hexToRgb(paintHex);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 30) { data[i + 3] = 0; continue; }
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < 180) {
      const intensity = 1 - lum / 180;
      data[i] = p.r; data[i + 1] = p.g; data[i + 2] = p.b;
      data[i + 3] = Math.round(intensity * 255);
    } else {
      data[i + 3] = 0;
    }
  }
}

export default function LiveRugPreview({ config, pricingData }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const renderIdRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderId = ++renderIdRef.current;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const baseColorObj = config.baseColor
      ? pricingData.baseColors.find(c => c.name === config.baseColor) : null;
    const paintColorObj = config.paintColor
      ? pricingData.paintColors.find(c => c.name === config.paintColor) : null;

    const baseHex = baseColorObj?.hex || '#e5e7eb';
    const paintHex = paintColorObj?.hex || '#111827';

    // Always fill base color first
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

    setLoading(true);

    base44.functions.invoke('imageProxy', { imageUrl: config.designUrl })
      .then(res => {
        if (renderIdRef.current !== renderId) return; // stale
        if (!res.data?.dataUrl) { setLoading(false); return; }

        const img = new Image();
        img.onload = () => {
          if (renderIdRef.current !== renderId) return;

          const imgRatio = img.width / img.height;
          const canvasRatio = W / H;
          let dw, dh;
          if (imgRatio > canvasRatio) {
            dw = W * 0.88; dh = dw / imgRatio;
          } else {
            dh = H * 0.88; dw = dh * imgRatio;
          }
          const ox = (W - dw) / 2;
          const oy = (H - dh) / 2;

          const off = document.createElement('canvas');
          off.width = Math.round(dw);
          off.height = Math.round(dh);
          const octx = off.getContext('2d');
          octx.drawImage(img, 0, 0, off.width, off.height);

          const imageData = octx.getImageData(0, 0, off.width, off.height);

          if (isLineArt(imageData.data)) {
            // B&W stencil: replace dark pixels with paint color
            applyStencil(imageData.data, paintHex);
            octx.putImageData(imageData, 0, 0);
          }
          // For color images: just draw as-is over the base color

          // Re-fill base color (in case anything cleared it)
          ctx.fillStyle = baseHex;
          ctx.fillRect(0, 0, W, H);

          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.shadowBlur = 10;
          ctx.drawImage(off, ox, oy, dw, dh);
          ctx.restore();

          setLoading(false);
        };
        img.src = res.data.dataUrl;
      })
      .catch(() => { if (renderIdRef.current === renderId) setLoading(false); });

  }, [config, pricingData]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card className="p-4 shadow-2xl">
        <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: 'crisp-edges' }} />
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
        <p className="text-xs text-center text-gray-400 mt-2">
          Real-time preview • Colors and design update instantly
        </p>
      </Card>
    </motion.div>
  );
}