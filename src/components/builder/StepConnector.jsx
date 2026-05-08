import React, { useEffect, useRef, useState } from 'react';

export default function StepConnector({ color, active }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (active) {
      setDrawn(false);
      const t = setTimeout(() => setDrawn(true), 30);
      return () => clearTimeout(t);
    } else {
      setDrawn(false);
    }
  }, [active, color]);

  return (
    <div className="flex justify-center items-center py-1 select-none" aria-hidden>
      <div
        style={{
          width: 4,
          height: drawn ? 48 : 0,
          backgroundColor: color || '#e5e7eb',
          borderRadius: 4,
          transition: 'height 0.45s cubic-bezier(0.4,0,0.2,1)',
          opacity: active ? 1 : 0.2,
        }}
      />
    </div>
  );
}