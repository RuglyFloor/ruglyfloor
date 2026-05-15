import React, { useEffect, useState } from 'react';

export default function StepConnector({ color, active }) {
  const [drawn, setDrawn] = useState(false);
  const [pulse, setPulse] = useState(false);
  const activeColor = color || '#4075ff';

  useEffect(() => {
    if (active) {
      setDrawn(false);
      const t1 = setTimeout(() => setDrawn(true), 30);
      const t2 = setTimeout(() => setPulse(true), 500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setDrawn(false);
      setPulse(false);
    }
  }, [active, color]);

  return (
    <div className="flex justify-center items-center py-2 select-none" aria-hidden>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative' }}>
        {/* Animated line */}
        <div style={{
          width: 3,
          height: drawn ? 32 : 0,
          background: active
            ? `linear-gradient(to bottom, ${activeColor}88, ${activeColor})`
            : '#e5e7eb',
          borderRadius: '3px 3px 0 0',
          transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1)',
          opacity: active ? 1 : 0.2,
        }} />

        {/* Arrow head */}
        <div style={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `10px solid ${active ? activeColor : '#e5e7eb'}`,
          opacity: active ? 1 : 0.2,
          transition: 'border-top-color 0.3s ease, opacity 0.3s ease',
          transform: drawn ? 'scale(1)' : 'scale(0)',
          transitionProperty: 'transform, border-top-color, opacity',
          transitionDuration: '0.35s',
          transitionDelay: drawn ? '0.35s' : '0s',
        }} />

        {/* Glow pulse ring when active */}
        {active && pulse && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `2px solid ${activeColor}`,
            animation: 'stepPulse 1.4s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      <style>{`
        @keyframes stepPulse {
          0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}