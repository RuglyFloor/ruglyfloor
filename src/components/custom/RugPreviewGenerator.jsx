import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw } from 'lucide-react';

const RUG_ROOM_IMAGE = 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/4d402d91e_generated_image.png';

export default function RugPreviewGenerator({ config, tier, sizeObj, BASE_COLORS, onPreviewGenerated, designInstructions, generateRef }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseColorHex = BASE_COLORS.find(c => c.name === config.baseColor)?.hex || '#ffffff';
  const paintColorHex = config.paintColorHex || '#000000';
  const secondPaintColorHex = config.hasSecondColor ? (config.secondPaintColorHex || null) : null;
  const tierColor = tier?.color || '#4075ff';

  const generatePreview = async () => {
    if (!config.stencilDataUrl || !config.baseColor || !paintColorHex) return;
    setLoading(true);
    setError(null);

    try {
      // Upload the stencil dataUrl to get a public URL for the AI
      const res = await fetch(config.stencilDataUrl);
      const blob = await res.blob();
      const stencilFile = new File([blob], 'stencil.png', { type: 'image/png' });
      const uploadResult = await base44.integrations.Core.UploadFile({ file: stencilFile });
      const stencilUrl = uploadResult.file_url;

      const colorDescription = secondPaintColorHex
        ? `primary paint color ${paintColorHex} and secondary paint color ${secondPaintColorHex}`
        : `paint color ${paintColorHex}`;

      const extraInstructions = designInstructions?.trim()
        ? `\n\nADDITIONAL CUSTOMER INSTRUCTIONS (follow exactly): ${designInstructions.trim()}`
        : '';

      const sizeScaleMap = {
        '2x3': 'small accent rug — about the size of a doormat, roughly 1/6 the visible floor area',
        '3x5': 'small area rug — covers roughly 1/4 of a typical room\'s visible floor area',
        '4x6': 'medium area rug — covers roughly 1/3 of the visible floor area, fits under a coffee table',
        '5x7': 'large area rug — covers roughly 1/2 the visible floor area, anchors a full seating area',
        '6x9': 'extra-large area rug — covers roughly 2/3 of the visible floor area, extends under sofa legs',
      };
      const sizeGuide = sizeScaleMap[sizeObj?.id] || `${sizeObj?.measurement || ''} rug`;

      const prompt = `You are a photorealistic rug visualization artist. Your job: composite the customer's stencil design onto the rug in the room photo with pixel-perfect accuracy.

STEP 1 — STENCIL FIDELITY (highest priority):
The second reference image is the STENCIL/TRACE of the customer's design (${config.stencilMode || 'edge-detected'} filter). This is the EXACT pattern to paint — every line, shape, and silhouette in the stencil must appear on the rug with zero deviation. Treat it as a blueprint.
- Copy EVERY shape, line, and silhouette from the stencil EXACTLY as-is onto the rug surface.
- Do NOT simplify, smooth, stylize, or re-interpret the design. Mirror it exactly.
- The painted design on the rug must be IDENTICAL in composition to the stencil image.

STEP 2 — COLOR (critical, exact hex values):
- Rug base / background: fill the entire rug field with EXACTLY hex ${baseColorHex} (${config.baseColor}). No variation.
- Primary paint color: all stenciled design elements painted in EXACTLY hex ${paintColorHex}.${secondPaintColorHex ? `\n- Secondary paint color: secondary stencil elements painted in EXACTLY hex ${secondPaintColorHex}.` : ''}
- No blending, no approximation — match hex values precisely.

STEP 3 — RUG SIZE & ROOM SCALE (critical):
The rug is a ${sizeObj?.measurement || ''} (${sizeGuide}).
- The rug must occupy exactly this proportion of the floor in the room scene.
- A 2x3 rug looks like a doormat. A 5x7 rug fills most of the seating area. Scale accordingly.
- Show the correct aspect ratio: width-to-length ratio must match ${sizeObj?.measurement || ''}.
- The rug lies flat on the floor with correct perspective foreshortening (slight overhead angle).

STEP 4 — PAINTING STYLE:
- The design looks hand-painted with subtle brush texture — not digitally printed.
- Paint strokes follow the outlines of the stencil shapes.

STEP 5 — BACKGROUND (unchanged):
- Keep every element outside the rug (sofa, guitar, bookshelf, floor, walls) EXACTLY as in the reference room photo.
- Only the rug changes.

STEP 6 — CLEAN OUTPUT:
- Zero text, labels, watermarks, template codes, dashed borders, or annotations anywhere in the image.

Final: a photorealistic room with a correctly-scaled ${sizeObj?.measurement || ''} ${tier?.label || ''} rug, showing the stencil design painted exactly in ${colorDescription} on a ${config.baseColor} (${baseColorHex}) base.${extraInstructions}`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: [RUG_ROOM_IMAGE, stencilUrl],
      });

      setPreviewUrl(result.url);
      if (onPreviewGenerated) onPreviewGenerated(result.url);
    } catch (err) {
      console.error('Preview generation error:', err);
      setError('Preview generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Expose generatePreview to parent via ref
  useEffect(() => {
    if (generateRef) {
      generateRef.current = generatePreview;
    }
  });

  if (!previewUrl && !loading && !error) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400">
        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <div className="text-sm">Click "Generate Image" above to create your AI preview</div>
      </div>
    );
  }

  return (
    <div>
      {/* Regenerate button */}
      {previewUrl && !loading && (
        <div className="flex justify-end mb-3">
          <button
            onClick={generatePreview}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all"
            style={{ borderColor: tierColor, color: tierColor, backgroundColor: `${tierColor}0d` }}
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      )}

      {/* Preview box */}
      <div
        className="relative rounded-2xl overflow-hidden border-4"
        style={{ borderColor: tierColor, minHeight: '240px', backgroundColor: '#f3f4f6' }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-10">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-gray-200 animate-spin"
                style={{ borderTopColor: tierColor }} />
              <Sparkles className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ color: tierColor }} />
            </div>
            <div className="font-bold text-gray-700 mb-1">Painting your rug…</div>
            <div className="text-xs text-gray-400">Uploading stencil &amp; generating AI preview</div>
          </div>
        )}

        {previewUrl && (
          <img src={previewUrl} alt="AI Rug Preview" className="w-full object-contain" />
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="text-red-500 font-semibold mb-3">⚠️ {error}</div>
            <button
              onClick={generatePreview}
              className="text-sm font-bold px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: tierColor }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {previewUrl && !loading && (
        <p className="text-xs text-gray-400 text-center mt-2">
          AI preview — actual rug may vary slightly. A digital proof is always sent before painting.
        </p>
      )}
    </div>
  );
}