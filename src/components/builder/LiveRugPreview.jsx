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
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw base color
    if (config.baseColor) {
      const baseColorObj = pricingData.baseColors.find(c => c.name === config.baseColor);
      if (baseColorObj) {
        ctx.fillStyle = baseColorObj.hex;
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    } else {
      // Default gray if no color selected
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    // Draw design if present
    if (config.designUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const imgRatio = img.width / img.height;
        const canvasRatio = rect.width / rect.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
          drawWidth = rect.width;
          drawHeight = rect.width / imgRatio;
          offsetX = 0;
          offsetY = (rect.height - drawHeight) / 2;
        } else {
          drawHeight = rect.height;
          drawWidth = rect.height * imgRatio;
          offsetX = (rect.width - drawWidth) / 2;
          offsetY = 0;
        }
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      };
      img.src = config.designUrl;
    }

    // Draw placeholder text if incomplete
    if (!config.qualityTier || !config.size || !config.baseColor) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Select options to preview', rect.width / 2, rect.height / 2);
    }

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
      </Card>
    </motion.div>
  );
}