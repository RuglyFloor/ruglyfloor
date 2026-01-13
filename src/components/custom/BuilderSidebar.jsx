import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InteractiveRugPreview from './InteractiveRugPreview';
import { Info, Layers, Palette, ShieldCheck, Sparkles } from 'lucide-react';

export default function BuilderSidebar({ 
  step, 
  config, 
  currentPrice,
  baseColors,
  paintColors
}) {
  const renderStepInfo = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Quality Guarantee</h4>
                <p className="text-xs text-gray-600 mt-1">
                  All our rugs are made from durable, high-quality materials suitable for high-traffic areas.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <h4 className="font-semibold mb-2">Size Tips:</h4>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li><strong>Tiny (2x3):</strong> Perfect for entryways or small nooks.</li>
                <li><strong>Small (4x6):</strong> Great for kitchens or beside beds.</li>
                <li><strong>Medium (5x7):</strong> Ideal for living areas or under coffee tables.</li>
                <li><strong>Large (8x10):</strong> Anchors a room, fits under sofas/beds.</li>
              </ul>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Color Harmony</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Choose a base color that matches your room's dominant tone. The paint color should contrast well for visibility.
                </p>
              </div>
            </div>
            
            {config.baseColor && (
              <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                <div 
                  className="w-8 h-10 rounded-sm border border-gray-200 shadow-sm"
                  style={{ 
                    backgroundColor: baseColors.find(c => c.name === config.baseColor)?.hex 
                  }}
                />
                <div>
                  <div className="text-xs font-semibold">Selected Base</div>
                  <div className="text-xs text-gray-600">{config.baseColor}</div>
                </div>
              </div>
            )}

            {config.paintColor && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                    style={{ 
                      backgroundColor: paintColors.find(c => c.name === config.paintColor)?.hex,
                      borderRadius: '50% 50% 50% 0',
                      transform: 'rotate(135deg)'
                    }}
                  />
                  <div>
                    <div className="text-xs font-semibold">1st Paint Color</div>
                    <div className="text-xs text-gray-600">{config.paintColor}</div>
                  </div>
                </div>
                {config.secondPaintColor && (
                  <div className="flex items-center gap-3 mt-2">
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                      style={{ 
                        backgroundColor: paintColors.find(c => c.name === config.secondPaintColor)?.hex,
                        borderRadius: '50% 50% 50% 0',
                        transform: 'rotate(135deg)'
                      }}
                    />
                    <div>
                      <div className="text-xs font-semibold">2nd Paint Color</div>
                      <div className="text-xs text-gray-600">{config.secondPaintColor}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
             <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Design Modes</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Upload your own image, draw from scratch, or pick from our library. We'll convert it into a stencil.
                </p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
               <p className="text-xs text-blue-800">
                 <strong>Pro Tip:</strong> Simple, high-contrast images work best for stencil conversion. Avoid overly complex photos.
               </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
             <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Premium Finishes</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Take your rug to the next level with our hand-finished effects.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg text-xs">
                <strong className="block text-gray-900 mb-1">3D Effect</strong>
                Adds depth and shading to make the design pop off the rug.
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-xs">
                <strong className="block text-gray-900 mb-1">Bevel Lines</strong>
                Hand-carved grooves around the design edges for texture.
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-xs">
                <strong className="block text-gray-900 mb-1">Carve Out</strong>
                Removing material to create physical depth in the pile.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sticky top-24 space-y-6">
      {/* Dynamic Preview or Placeholder */}
      {(config.imageUrl && config.baseColor) ? (
        <InteractiveRugPreview
          designUrl={config.imageUrl}
          baseColor={baseColors.find(c => c.name === config.baseColor)?.hex}
          paintColor={paintColors.find(c => c.name === config.paintColor)?.hex}
          size={config.size}
        />
      ) : (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse" />
            <p className="text-sm text-gray-500">
              Preview will appear here<br/>once you select colors and design
            </p>
          </CardContent>
        </Card>
      )}

      {/* Guidance Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Guide & Tips</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepInfo()}
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="bg-gray-900 text-white border-none">
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm text-gray-400">Total Price</span>
            <span className="text-3xl font-bold">${currentPrice}</span>
          </div>
          <div className="text-xs text-gray-400 border-t border-gray-700 pt-3 mt-2 space-y-1">
            {config.size && <div className="flex justify-between"><span>Size: {config.size}</span></div>}
            {config.upsellTotal > 0 && <div className="flex justify-between"><span>Upgrades: +${config.upsellTotal}</span></div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}