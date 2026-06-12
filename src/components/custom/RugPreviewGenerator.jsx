import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw } from 'lucide-react';

const RUG_ROOM_IMAGE = 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/4d402d91e_generated_image.png';

export default function RugPreviewGenerator({ config, tier, sizeObj, BASE_COLORS, onPreviewGenerated, designInstructions, generateRef }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseColorHex = config.baseColorHex || BASE_COLORS.find(c => c.name === config.baseColor)?.hex || '#ffffff';
  const paintColorHex = config.paintColorHex || '#000000';
  const secondPaintColorHex = config.hasSecondColor ? (config.secondPaintColorHex || null) : null;
  const tierColor = tier?.color || '#4075ff';

  const generatePreview = async () => {
    if (!config.stencilDataUrl || !config.baseColor || !paintColorHex) return;
    setLoading(true);
    setError(null);

    try {
      const colorDescription = secondPaintColorHex
        ? `${paintColorHex} (primary) and ${secondPaintColorHex} (secondary)`
        : paintColorHex;

      const extraInstructions = designInstructions?.trim()
        ? `\n\nADDITIONAL INSTRUCTIONS FROM CUSTOMER (follow exactly): ${designInstructions.trim()}`
        : '';

      const sizeScaleMap = {
        '2x3': 'small accent rug — doormat-sized, roughly 1/6 of the visible floor area',
        '3x5': 'small area rug — covers roughly 1/4 of a typical room\'s visible floor',
        '4x6': 'medium area rug — covers roughly 1/3 of the visible floor, fits under a coffee table',
        '5x7': 'large area rug — covers roughly 1/2 the visible floor, anchors a full seating area',
        '6x9': 'extra-large area rug — covers roughly 2/3 of the visible floor, extends under sofa legs',
      };
      const sizeGuide = sizeScaleMap[sizeObj?.id] || `${sizeObj?.measurement || ''} rug`;

      // Always use the stencil canvas output as the design reference — this IS what gets painted on the rug.
      // Never use the original photo — we physically cannot stencil a photo-realistic image.
      const stencilRes = await fetch(config.stencilDataUrl);
      const stencilBlob = await stencilRes.blob();
      const stencilFile = new File([stencilBlob], 'stencil.png', { type: 'image/png' });
      const stencilUpload = await base44.integrations.Core.UploadFile({ file: stencilFile });
      const referenceUrls = [RUG_ROOM_IMAGE, stencilUpload.file_url];

      const prompt = `Photorealistic interior design photo. Place a custom hand-painted area rug on the floor of the room shown in image 1 (keep all room elements — furniture, walls, floor — exactly as they appear).

THE RUG DESIGN (CRITICAL):
- Image 2 is the EXACT stencil design that will be physically painted onto the rug. You MUST reproduce this stencil exactly as shown — same shapes, same silhouettes, same composition.
- The rug base color is solid ${config.baseColor} (${baseColorHex}). The painted stencil design is in ${colorDescription}.
- This is a hand-painted stencil rug. The design must look FLAT and PAINTED — like paint applied through a stencil. NO photorealism, NO gradients, NO shading, NO fur texture, NO 3D detail. Flat solid color shapes only, exactly matching the stencil outlines in image 2.
- Do NOT add any detail that is not in the stencil. Do NOT make it look like a photograph or digital print. It must look like paint on fabric — because that is exactly what it is.${secondPaintColorHex ? ` Use ${paintColorHex} for the main stencil shapes and ${secondPaintColorHex} for secondary shapes.` : ''}

RUG SIZE & PLACEMENT:
- Rug size: ${sizeObj?.measurement || ''} (${sizeGuide})
- Lies flat on the floor in correct perspective, occupying the appropriate proportion of the room floor
- Subtle drop shadow around rug edges

OUTPUT: A single photorealistic room photo with the stencil-painted rug clearly visible. No text, labels, watermarks, or borders.${extraInstructions}`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: referenceUrls,
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