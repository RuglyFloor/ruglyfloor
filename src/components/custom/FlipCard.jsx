import React from 'react';

export default function FlipCard({ frontContent, backContent, height = '300px' }) {
  const [flipped, setFlipped] = React.useState(false);

  return (
    <div
      className={`hiw-flip-card${flipped ? ' hiw-flipped' : ''}`}
      style={{ height }}
      onClick={() => setFlipped(f => !f)}
      onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setFlipped(true); }}
      onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) setFlipped(false); }}
    >
      <div className="hiw-flip-inner">
        <div className="hiw-front">{frontContent}</div>
        <div className="hiw-back">{backContent}</div>
      </div>
    </div>
  );
}