import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function LiveRugPreview({ config, pricingData }) {
  const canvasRef = useRef(null);

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

    // Resolve colors
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

    // Draw placeholder text if incomplete
    if (!config.qualityTier || !config.size || !config.baseColor) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Select options to preview', W / 2, H / 2);
      return;
    }

    if (!config.designUrl) return;

    // Load image and apply stencil color effect
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Figure out draw dimensions (contain within canvas)
      const imgRatio = img.width / img.height;
      const canvasRatio = W / H;

      let drawWidth, drawHeight, offsetX, offsetY;
      if (imgRatio > canvasRatio) {
        drawWidth = W * 0.9;
        drawHeight = drawWidth / imgRatio;
      } else {
        drawHeight = H * 0.9;
        drawWidth = drawHeight * imgRatio;
      }
      offsetX = (W - drawWidth) / 2;
      offsetY = (H - drawHeight) / 2;

      // Draw image to an offscreen canvas at exact draw size
      const offscreen = document.createElement('canvas');
      offscreen.width = drawWidth;
      offscreen.height = drawHeight;
      const octx = offscreen.getContext('2d');
      octx.drawImage(img, 0, 0, drawWidth, drawHeight);

      // Get pixel data
      const imageData = octx.getImageData(0, 0, drawWidth, drawHeight);
      const data = imageData.data;

      // Parse paint color into rgb
      const pr = parseInt(paintHex.slice(1, 3), 16);
      const pg = parseInt(paintHex.slice(3, 5), 16);
      const pb = parseInt(paintHex.slice(5, 7), 16);

      // Threshold: dark pixels → paint color, light pixels → transparent (show base)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 30) {
          // Already transparent — keep transparent
          data[i + 3] = 0;
          continue;
        }

        // Luminance check — dark pixels are the stencil/design
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const threshold = 180; // pixels darker than this become paint color

        if (luminance < threshold) {
          // Dark pixel → paint color, opacity based on how dark it is
          const intensity = 1 - luminance / threshold;
          data[i] = pr;
          data[i + 1] = pg;
          data[i + 2] = pb;
          data[i + 3] = Math.round(intensity * 255);
        } else {
          // Light pixel → transparent (show base color through)
          data[i + 3] = 0;
        }
      }

      octx.putImageData(imageData, 0, 0);

      // Draw back to main canvas
      ctx.drawImage(offscreen, offsetX, offsetY, drawWidth, drawHeight);
    };

    img.onerror = () => {
      // Fallback: just draw image normally if cross-origin fails
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, W, H);
      const fallbackImg = new Image();
      fallbackImg.src = config.designUrl;
      fallbackImg.onload = () => {
        ctx.globalAlpha = 0.6;
        ctx.drawImage(fallbackImg, 0, 0, W, H);
        ctx.globalAlpha = 1;
      };
    };

    img.src = config.designUrl;
  }, [config, pricingData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-4 shadow-2xl">
        <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ imageRendering: 'crisp-edges' }}
          />

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
            Dark areas shown in selected paint color • Base color fills background
          </p>
        )}
      </Card>
    </motion.div>
  );
}