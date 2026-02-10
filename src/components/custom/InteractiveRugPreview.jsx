import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function InteractiveRugPreview({ 
  designUrl, 
  baseColor, 
  paintColor, 
  size,
  qualityTier,
  opacity = 0.9,
  placeholder = false
}) {
  const canvasRef = useRef(null);
  
  // Fetch catalog listings to get material swatch
  const { data: catalogListings = [] } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => base44.entities.Catalog.list()
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const containerWidth = canvas.parentElement.offsetWidth;
    canvas.width = containerWidth;
    canvas.height = containerWidth * 0.75;
    
    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!baseColor) return;
    
    // If placeholder and no design, just show base color
    if (placeholder && !designUrl) {
      const rugWidth = canvas.width * 0.8;
      const rugHeight = canvas.height * 0.8;
      const rugX = (canvas.width - rugWidth) / 2;
      const rugY = (canvas.height - rugHeight) / 2;
      
      // Background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(rugX + 10, rugY + 10, rugWidth, rugHeight);
      
      // Base color
      ctx.fillStyle = baseColor;
      ctx.fillRect(rugX, rugY, rugWidth, rugHeight);
      
      // Texture
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      for (let i = 0; i < rugHeight; i += 2) {
        ctx.fillRect(rugX, rugY + i, rugWidth, 1);
      }
      return;
    }
    
    if (!designUrl) return;

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
      console.log('Image loaded successfully:', designUrl);
      
      // Create a temporary canvas to process the image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      
      // Draw image to temp canvas
      tempCtx.drawImage(img, 0, 0);
      
      // Check if image already has transparency
      const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;
      
      let hasTransparency = false;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          hasTransparency = true;
          break;
        }
      }
      
      // Only remove white if image doesn't already have transparency (PNG with alpha)
      if (!hasTransparency) {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // If pixel is pure white, make it transparent
          if (r > 250 && g > 250 && b > 250) {
            data[i + 3] = 0;
          }
        }
        tempCtx.putImageData(imageData, 0, 0);
      }
      
      // Draw design directly on rug
      const aspectRatio = img.width / img.height;
      let drawWidth = rugWidth * 0.8;
      let drawHeight = drawWidth / aspectRatio;
      
      if (drawHeight > rugHeight * 0.8) {
        drawHeight = rugHeight * 0.8;
        drawWidth = drawHeight * aspectRatio;
      }
      
      const drawX = rugX + (rugWidth - drawWidth) / 2;
      const drawY = rugY + (rugHeight - drawHeight) / 2;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(tempCanvas, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      // Rug texture overlay
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      for (let i = 0; i < rugHeight; i += 3) {
        ctx.fillRect(rugX, rugY + i, rugWidth, 1);
      }
    };
    img.onerror = (e) => {
      console.error('Failed to load design image:', designUrl, e);
      // Show error state on canvas
      ctx.fillStyle = '#fee';
      ctx.fillRect(rugX, rugY, rugWidth, rugHeight);
      ctx.fillStyle = '#c00';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Failed to load image', rugX + rugWidth/2, rugY + rugHeight/2);
    };
    
    // Try loading without cache bust first
    img.src = designUrl;
  }, [designUrl, baseColor, paintColor, opacity, size, placeholder]);

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