import React, { useState, useRef, useEffect, useCallback } from 'react';

function hsvToHex(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    const val = v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return Math.round(val * 255).toString(16).padStart(2, '0');
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

function hexToHsv(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function isLight(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// Named paint color presets
const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Red', hex: '#dc143c' },
  { name: 'Blue', hex: '#2e5090' },
  { name: 'Green', hex: '#00a651' },
  { name: 'Yellow', hex: '#ffd700' },
  { name: 'Orange', hex: '#ff6600' },
  { name: 'Purple', hex: '#7851a9' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Pink', hex: '#ff69b4' },
];

export default function ColorWheelPicker({ value, onChange, label = 'Paint Color' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState(() => {
    if (value && value.startsWith('#')) return hexToHsv(value);
    return { h: 0, s: 0.8, v: 0.9 };
  });
  const [inputHex, setInputHex] = useState(value || '#dc143c');

  const wheelRef = useRef(null);
  const sliderRef = useRef(null);
  const brightnessRef = useRef(null);
  const draggingWheel = useRef(false);
  const draggingBrightness = useRef(false);

  const selectedHex = hsvToHex(hsv.h, hsv.s, hsv.v);

  // Sync external value changes
  useEffect(() => {
    if (value && value.startsWith('#') && value !== selectedHex) {
      const newHsv = hexToHsv(value);
      setHsv(newHsv);
      setInputHex(value);
    }
  }, [value]);

  const drawWheel = useCallback(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, r = size / 2 - 2;

    ctx.clearRect(0, 0, size, size);

    // Draw hue+saturation wheel
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      gradient.addColorStop(0, `hsla(${angle},0%,100%,1)`);
      gradient.addColorStop(1, `hsla(${angle},100%,50%,1)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Darken by brightness
    if (hsv.v < 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(0,0,0,${1 - hsv.v})`;
      ctx.fill();
    }

    // Clip to circle
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Draw selector dot
    const rad = hsv.h * Math.PI / 180;
    const dist = hsv.s * r;
    const dx = cx + Math.cos(rad) * dist;
    const dy = cy + Math.sin(rad) * dist;
    ctx.beginPath();
    ctx.arc(dx, dy, 10, 0, 2 * Math.PI);
    ctx.strokeStyle = isLight(selectedHex) ? '#333' : '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(dx, dy, 7, 0, 2 * Math.PI);
    ctx.fillStyle = selectedHex;
    ctx.fill();
  }, [hsv, selectedHex]);

  useEffect(() => { drawWheel(); }, [drawWheel]);

  const getWheelPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    const r = rect.width / 2 - 2;
    const dist = Math.min(Math.sqrt(x * x + y * y), r);
    const angle = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
    return { h: angle, s: dist / r };
  };

  const handleWheelInteract = useCallback((e) => {
    e.preventDefault();
    const canvas = wheelRef.current;
    if (!canvas) return;
    const { h, s } = getWheelPos(e, canvas);
    const next = { ...hsv, h, s };
    setHsv(next);
    const hex = hsvToHex(next.h, next.s, next.v);
    setInputHex(hex);
    onChange(hex);
  }, [hsv, onChange]);

  const handleBrightnessInteract = useCallback((e) => {
    e.preventDefault();
    const slider = brightnessRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const v = x / rect.width;
    const next = { ...hsv, v };
    setHsv(next);
    const hex = hsvToHex(next.h, next.s, next.v);
    setInputHex(hex);
    onChange(hex);
  }, [hsv, onChange]);

  useEffect(() => {
    const onUp = () => { draggingWheel.current = false; draggingBrightness.current = false; };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => { window.removeEventListener('mouseup', onUp); window.removeEventListener('touchend', onUp); };
  }, []);

  const handleHexInput = (e) => {
    const val = e.target.value;
    setInputHex(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      const newHsv = hexToHsv(val);
      setHsv(newHsv);
      onChange(val);
    }
  };

  const selectPreset = (hex) => {
    const newHsv = hexToHsv(hex);
    setHsv(newHsv);
    setInputHex(hex);
    onChange(hex);
  };

  const displayColor = value && value.startsWith('#') ? value : selectedHex;
  const displayName = PRESET_COLORS.find(p => p.hex.toLowerCase() === displayColor.toLowerCase())?.name || displayColor.toUpperCase();

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full rounded-xl border-2 px-4 py-3 transition-all hover:shadow-md active:scale-95"
        style={{ borderColor: isOpen ? displayColor : '#e5e7eb', backgroundColor: 'white' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 shadow-inner"
          style={{
            backgroundColor: displayColor,
            border: '2px solid rgba(0,0,0,0.1)',
            boxShadow: `0 0 0 3px ${displayColor}40, inset 0 2px 4px rgba(0,0,0,0.1)`
          }}
        />
        <div className="flex-1 text-left">
          <div className="text-xs text-gray-500 font-medium">{label}</div>
          <div className="font-bold text-sm">{displayName}</div>
        </div>
        <div className="text-gray-400 text-xs font-mono">{displayColor.toUpperCase()}</div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Picker Panel */}
      {isOpen && (
        <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
          
          {/* Header */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <span className="font-bold text-sm text-gray-700">{label}</span>
            <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Color Wheel */}
          <div className="flex justify-center px-4 pb-3">
            <div className="relative">
              <canvas
                ref={wheelRef}
                width={240}
                height={240}
                className="rounded-full cursor-crosshair touch-none"
                style={{ display: 'block', touchAction: 'none' }}
                onMouseDown={(e) => { draggingWheel.current = true; handleWheelInteract(e); }}
                onMouseMove={(e) => { if (draggingWheel.current) handleWheelInteract(e); }}
                onTouchStart={(e) => { draggingWheel.current = true; handleWheelInteract(e); }}
                onTouchMove={(e) => { if (draggingWheel.current) handleWheelInteract(e); }}
              />
            </div>
          </div>

          {/* Brightness Slider */}
          <div className="px-4 pb-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">Brightness</div>
            <div
              ref={brightnessRef}
              className="relative h-8 rounded-xl cursor-pointer touch-none"
              style={{
                background: `linear-gradient(to right, #000, ${hsvToHex(hsv.h, hsv.s, 1)})`,
                touchAction: 'none'
              }}
              onMouseDown={(e) => { draggingBrightness.current = true; handleBrightnessInteract(e); }}
              onMouseMove={(e) => { if (draggingBrightness.current) handleBrightnessInteract(e); }}
              onTouchStart={(e) => { draggingBrightness.current = true; handleBrightnessInteract(e); }}
              onTouchMove={(e) => { if (draggingBrightness.current) handleBrightnessInteract(e); }}
            >
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-3 border-white shadow-lg pointer-events-none"
                style={{
                  left: `calc(${hsv.v * 100}% - 14px)`,
                  backgroundColor: selectedHex,
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}
              />
            </div>
          </div>

          {/* Preview + Hex Input */}
          <div className="px-4 pb-4 flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl flex-shrink-0 shadow-md"
              style={{
                backgroundColor: selectedHex,
                border: '2px solid rgba(0,0,0,0.08)',
                boxShadow: `0 4px 12px ${selectedHex}60`
              }}
            />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Hex Code</div>
              <div className="flex items-center gap-2">
                <input
                  value={inputHex}
                  onChange={handleHexInput}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-full focus:outline-none focus:border-gray-400 uppercase"
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-shrink-0 px-4 py-3 rounded-xl text-white text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: selectedHex, color: isLight(selectedHex) ? '#333' : '#fff', minWidth: '60px' }}
            >
              Done
            </button>
          </div>

          {/* Preset swatches */}
          <div className="px-4 pb-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">Quick Picks</div>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map(p => (
                <button
                  key={p.name}
                  title={p.name}
                  onClick={() => selectPreset(p.hex)}
                  className="aspect-square rounded-lg transition-all active:scale-90 hover:scale-110"
                  style={{
                    backgroundColor: p.hex,
                    border: displayColor.toLowerCase() === p.hex.toLowerCase() ? '3px solid #333' : '2px solid rgba(0,0,0,0.1)',
                    boxShadow: displayColor.toLowerCase() === p.hex.toLowerCase() ? `0 0 0 2px ${p.hex}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}