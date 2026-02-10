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

  // Get actual rug photo (main_image) from catalog
  const getBaseRugPhoto = () => {
    if (!qualityTier || !baseColor || catalogListings.length === 0) return null;
    
    const tierMap = {
      'budget': 'Crugly',
      'good': 'Rugly',
      'highend': 'Rugly LX'
    };
    
    const targetTier = tierMap[qualityTier];
    
    // Find matching catalog item with main_image
    const listing = catalogListings.find(l => 
      l.active && 
      l.quality_tier === targetTier &&
      l.color?.toLowerCase().includes(baseColor.toLowerCase()) &&
      l.main_image
    );
    
    return listing?.main_image || null;
  };

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

    // Setup canvas dimensions
    const rugWidth = canvas.width * 0.85;
    const rugHeight = canvas.height * 0.85;
    const rugX = (canvas.width - rugWidth) / 2;
    const rugY = (canvas.height - rugHeight) / 2;

    // Background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rug shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(rugX + 8, rugY + 8, rugWidth, rugHeight);

    // Load actual rug photo from catalog
    const baseRugPhotoUrl = getBaseRugPhoto();
    
    if (!baseRugPhotoUrl) {
      // Fallback if no catalog photo found
      ctx.fillStyle = baseColor;
      ctx.fillRect(rugX, rugY, rugWidth, rugHeight);
    }

    // Load base rug photo first, then composite design on top
    if (baseRugPhotoUrl) {
      const baseRugImg = new Image();
      baseRugImg.crossOrigin = 'anonymous';
      baseRugImg.onload = () => {
        // Draw the actual rug photo
        ctx.drawImage(baseRugImg, rugX, rugY, rugWidth, rugHeight);
        
        // Now load and composite the design on top
        loadAndDrawDesign();
      };
      baseRugImg.onerror = () => {
        console.error('Failed to load base rug photo, using fallback');
        ctx.fillStyle = baseColor;
        ctx.fillRect(rugX, rugY, rugWidth, rugHeight);
        loadAndDrawDesign();
      };
      baseRugImg.src = baseRugPhotoUrl;
    } else {
      // No catalog photo, just draw design
      loadAndDrawDesign();
    }
    
    function loadAndDrawDesign() {
      const designImg = new Image();
      designImg.crossOrigin = 'anonymous';
      designImg.onload = () => {
        // Process design to make white transparent
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = designImg.width;
        tempCanvas.height = designImg.height;
        
        tempCtx.drawImage(designImg, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, designImg.width, designImg.height);
        const data = imageData.data;
        
        // Check for transparency
        let hasTransparency = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            hasTransparency = true;
            break;
          }
        }
        
        // Remove white background
        if (!hasTransparency) {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (r > 250 && g > 250 && b > 250) {
              data[i + 3] = 0;
            }
          }
          tempCtx.putImageData(imageData, 0, 0);
        }
        
        // Calculate design size and position
        const aspectRatio = designImg.width / designImg.height;
        let drawWidth = rugWidth * 0.7;
        let drawHeight = drawWidth / aspectRatio;
        
        if (drawHeight > rugHeight * 0.7) {
          drawHeight = rugHeight * 0.7;
          drawWidth = drawHeight * aspectRatio;
        }
        
        const drawX = rugX + (rugWidth - drawWidth) / 2;
        const drawY = rugY + (rugHeight - drawHeight) / 2;
        
        // Draw design with paint color tint
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(tempCanvas, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      };
      designImg.onerror = (e) => {
        console.error('Failed to load design:', designUrl, e);
        ctx.fillStyle = '#fee';
        ctx.fillRect(rugX + rugWidth * 0.1, rugY + rugHeight * 0.4, rugWidth * 0.8, rugHeight * 0.2);
        ctx.fillStyle = '#c00';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Design failed to load', rugX + rugWidth/2, rugY + rugHeight/2);
      };
      designImg.src = designUrl;
    }
  }, [designUrl, baseColor, paintColor, opacity, size, placeholder, qualityTier, catalogListings]);

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
        <p className="text-xs text-orange-600 font-semibold text-center mt-2 bg-orange-50 p-2 rounded">
          ⚠️ Hand-painted by humans - expect natural variations & artistic character
        </p>
      </CardContent>
    </Card>
  );
}