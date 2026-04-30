import React, { useState, useEffect } from 'react';

const SLIDES = [
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/76f6c7d08_ruglyexamples.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/2fbbf4da3_example.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/18cd45850_a9cf8460d_generated_image.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/70c96ed3e_panam.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/398b0dace_Firefly_GeminiFlash.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/fe747ee77_ChicagoRug.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/dc8b4fbf2_mad.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/5a5f4e667_dog.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/2cc78e2f5_panam.png',
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setFading(true);
      const next = (current + 1) % SLIDES.length;
      setCurrent(next);
      setTimeout(() => {
        setPrev(null);
        setFading(false);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {prev !== null && (
        <div
          key={`prev-${prev}`}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${SLIDES[prev]})` }}
        />
      )}
      <div
        key={`curr-${current}`}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${SLIDES[current]})`,
          transition: 'opacity 0.5s ease-in-out',
          opacity: fading ? 1 : 1,
          animation: 'heroFadeIn 0.5s ease-in-out',
        }}
      />
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}