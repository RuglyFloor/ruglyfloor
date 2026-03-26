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

function applyStencil(imageData, paintHex, baseHex) {
  const data = imageData.data;
  const paint = hexToRgb(paintHex);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 30) {
      data[i + 3] = 0;
      continue;
    }

    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const threshold = 180;

    if (luminance < threshold) {
      const intensity = 1 - luminance / threshold;
      data[i] = paint.r;
      data[i + 1] = paint.g;
      data[i + 2] = paint.b;
      data[i + 3] = Math.round(intensity * 255);
    } else {
      // transparent → base color shows through
      data[i + 3] = 0;
    }
  }
  return imageData;
}

export default function LiveRugPreview({ config, pricingData }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Select options to preview', W / 2, H / 2);
      return;
    }

    if (!config.designUrl) return;

    const drawStencilFromDataUrl = (dataUrl) => {
      const img = new Image();
      img.onload = () => {
        const imgRatio = img.width / img.height;
        const canvasRatio = W / H;

        let drawWidth, drawHeight;
        if (imgRatio > canvasRatio) {
          drawWidth = W * 0.9;
          drawHeight = drawWidth / imgRatio;
        } else {
          drawHeight = H * 0.9;
          drawWidth = drawHeight * imgRatio;
        }
        const offsetX = (W - drawWidth) / 2;
        const offsetY = (H - drawHeight) / 2;

        const offscreen = document.createElement('canvas');
        offscreen.width = Math.round(drawWidth);
        offscreen.height = Math.round(drawHeight);
        const octx = offscreen.getContext('2d');
        octx.drawImage(img, 0, 0, offscreen.width, offscreen.height);

        const imageData = octx.getImageData(0, 0, offscreen.width, offscreen.height);
        const stenciled = applyStencil(imageData, paintHex, baseHex);
        octx.putImageData(stenciled, 0, 0);

        // Redraw base (in case async replaced it)
        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(offscreen, offsetX, offsetY, drawWidth, drawHeight);
        setLoading(false);
      };
      img.src = dataUrl;
    };

    setLoading(true);

    // Fetch via backend proxy to avoid CORS
    base44.functions.invoke('imageProxy', { imageUrl: config.designUrl })
      .then(res => {
        if (res.data?.dataUrl) {
          drawStencilFromDataUrl(res.data.dataUrl);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));

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
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
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
            Dark areas → paint color · Light areas → base color
          </p>
        )}
      </Card>
    </motion.div>
  );
}