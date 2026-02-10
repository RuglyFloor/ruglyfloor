import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InteractiveRugPreview from './InteractiveRugPreview';
import { Clock, Zap } from 'lucide-react';

export default function BuilderSidebar({ 
  step, 
  config, 
  currentPrice,
  baseColors,
  paintColors,
  isRush = false,
  onToggleRush,
  qualityTier
}) {
  const calculateEstimatedDays = () => {
    let days = 7; // Base time
    
    // Size adjustments
    if (config.size === 'Large (8x10)') {
      days += 1; // +24hr = +1 day
    } else if (config.size === 'Huge (9x11)') {
      days += 2; // +48hr = +2 days
    }
    
    // Color additions
    const numColors = config.secondPaintColor ? 2 : (config.paintColor ? 1 : 0);
    if (numColors > 0) {
      days += (numColors - 1) * 1; // Each additional color adds 1 day
    }
    
    // 3D effect adds 2 days
    if (config.is3D) {
      days += 2;
    }
    
    return days;
  };

  const estimatedDays = calculateEstimatedDays();

  return (
    <div className="sticky top-24 space-y-6">
      {/* Dynamic Preview or Placeholder */}
      {config.baseColor ? (
        <InteractiveRugPreview
          key={`preview-${config.imageUrl}-${config.baseColor}-${config.paintColor}`}
          designUrl={config.imageUrl}
          baseColor={baseColors.find(c => c.name === config.baseColor)?.hex}
          paintColor={paintColors.find(c => c.name === config.paintColor)?.hex}
          size={config.size}
          placeholder={!config.imageUrl}
          opacity={1}
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

      {/* Price Summary */}
      <Card className="bg-gray-900 text-white border-none">
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm text-gray-400">Total Price</span>
            <span className="text-3xl font-bold">${currentPrice + (isRush ? 99 : 0)}</span>
          </div>
          <div className="text-xs text-gray-400 border-t border-gray-700 pt-3 mt-2 space-y-1">
            {config.size && <div className="flex justify-between"><span>Size: {config.size}</span></div>}
            {config.upsellTotal > 0 && <div className="flex justify-between"><span>Upgrades: +${config.upsellTotal}</span></div>}
            {isRush && <div className="flex justify-between text-amber-400"><span>Rush Fee: +$99</span></div>}
          </div>

          {/* Estimated Production Time */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Estimated Production</span>
            </div>
            {isRush ? (
              <div className="text-sm font-semibold text-amber-400">10 days or less</div>
            ) : (
              <div className="text-sm font-semibold">{estimatedDays} days</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {config.size && config.size.includes('Large') && '• Large size: +1 day'}
              {config.size && config.size.includes('Huge') && '• Huge size: +2 days'}
              {config.secondPaintColor && <div>• 2nd color: +1 day</div>}
              {config.is3D && <div>• 3D effect: +2 days</div>}
            </div>
          </div>

          {/* Rush Button */}
          {onToggleRush && (
            <Button 
              onClick={onToggleRush}
              variant={isRush ? "default" : "outline"}
              className={`w-full mt-4 ${isRush ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-transparent border-amber-500 text-amber-500 hover:bg-amber-500/10'}`}
            >
              <Zap className="w-4 h-4 mr-2" />
              {isRush ? 'Rush Applied' : 'Add Rush (+$99)'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}