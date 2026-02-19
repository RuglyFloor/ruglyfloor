import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InteractiveRugPreview from './InteractiveRugPreview';
import QuickEditPanel from './QuickEditPanel';
import { Clock, Zap } from 'lucide-react';

const BASE_COLORS = [
  { name: 'Yellow', hex: '#f4d03f' },
  { name: 'Pink', hex: '#f8c9d4' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Burnt Orange', hex: '#cc5500' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Green', hex: '#86cb92' },
  { name: 'Tan', hex: '#d2b48c' },
  { name: 'Khaki', hex: '#c3b091' },
];

const PAINT_COLORS = [
  { name: 'Sun Yellow', hex: '#ffd700' },
  { name: 'Bright Orange', hex: '#ff4500' },
  { name: 'Red', hex: '#dc143c' },
  { name: 'Violet', hex: '#7851a9' },
  { name: 'Blue', hex: '#2e5090' },
  { name: 'Bright Green', hex: '#00a651' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Emerald Green', hex: '#046307' },
  { name: 'Crimson', hex: '#c8102e' },
  { name: 'Purple', hex: '#5b3a70' },
  { name: 'Dioxazine Purple', hex: '#1c0d82' },
  { name: 'Hansa Yellow', hex: '#ffd300' },
  { name: 'Vermillion', hex: '#ff4500' },
];

const QUALITY_TIERS = [
  { id: 'budget', label: 'Crugly', color: '#24f0a0', priceMultiplier: 0.7 },
  { id: 'good', label: 'Rugly', color: '#4075ff', priceMultiplier: 1.0 },
  { id: 'highend', label: 'Rugly Lux', color: '#f04624', priceMultiplier: 1.25 },
];

export default function BuilderSidebar({ 
  step, 
  config, 
  currentPrice,
  isRush = false,
  onToggleRush,
  qualityTier,
  onConfigChange,
}) {
  const tierColor = QUALITY_TIERS.find(t => t.id === config.qualityTier)?.color || '#4075ff';

  const calculateEstimatedDays = () => {
    let days = 7;
    if (config.size === 'large') days += 1;
    else if (config.size === 'huge') days += 2;
    if (config.secondPaintColor) days += 1;
    if (config.is3D) days += 2;
    return days;
  };

  const estimatedDays = calculateEstimatedDays();

  return (
    <div className="sticky top-24 space-y-4">
      {/* Live Preview */}
      {config.baseColor ? (
        <InteractiveRugPreview
          key={`preview-${config.imageUrl}-${config.baseColor}-${config.paintColor}-${config.size}-${config.qualityTier}`}
          designUrl={config.imageUrl}
          baseColor={BASE_COLORS.find(c => c.name === config.baseColor)?.hex}
          paintColor={PAINT_COLORS.find(c => c.name === config.paintColor)?.hex}
          size={config.size}
          qualityTier={qualityTier}
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

      {/* Quick Edit Panel */}
      {onConfigChange && (
        <QuickEditPanel
          config={config}
          onConfigChange={onConfigChange}
          tierColor={tierColor}
        />
      )}

      {/* Price Summary */}
      <Card className="border-none" style={{ backgroundColor: '#343634' }}>
        <CardContent className="p-5">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm text-gray-400">Total Price</span>
            <span className="text-3xl font-bold text-white">${currentPrice + (isRush ? 99 : 0)}</span>
          </div>
          <div className="text-xs text-gray-400 border-t border-gray-700 pt-3 mt-2 space-y-1">
            {config.size && <div>Size: {config.size}</div>}
            {isRush && <div className="text-amber-400">Rush Fee: +$99</div>}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Estimated Production</span>
            </div>
            {isRush ? (
              <div className="text-sm font-semibold text-amber-400">10 days or less</div>
            ) : (
              <div className="text-sm font-semibold text-white">{estimatedDays} days</div>
            )}
          </div>

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