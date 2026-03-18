import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const PRESETS = [
  { label: 'Earth Tones', colors: ['#c8a97e', '#8b6914', '#5c3d2e', '#e8d5b7'] },
  { label: 'Ocean Blues', colors: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'] },
  { label: 'Bold & Modern', colors: ['#f04624', '#4075ff', '#24f0a0', '#343634'] },
  { label: 'Soft Pastels', colors: ['#ffb3c1', '#ffd6a5', '#caffbf', '#a0c4ff'] },
  { label: 'Monochrome', colors: ['#212529', '#495057', '#adb5bd', '#f8f9fa'] },
  { label: 'Desert Sunset', colors: ['#e63946', '#f4a261', '#e9c46a', '#264653'] },
];

export default function ColorPaletteBuilder({ value, onChange }) {
  // value is an array of hex strings
  const colors = Array.isArray(value) ? value : [];
  const [hexInput, setHexInput] = useState('#');
  const [activePreset, setActivePreset] = useState(null);

  const addColor = (hex) => {
    const clean = hex.startsWith('#') ? hex : '#' + hex;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean) && !colors.includes(clean)) {
      onChange([...colors, clean]);
    }
  };

  const removeColor = (idx) => {
    onChange(colors.filter((_, i) => i !== idx));
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.label);
    onChange(preset.colors);
  };

  const handleHexChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val.replace('#', '');
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      addColor(val);
      setHexInput('#');
    }
  };

  return (
    <div className="space-y-3">
      {/* Preset Palettes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p.label}
            onClick={() => applyPreset(p)}
            className="p-2 rounded-xl border-2 text-left transition-all"
            style={activePreset === p.label
              ? { borderColor: 'var(--brand-blue)', backgroundColor: '#eff6ff' }
              : { borderColor: '#e5e7eb', backgroundColor: 'white' }}
          >
            <div className="flex gap-1 mb-1">
              {p.colors.map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="text-xs font-bold text-gray-700">{p.label}</div>
          </button>
        ))}
      </div>

      {/* Custom Color Builder */}
      <div className="rounded-xl border-2 p-3 space-y-3" style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Build Custom Palette</p>

        {/* Selected Colors */}
        <div className="flex flex-wrap gap-2 min-h-8">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono border" style={{ backgroundColor: c + '22', borderColor: c }}>
              <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
              <span style={{ color: 'var(--brand-dark)' }}>{c.toUpperCase()}</span>
              <button type="button" onClick={() => removeColor(i)} className="ml-1 text-gray-400 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {colors.length === 0 && <p className="text-xs text-gray-400 italic">No colors selected yet</p>}
        </div>

        {/* Color Picker Row */}
        <div className="flex gap-2 items-center">
          {/* Native color wheel */}
          <div className="relative">
            <input
              type="color"
              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 p-0.5"
              defaultValue="#4075ff"
              onChange={(e) => { setActivePreset(null); addColor(e.target.value); }}
              title="Pick a color"
            />
          </div>

          {/* Hex code input */}
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            placeholder="#FF5733"
            maxLength={7}
            className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-mono focus:outline-none focus:border-blue-400"
            style={{ fontFamily: 'monospace' }}
          />
          <button
            type="button"
            onClick={() => { addColor(hexInput); setHexInput('#'); }}
            className="px-3 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-1"
            style={{ backgroundColor: 'var(--brand-blue)' }}
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Quick spectrum swatches */}
        <div>
          <p className="text-xs text-gray-400 mb-1">Quick picks:</p>
          <div className="flex flex-wrap gap-1">
            {['#FF0000','#FF6B00','#FFD700','#00C851','#007BFF','#6610f2','#FF007F','#00BCD4','#795548','#9E9E9E','#212121','#FFFFFF'].map(c => (
              <button
                type="button"
                key={c}
                onClick={() => { setActivePreset(null); addColor(c); }}
                title={c}
                className="w-7 h-7 rounded-md border-2 transition-transform hover:scale-110"
                style={{ backgroundColor: c, borderColor: colors.includes(c) ? 'var(--brand-blue)' : '#e5e7eb' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}