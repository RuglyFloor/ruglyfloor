import React from 'react';

const SIZES = [
  { label: '3×5', value: '3x5', sqft: 15, price: 149, note: 'Entryway / Accent' },
  { label: '5×7', value: '5x7', sqft: 35, price: 299, note: 'Bedroom / Office' },
  { label: '8×10', value: '8x10', sqft: 80, price: 549, note: 'Living Room' },
  { label: 'Custom', value: 'custom', sqft: null, price: null, note: 'Get a Quote' },
];

export default function VisualizerSizeSelector({ selected, onSelect, darkMode, surface, text, muted, accent }) {
  return (
    <div style={{ background: surface, borderRadius: 16, padding: 24, border: `1px solid ${darkMode ? '#2a2a2a' : '#e0e0e0'}` }}>
      <div style={{ color: muted, fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: 14 }}>SELECT SIZE & ESTIMATE</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {SIZES.map(s => {
          const active = selected === s.value;
          return (
            <button
              key={s.value}
              onClick={() => onSelect(s.value, s.price)}
              style={{
                border: `2px solid ${active ? accent : darkMode ? '#333' : '#ddd'}`,
                background: active ? `rgba(240,70,36,0.1)` : 'transparent',
                borderRadius: 10, padding: '12px 10px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', color: text
              }}
            >
              <div style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.04em', fontFamily: 'Barlow Condensed, sans-serif', color: active ? accent : text }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: muted, marginTop: 2, fontFamily: 'Roboto, sans-serif' }}>{s.note}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 6, color: active ? accent : text, fontFamily: 'Barlow Condensed, sans-serif' }}>
                {s.price ? `~$${s.price}` : 'Contact for quote'}
              </div>
            </button>
          );
        })}
      </div>
      <p style={{ color: muted, fontSize: '0.72rem', marginTop: 12, fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
        * Estimates are starting prices. Final quote depends on complexity and detail level.
      </p>
    </div>
  );
}