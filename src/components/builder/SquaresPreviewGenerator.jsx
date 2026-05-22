import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function SquaresPreviewGenerator({ gridData, stencilDataUrl, designInstructions, tierColor, generateRef, onPreviewGenerated }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePreview = async () => {
    if (!gridData || !stencilDataUrl) return;
    setLoading(true);
    setError(null);

    try {
      // Render the grid to a canvas and upload it
      const canvas = document.createElement('canvas');
      const TILE_SIZE = 60;
      canvas.width = gridData.cols * TILE_SIZE;
      canvas.height = gridData.rows * TILE_SIZE;
      const ctx = canvas.getContext('2d');

      // Draw colored tiles
      gridData.grid.forEach((row, r) => {
        row.forEach((color, c) => {
          ctx.fillStyle = color;
          ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Draw tile border
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          ctx.strokeRect(c * TILE_SIZE + 0.5, r * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
          // Add texture hint for carpet
          if (gridData.surfaceType === 'carpet') {
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            for (let i = 0; i < 6; i++) {
              const tx = c * TILE_SIZE + (i % 3) * 20 + 5;
              const ty = r * TILE_SIZE + Math.floor(i / 3) * 25 + 10;
              ctx.fillRect(tx, ty, 8, 3);
            }
          }
        });
      });

      // Convert canvas to blob and upload
      const gridBlob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      const gridFile = new File([gridBlob], 'grid.png', { type: 'image/png' });
      const gridUpload = await base44.integrations.Core.UploadFile({ file: gridFile });

      // Upload stencil
      const stencilRes = await fetch(stencilDataUrl);
      const stencilBlob = await stencilRes.blob();
      const stencilFile = new File([stencilBlob], 'stencil.png', { type: 'image/png' });
      const stencilUpload = await base44.integrations.Core.UploadFile({ file: stencilFile });

      const totalSqFt = gridData.cols * gridData.rows * 4;
      const surfaceDesc = gridData.surfaceType === 'carpet' ? 'soft carpet loop pile' : 'smooth foam/vinyl';
      const extraInstructions = designInstructions?.trim()
        ? `\n\nCUSTOMER INSTRUCTIONS: ${designInstructions.trim()}`
        : '';

      // Build a precise text description of the grid layout row by row
      const gridDescription = gridData.grid.map((row, r) => {
        const rowDesc = row.map((color, c) => `(${c+1},${r+1})=${color}`).join(' ');
        return `Row ${r+1} (top to bottom): ${rowDesc}`;
      }).join('\n');

      const prompt = `You are a photorealistic product visualization artist for custom painted floor tile/square installations.

REFERENCE IMAGE 1: A color-coded pixel grid showing the EXACT tile color layout. Each pixel/cell = one 2ft×2ft tile. The grid is ${gridData.cols} tiles wide × ${gridData.rows} tiles tall. You MUST replicate this color layout exactly — do not rotate, mirror, or reinterpret it.

EXACT TILE COLOR MAP (col, row) — column 1 is LEFT, row 1 is TOP:
${gridDescription}

REFERENCE IMAGE 2: A stencil/traced design that must be painted ACROSS the entire tile installation as one cohesive unified artwork spanning all tiles.

YOUR TASK:
1. Show the ${gridData.cols}×${gridData.rows} tile grid (${totalSqFt} sq ft total, each tile is 2ft×2ft) installed on a floor in a realistic room setting
2. CRITICAL: Reproduce the EXACT color of every single tile as specified in the color map above. The color arrangement must match Reference Image 1 pixel-for-pixel — same column order (left to right) and same row order (top to bottom).
3. The stencil design from Reference Image 2 is hand-painted across the ENTIRE grid as one unified artwork — lines flow continuously across tile seams
4. Surface type: ${surfaceDesc} squares
5. The grid has clear tile seams/grout lines between each 2ft×2ft square
6. Perspective: overhead-angled room view showing the tiles flat on the floor
7. Photorealistic studio quality — no labels, no watermarks, no text${extraInstructions}`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: [gridUpload.file_url, stencilUpload.file_url],
      });

      setPreviewUrl(result.url);
      if (onPreviewGenerated) onPreviewGenerated(result.url);
    } catch (err) {
      console.error('Squares preview error:', err);
      setError('Preview generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (generateRef) generateRef.current = generatePreview;
  });

  if (!previewUrl && !loading && !error) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400">
        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <div className="text-sm">Click "Generate Image" above to preview your tile layout</div>
      </div>
    );
  }

  return (
    <div>
      {previewUrl && !loading && (
        <div className="flex justify-end mb-3">
          <button onClick={generatePreview} disabled={loading}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all"
            style={{ borderColor: tierColor, color: tierColor, backgroundColor: `${tierColor}0d` }}>
            <RefreshCw className="w-4 h-4" /> Regenerate
          </button>
        </div>
      )}
      <div className="relative rounded-2xl overflow-hidden border-4" style={{ borderColor: tierColor, minHeight: '240px', backgroundColor: '#f3f4f6' }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-10">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: tierColor }} />
              <Sparkles className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: tierColor }} />
            </div>
            <div className="font-bold text-gray-700 mb-1">Rendering your tile layout…</div>
            <div className="text-xs text-gray-400">Uploading grid &amp; generating AI preview</div>
          </div>
        )}
        {previewUrl && <img src={previewUrl} alt="AI Tile Preview" className="w-full object-contain" />}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="text-red-500 font-semibold mb-3">⚠️ {error}</div>
            <button onClick={generatePreview} className="text-sm font-bold px-4 py-2 rounded-lg text-white" style={{ backgroundColor: tierColor }}>Try Again</button>
          </div>
        )}
      </div>
      {previewUrl && !loading && (
        <p className="text-xs text-gray-400 text-center mt-2">AI preview — actual installation may vary. A digital proof is sent before production.</p>
      )}
    </div>
  );
}