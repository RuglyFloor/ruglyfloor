import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw } from 'lucide-react';

const RUG_ROOM_IMAGE = 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/bc893af7a_Yourdesignhere.png';

export default function RugPreviewGenerator({ config, tier, sizeObj, BASE_COLORS }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track what was used for the last generation
  const lastGenRef = useRef(null);

  const baseColorHex = BASE_COLORS.find(c => c.name === config.baseColor)?.hex || '#ffffff';
  const paintColorHex = config.paintColorHex || '#000000';
  const secondPaintColorHex = config.hasSecondColor ? (config.secondPaintColorHex || null) : null;

  const inputHash = `${config.imageUrl}|${config.baseColor}|${paintColorHex}|${secondPaintColorHex}`;
  const hasChangedSinceLastGen = lastGenRef.current !== null && lastGenRef.current !== inputHash;
  const canGenerate = !!config.imageUrl && !!config.baseColor && !!paintColorHex;
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

      const prompt = `You are a rug visualization expert. Your task:

1. Take the customer's uploaded design image and simplify it to a bold stencil-style artwork — ${config.hasSecondColor ? '3-4' : '2'} flat colors max, removing gradients and fine detail, as if it were cut as a stencil and hand-painted.

2. Composite that stencil design centered on the white rug lying flat in the room photo, respecting the rug's perspective/foreshortening (the rug is photographed at a slight angle from above).

3. Recolor the rug base to match hex color ${baseColorHex} (${config.baseColor}).

4. Paint the stencil design using ${colorDescription}. It should look hand-painted with slight texture/brush strokes, not digitally printed.

5. Keep the room background (sofa, guitar, bookshelf, concrete floor) EXACTLY as in the original room photo — only the rug changes.

Result: a photorealistic room scene with a ${sizeObj?.measurement || ''} ${tier?.label || ''} rug, ${config.baseColor} base, with the customer's design painted in ${colorDescription}. No text or labels.`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: [RUG_ROOM_IMAGE, config.imageUrl]
      });

      setPreviewUrl(result.url);
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
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400">
        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <div className="text-sm">Complete your color and design selections above to generate your preview</div>
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