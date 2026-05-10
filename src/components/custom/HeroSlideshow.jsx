import React, { useState, useEffect, useRef } from 'react';

const VIDEO_1 = 'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/60e0551e7_videoadrugly.mp4';
const VIDEO_2 = 'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/b782ef8fe_cam1.mp4';

const IMAGE_SLIDES = [
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/841dec147_sample.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/f5d0c9c07_ChicagoRug.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/dafbd06eb_facebook-55b21f8e-e03e-4332-a760-c1559ddb9c4e.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/76f6c7d08_ruglyexamples.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/2fbbf4da3_example.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/18cd45850_a9cf8460d_generated_image.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/70c96ed3e_panam.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/398b0dace_Firefly_GeminiFlash.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/fe747ee77_ChicagoRug.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/dc8b4fbf2_mad.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/5a5f4e667_dog.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/2cc78e2f5_panam.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/9e314cac0_generated_image.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/f7780a1d5_Firefly_mergetherugdesignsontothenewimagesimilardesignsthatmatchthesurroundings985409.png',
  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/0b83ca218_29fe852dc_generated_image.png',
];

const N = IMAGE_SLIDES.length;
// Each slide: 2.5s visible + 1s fade = 3.5s per slide
const VISIBLE = 2.5;  // seconds fully opaque
const FADE = 1.0;     // seconds fade in/out
const PER_SLIDE = VISIBLE + FADE;
const TOTAL = N * PER_SLIDE;

// Build one keyframe string per slide:
// 0% invisible → fade in → hold → fade out → 0% invisible for the rest
function buildKeyframes() {
  return IMAGE_SLIDES.map((_, i) => {
    const start = (i * PER_SLIDE) / TOTAL * 100;
    const fadeInEnd = (i * PER_SLIDE + FADE) / TOTAL * 100;
    const fadeOutStart = ((i + 1) * PER_SLIDE - FADE) / TOTAL * 100;
    const end = ((i + 1) * PER_SLIDE) / TOTAL * 100;
    const name = `heroSlide${i}`;
    return `
      @keyframes ${name} {
        0%              { opacity: 0; transform: scale(1); }
        ${start.toFixed(2)}%    { opacity: 0; transform: scale(1); }
        ${fadeInEnd.toFixed(2)}% { opacity: 1; transform: scale(1.03); }
        ${fadeOutStart.toFixed(2)}% { opacity: 1; transform: scale(1.06); }
        ${end.toFixed(2)}%  { opacity: 0; transform: scale(1.08); }
        100%            { opacity: 0; transform: scale(1.08); }
      }
    `;
  }).join('\n');
}

export default function HeroSlideshow() {
  const [phase, setPhase] = useState('video1');
  const [animKey, setAnimKey] = useState(0);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const endTimerRef = useRef(null);

  const handleVideo1End = () => setPhase('images');
  const handleVideo2End = () => setPhase('video1');

  useEffect(() => {
    if (phase === 'video1' && video1Ref.current) {
      video1Ref.current.currentTime = 0;
      video1Ref.current.play().catch(() => {});
    }
    if (phase === 'video2' && video2Ref.current) {
      video2Ref.current.currentTime = 0;
      video2Ref.current.play().catch(() => {});
    }
    if (phase === 'images') {
      setAnimKey(k => k + 1);
      // After all images finish, transition to video2
      endTimerRef.current = setTimeout(() => {
        setPhase('video2');
      }, TOTAL * 1000);
    }
    return () => clearTimeout(endTimerRef.current);
  }, [phase]);

  const css = buildKeyframes();

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <style>{css}</style>

      {/* VIDEO 1 */}
      <video
        ref={video1Ref}
        src={VIDEO_1}
        muted
        playsInline
        onEnded={handleVideo1End}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: phase === 'video1' ? 'block' : 'none' }}
      />

      {/* ALL IMAGES — each running its own precisely-timed keyframe */}
      {phase === 'images' && IMAGE_SLIDES.map((src, i) => (
        <div
          key={`${animKey}-${i}`}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0,
            willChange: 'opacity, transform',
            animation: `heroSlide${i} ${TOTAL}s linear 1 forwards`,
          }}
        />
      ))}

      {/* VIDEO 2 */}
      <video
        ref={video2Ref}
        src={VIDEO_2}
        muted
        playsInline
        onEnded={handleVideo2End}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: phase === 'video2' ? 'block' : 'none' }}
      />
    </div>
  );
}