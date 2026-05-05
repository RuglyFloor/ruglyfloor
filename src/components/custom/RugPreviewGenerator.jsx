import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw } from 'lucide-react';

const RUG_ROOM_IMAGE = 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/4d402d91e_generated_image.png';

export default function RugPreviewGenerator({ config, tier, sizeObj, BASE_COLORS, onPreviewGenerated, designInstructions }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track what was used for the last generation
  const lastGenRef = useRef(null);

  const baseColorHex = BASE_COLORS.find(c => c.name === config.baseColor)?.hex || '#ffffff';
  const paintColorHex = config.paintColorHex || '#000000';
  const secondPaintColorHex = config.hasSecondColor ? (config.secondPaintColorHex || null) : null;

  const inputHash = `${config.processedImageUrl || config.imageUrl}|${config.baseColor}|${paintColorHex}|${secondPaintColorHex}|${designInstructions}|${config.stencilMode}`;
  const hasChangedSinceLastGen = lastGenRef.current !== null && lastGenRef.current !== inputHash;
  // Use processed stencil — require it to be confirmed before generating
  const designImageUrl = config.processedImageUrl || config.imageUrl;
  const hasStencil = !!config.processedImageUrl; // only generate once stencil is confirmed
  const canGenerate = !!designImageUrl && !!config.baseColor && !!paintColorHex && hasStencil;
  // Regenerate is active if there are changes since last gen, or if never generated yet
  const regenerateActive = canGenerate && (lastGenRef.current === null || hasChangedSinceLastGen);

  const generatePreview = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    lastGenRef.current = inputHash;

    try {
      const colorDescription = secondPaintColorHex
        ? `primary paint color ${paintColorHex} and secondary paint color ${secondPaintColorHex}`
        : `paint color ${paintColorHex}`;

      const extraInstructions = designInstructions?.trim()
        ? `\n\nADDITIONAL CUSTOMER INSTRUCTIONS (follow exactly): ${designInstructions.trim()}`
        : '';

      // Size-to-room scale guidance
      const sizeScaleMap = {
        '2x3': 'small accent rug — about the size of a doormat, roughly 1/6 the visible floor area',
        '3x5': 'small area rug — covers roughly 1/4 of a typical room\'s visible floor area',
        '4x6': 'medium area rug — covers roughly 1/3 of the visible floor area, fits under a coffee table',
        '5x7': 'large area rug — covers roughly 1/2 the visible floor area, anchors a full seating area',
        '6x9': 'extra-large area rug — covers roughly 2/3 of the visible floor area, extends under sofa legs',
      };
      const sizeGuide = sizeScaleMap[sizeObj?.id] || `${sizeObj?.measurement || ''} rug`;
      const stencilNote = config.processedImageUrl
        ? `The second reference image is the STENCIL/TRACE of the customer's design (${config.stencilMode || 'edge-detected'} filter). This is the EXACT pattern to paint — every line, shape, and silhouette in the stencil must appear on the rug with zero deviation. Treat it as a blueprint.`
        : `The second reference image is the customer's original design. Trace its exact shapes and composition onto the rug.`;

      const prompt = `You are a photorealistic rug visualization artist. Your job: composite the customer's stencil design onto the rug in the room photo with pixel-perfect accuracy.

STEP 1 — STENCIL FIDELITY (highest priority):
${stencilNote}
- Copy EVERY shape, line, and silhouette from the stencil EXACTLY as-is onto the rug surface.
- Do NOT simplify, smooth, stylize, or re-interpret the design. Mirror it exactly.
- If the stencil has thin lines — keep them thin. If it has solid blocks — keep them solid.
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

      // Always send both room + stencil (processed preferred, fallback original)
      const imageRefs = [RUG_ROOM_IMAGE, designImageUrl];

      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: imageRefs
      });

      setPreviewUrl(result.url);
      if (onPreviewGenerated) onPreviewGenerated(result.url);
    } catch (err) {
      console.error('Preview generation error:', err);
      setError('Preview generation failed. Please try again.');
      // Reset so they can try again
      lastGenRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when all required inputs first become available
  useEffect(() => {
    if (canGenerate && lastGenRef.current === null && !loading) {
      generatePreview();
    }
  }, [canGenerate]);

  if (!canGenerate && !previewUrl) {
    const hasImage = !!config.imageUrl;
    const hasColors = !!config.baseColor && !!paintColorHex;
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400">
        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
        {hasImage && !config.processedImageUrl ? (
          <div className="text-sm font-semibold text-amber-500">
            ↑ Adjust your stencil settings above, then click "Use This Stencil" to generate your AI preview
          </div>
        ) : (
          <div className="text-sm">Complete your color and design selections above to generate your preview</div>
        )}
      </div>
    );
  }

  const tierColor = tier?.color || '#4075ff';

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {hasChangedSinceLastGen && !loading && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${tierColor}20`, color: tierColor }}>
              Selections changed
            </span>
          )}
        </div>
        <button
          onClick={generatePreview}
          disabled={!regenerateActive || loading}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all"
          style={{
            borderColor: regenerateActive && !loading ? tierColor : '#e5e7eb',
            color: regenerateActive && !loading ? tierColor : '#9ca3af',
            backgroundColor: regenerateActive && !loading ? `${tierColor}0d` : '#f9fafb',
            cursor: regenerateActive && !loading ? 'pointer' : 'not-allowed',
            opacity: regenerateActive && !loading ? 1 : 0.5,
          }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating…' : 'Regenerate Preview'}
        </button>
      </div>

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
            <div className="text-xs text-gray-400">AI is placing your design on the rug</div>
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

        {!previewUrl && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-16">
            <Sparkles className="w-10 h-10 mb-3 opacity-20" />
            <div className="text-gray-400 text-sm">Generating preview…</div>
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