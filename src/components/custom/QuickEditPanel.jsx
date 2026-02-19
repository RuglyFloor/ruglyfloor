import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const QUALITY_TIERS = [
  { id: 'budget', label: 'Crugly', color: '#24f0a0', priceMultiplier: 0.7 },
  { id: 'good', label: 'Rugly', color: '#4075ff', priceMultiplier: 1.0 },
  { id: 'highend', label: 'Rugly Lux', color: '#f04624', priceMultiplier: 1.25 },
];

const SIZES = [
  { id: 'tiny', label: 'Tiny', value: 'tiny', price: 79, measurement: '2x3' },
  { id: 'sm', label: 'Small', value: 'small', price: 200, measurement: '4x6' },
  { id: 'md', label: 'Medium', value: 'medium', price: 300, measurement: '5x7' },
  { id: 'lg', label: 'Large', value: 'large', price: 400, measurement: '8x10' },
  { id: 'hg', label: 'Huge', value: 'huge', price: 500, measurement: '9x11' },
  { id: 'rd', label: '3.14 (round)', value: '4ft round', price: 250, measurement: '4ft round' },
];

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

export default function QuickEditPanel({ config, onConfigChange, tierColor }) {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (section) => setOpenSection(prev => prev === section ? null : section);

  const Section = ({ id, label, summary, children }) => (
    <div className="border-b last:border-b-0" style={{ borderColor: `${tierColor}20` }}>
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
          <div className="text-sm font-semibold mt-0.5" style={{ color: tierColor }}>{summary}</div>
        </div>
        {openSection === id
          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {openSection === id && (
        <div className="px-4 pb-4">{children}</div>
      )}
    </div>
  );

  const currentTier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
  const currentSize = SIZES.find(s => s.value === config.size);
  const basePrice = currentTier && currentSize
    ? Math.round(currentSize.price * currentTier.priceMultiplier)
    : 0;

  return (
    <div className="rounded-xl overflow-hidden bg-white" style={{ border: `2px solid ${tierColor}` }}>
      <div className="px-4 py-3 text-sm font-bold" style={{ backgroundColor: tierColor, color: 'white' }}>
        ✏️ Quick Edit
      </div>

      {/* Quality */}
      <Section
        id="quality"
        label="Quality"
        summary={currentTier?.label || '—'}
      >
        <div className="grid grid-cols-3 gap-2 mt-1">
          {QUALITY_TIERS.map(tier => (
            <button
              key={tier.id}
              onClick={() => onConfigChange({ qualityTier: tier.id })}
              className="py-2 px-1 rounded-lg text-xs font-bold transition-all text-white"
              style={{
                backgroundColor: tier.color,
                opacity: config.qualityTier === tier.id ? 1 : 0.4,
                outline: config.qualityTier === tier.id ? `3px solid ${tier.color}` : 'none',
                outlineOffset: '2px',
              }}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Size */}
      <Section
        id="size"
        label="Size"
        summary={currentSize ? `${currentSize.label} (${currentSize.measurement}) — $${basePrice}` : '—'}
      >
        <div className="grid grid-cols-3 gap-2 mt-1">
          {SIZES.map(size => (
            <button
              key={size.id}
              onClick={() => onConfigChange({ size: size.value })}
              className="py-2 px-1 rounded-lg text-xs font-semibold border-2 transition-all bg-white"
              style={{
                borderColor: config.size === size.value ? tierColor : '#e5e7eb',
                color: config.size === size.value ? tierColor : '#6b7280',
              }}
            >
              <div className="font-bold">{size.label}</div>
              <div className="text-xs opacity-70">{size.measurement}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Base Color */}
      <Section
        id="base"
        label="Base Color"
        summary={config.baseColor || '—'}
      >
        <div className="flex flex-wrap gap-2 mt-1">
          {BASE_COLORS.map(color => (
            <button
              key={color.name}
              title={color.name}
              onClick={() => onConfigChange({ baseColor: color.name })}
              className="w-8 h-8 rounded-full border-4 transition-all"
              style={{
                backgroundColor: color.hex,
                borderColor: config.baseColor === color.name ? tierColor : 'transparent',
                boxShadow: config.baseColor === color.name ? `0 0 0 2px white, 0 0 0 4px ${tierColor}` : '0 0 0 1px #e5e7eb',
              }}
            />
          ))}
        </div>
      </Section>

      {/* Paint Color */}
      <Section
        id="paint"
        label="Paint Color"
        summary={[config.paintColor, config.secondPaintColor].filter(Boolean).join(' + ') || '—'}
      >
        <div className="space-y-3 mt-1">
          <div>
            <div className="text-xs text-gray-500 mb-1 font-semibold">1st Color</div>
            <div className="flex flex-wrap gap-2">
              {PAINT_COLORS.map(color => (
                <button
                  key={color.name}
                  title={color.name}
                  onClick={() => onConfigChange({ paintColor: color.name })}
                  className="w-7 h-7 rounded-full border-4 transition-all"
                  style={{
                    backgroundColor: color.hex,
                    borderColor: config.paintColor === color.name ? tierColor : 'transparent',
                    boxShadow: config.paintColor === color.name
                      ? `0 0 0 2px white, 0 0 0 4px ${tierColor}`
                      : '0 0 0 1px #e5e7eb',
                  }}
                />
              ))}
            </div>
          </div>
          {config.hasSecondColor && (
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">2nd Color</div>
              <div className="flex flex-wrap gap-2">
                {PAINT_COLORS.map(color => (
                  <button
                    key={color.name}
                    title={color.name}
                    onClick={() => onConfigChange({ secondPaintColor: color.name })}
                    className="w-7 h-7 rounded-full border-4 transition-all"
                    style={{
                      backgroundColor: color.hex,
                      borderColor: config.secondPaintColor === color.name ? tierColor : 'transparent',
                      boxShadow: config.secondPaintColor === color.name
                        ? `0 0 0 2px white, 0 0 0 4px ${tierColor}`
                        : '0 0 0 1px #e5e7eb',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {!config.hasSecondColor && (
            <button
              onClick={() => onConfigChange({ hasSecondColor: true })}
              className="text-xs underline"
              style={{ color: tierColor }}
            >
              + Add 2nd color
            </button>
          )}
        </div>
      </Section>
    </div>
  );
}