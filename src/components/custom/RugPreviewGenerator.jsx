import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw } from 'lucide-react';

const RUG_ROOM_IMAGE = 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/bc893af7a_Yourdesignhere.png';

export default function RugPreviewGenerator({ config, tier, sizeObj, BASE_COLORS }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastInputHash, setLastInputHash] = useState(null);

  const baseColorHex = BASE_COLORS.find(c => c.name === config.baseColor)?.hex || '#ffffff';
  const paintColorHex = config.paintColorHex || '#000000';
  const secondPaintColorHex = config.hasSecondColor ? (config.secondPaintColorHex || null) : null;

  const inputHash = `${config.imageUrl}|${config.baseColor}|${paintColorHex}|${secondPaintColorHex}`;

  const generatePreview = async () => {
    if (!config.imageUrl) return;
    setLoading(true);
    setError(null);
    setLastInputHash(inputHash);

    try {
      const colorDescription = secondPaintColorHex
        ? `primary paint color ${paintColorHex} and secondary paint color ${secondPaintColorHex}`
        : `paint color ${paintColorHex}`;

      const prompt = `You are a rug visualization expert. Your task:

1. Take the uploaded customer design image and simplify/reduce it to a bold stencil-style artwork — 2 to ${config.hasSecondColor ? 4 : 2} flat colors max, removing gradients and fine detail, as if it were cut as a stencil and hand-painted.

2. Composite that stencil design onto the white/light rug in this room photo. The rug in the photo is lying flat in a living room — place the design centered on the rug surface, respecting its perspective/foreshortening.

3. Recolor the rug base to match hex color ${baseColorHex} (rug base color: ${config.baseColor}).

4. Paint the stencil design on the rug using ${colorDescription}. The design should look hand-painted with slight texture/brush strokes, not digitally printed.

5. The room background, furniture, and everything outside the rug must remain EXACTLY as in the original room photo.

The result should look like a real photo of a ${sizeObj?.measurement || ''} ${tier?.label || ''} rug with the customer's design hand-painted on it in ${config.baseColor} base with ${colorDescription}.

Output a photorealistic room scene. Do NOT add any text or labels.`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: [RUG_ROOM_IMAGE, config.imageUrl]
      });

      setPreviewUrl(result.url);
    } catch (err) {
      console.error('Preview generation error:', err);
      setError('Preview generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when imageUrl first appears
  useEffect(() => {
    if (config.imageUrl && inputHash !== lastInputHash && !loading) {
      generatePreview();
    }
  }, [config.imageUrl]);

  if (!config.imageUrl) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: tier?.color || '#4075ff' }} />
          AI Rug Preview
        </div>
        {(previewUrl || error) && !loading && (
          <button
            onClick={generatePreview}
            className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg border-2 transition-all"
            style={{ borderColor: tier?.color || '#4075ff', color: tier?.color || '#4075ff' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        )}
      </div>

      <div
        className="relative rounded-2xl overflow-hidden border-4"
        style={{ borderColor: tier?.color || '#4075ff', minHeight: '220px', backgroundColor: '#f3f4f6' }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-transparent animate-spin"
                style={{ borderTopColor: tier?.color || '#4075ff' }} />
              <Sparkles className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ color: tier?.color || '#4075ff' }} />
            </div>
            <div className="font-bold text-gray-700 mb-1">Generating your rug preview…</div>
            <div className="text-xs text-gray-400">AI is painting your design onto the rug</div>
          </div>
        )}

        {previewUrl && !loading && (
          <img
            src={previewUrl}
            alt="AI Rug Preview"
            className="w-full object-contain"
          />
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="text-red-500 font-semibold mb-2">⚠️ {error}</div>
            <button
              onClick={generatePreview}
              className="text-sm font-bold px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: tier?.color || '#4075ff' }}
            >
              Try Again
            </button>
          </div>
        )}

        {!previewUrl && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Sparkles className="w-10 h-10 mb-3 opacity-30" />
            <div className="text-gray-400 text-sm">Preview will generate automatically</div>
          </div>
        )}
      </div>

      {previewUrl && !loading && (
        <p className="text-xs text-gray-400 text-center mt-2">
          AI preview — actual rug may vary slightly. A digital proof is sent before painting.
        </p>
      )}
    </div>
  );
}