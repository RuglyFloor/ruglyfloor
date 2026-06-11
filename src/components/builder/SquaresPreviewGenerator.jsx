import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function SquaresPreviewGenerator({ gridData, stencilDataUrl, stencilPaintColor, stencilPaintColorName, designInstructions, tierColor, generateRef, onPreviewGenerated }) {
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
      const extraInstructions = designInstructions?.trim()
        ? `\n\nCUSTOMER INSTRUCTIONS: ${designInstructions.trim()}`
        : '';

      const paintColorDesc = stencilPaintColorName || 'white';
      const isCarpet = gridData.surfaceType === 'carpet';
      const tileDesc = isCarpet
        ? 'soft plush carpet squares with a short-pile textile surface and visible seams between tiles'
        : 'smooth flat EVA foam tiles with a matte surface and visible puzzle-piece interlocking seams';
      const floorDesc = isCarpet
        ? 'in a cozy living room on a hardwood floor'
        : 'in a gym or modern room on a concrete or hardwood floor';

      const prompt = `Photorealistic room photo showing custom interlocking ${tileDesc} laid out ${floorDesc}, slight overhead angle showing all tiles.

TILE GRID: ${gridData.cols} columns wide × ${gridData.rows} rows tall. Each tile is 24"×24".

CRITICAL — TILE COLORS: Reference image 1 shows the EXACT color layout. Copy every tile's color position-for-position exactly as shown in that image. Do not change, reorder, or swap any colors.

STENCIL DESIGN: Paint the artwork from reference image 2 continuously across all tiles in ${paintColorDesc}. The design spans the whole installation as one unified image.

ABSOLUTE RULES — VIOLATIONS WILL REJECT THE IMAGE:
- ZERO text, letters, numbers, hex codes, labels, or writing of any kind anywhere in the image
- No watermarks, borders, annotations, or overlays
- Exactly ${gridData.cols}×${gridData.rows} complete tiles — no partial tiles${extraInstructions}`;

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
            <div className="text-xs text-gray-400">Uploading grid &amp; stencil, generating AI preview…</div>
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