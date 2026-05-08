import React, { useEffect, useRef, useState } from 'react';

export default function BuilderStep({ children, visible, color, scrollOnAppear }) {
  const [shown, setShown] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (visible) {
      // Small delay so the connector line draws first
      const t = setTimeout(() => {
        setShown(true);
        if (scrollOnAppear && ref.current) {
          setTimeout(() => {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 120);
        }
      }, 200);
      return () => clearTimeout(t);
    } else {
      setShown(false);
    }
  }, [visible]);

  if (!visible && !shown) return null;

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: shown ? 'auto' : 'none',
      }}
    >
      {/* Step accent bar */}
      <div
        style={{
          width: shown ? 40 : 0,
          height: 4,
          backgroundColor: color || '#e5e7eb',
          borderRadius: 2,
          marginBottom: 12,
          transition: 'width 0.35s 0.15s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
      {children}
    </div>
  );
}