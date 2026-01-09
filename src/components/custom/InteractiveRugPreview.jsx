import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InteractiveRugPreview({ 
  designUrl, 
  baseColor, 
  paintColor, 
  size,
  opacity = 0.9 
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !designUrl || !baseColor) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const containerWidth = canvas.parentElement.offsetWidth;
    canvas.width = containerWidth;
    canvas.height = containerWidth * 0.75;

    // Draw rug base
    const rugWidth = canvas.width * 0.8;
    const rugHeight = canvas.height * 0.8;
    const rugX = (canvas.width - rugWidth) / 2;
    const rugY = (canvas.height - rugHeight) / 2;

    // Background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rug shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(rugX + 10, rugY + 10, rugWidth, rugHeight);

    // Rug base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(rugX, rugY, rugWidth, rugHeight);

    // Load and draw design
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Apply color tint if paint color is specified
      if (paintColor) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = paintColor;
        ctx.fillRect(rugX, rugY, rugWidth, rugHeight);
        ctx.globalCompositeOperation = 'destination-in';
      }
      
      // Draw design
      const aspectRatio = img.width / img.height;
      let drawWidth = rugWidth * 0.7;
      let drawHeight = drawWidth / aspectRatio;
      
      if (drawHeight > rugHeight * 0.7) {
        drawHeight = rugHeight * 0.7;
        drawWidth = drawHeight * aspectRatio;
      }
      
      const drawX = rugX + (rugWidth - drawWidth) / 2;
      const drawY = rugY + (rugHeight - drawHeight) / 2;
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      // Rug texture overlay
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      for (let i = 0; i < rugHeight; i += 2) {
        ctx.fillRect(rugX, rugY + i, rugWidth, 1);
      }
    };
    img.src = designUrl;
  }, [designUrl, baseColor, paintColor, opacity, size]);

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas 
          ref={canvasRef}
          className="w-full rounded-lg shadow-lg"
        />
        <p className="text-xs text-gray-500 text-center mt-3">
          Real-time preview • Colors and design update instantly
        </p>
      </CardContent>
    </Card>
  );
}