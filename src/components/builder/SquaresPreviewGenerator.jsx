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
      // Render the grid to a canvas and upload it — use large tiles so AI can read colors clearly
      const canvas = document.createElement('canvas');
      const TILE_SIZE = 80;
      const BORDER = 3; // thick black border between tiles for clarity
      canvas.width = gridData.cols * TILE_SIZE;
      canvas.height = gridData.rows * TILE_SIZE;
      const ctx = canvas.getContext('2d');

      // Draw colored tiles
      gridData.grid.forEach((row, r) => {
        row.forEach((color, c) => {
          // Fill full tile
          ctx.fillStyle = color;
          ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Draw thick black grid lines so AI understands tile boundaries
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = BORDER;
          ctx.strokeRect(c * TILE_SIZE + BORDER/2, r * TILE_SIZE + BORDER/2, TILE_SIZE - BORDER, TILE_SIZE - BORDER);
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

REFERENCE IMAGE 1: The EXACT color layout map. It shows a ${gridData.cols}-column × ${gridData.rows}-row grid. Each colored cell = one 2ft×2ft physical tile. Copy this color layout EXACTLY — every tile color, every position.

EXACT TILE COLOR MAP — column 1=LEFT, row 1=TOP:
${gridDescription}

REFERENCE IMAGE 2: A stencil/logo design painted across the full installation as one unified artwork.

STRICT REQUIREMENTS:
1. The finished floor must show exactly ${gridData.cols} complete tiles wide and ${gridData.rows} complete tiles tall — NO partial/half tiles at any edge, every tile must be whole and fully visible.
2. Every single tile color MUST match the color map above exactly — replicate Reference Image 1 position-for-position with zero deviation.
3. The stencil from Reference Image 2 is painted across ALL tiles as one continuous unified design.
4. Surface: ${surfaceDesc} tiles, each 2ft×2ft with clear seam lines between them.
5. View: overhead-angled perspective of the entire floor installation, all ${totalSqFt} sq ft visible.
6. Photorealistic, no labels, no text, no watermarks.${extraInstructions}`;

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