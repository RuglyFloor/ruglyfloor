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

// Each image shows for this long before cross-dissolving to next
const SLIDE_DURATION = 1800;  // ms visible
const MORPH_DURATION = 900;   // ms cross-dissolve overlap

export default function HeroSlideshow() {
  const [phase, setPhase] = useState('video1');
  const [imgIndex, setImgIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [morphing, setMorphing] = useState(false);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const timerRef = useRef(null);

  const handleVideo1End = () => {
    setPhase('images');
    setImgIndex(0);
    setNextIndex(1);
    setMorphing(false);
  };

  const handleVideo2End = () => {
    setPhase('video1');
  };

  // Image morph loop
  useEffect(() => {
    if (phase !== 'images') return;

    timerRef.current = setTimeout(function tick() {
      // Start morph (cross-dissolve next image in)
      setMorphing(true);

      setTimeout(() => {
        setImgIndex(prev => {
          const next = prev + 1;
          if (next >= IMAGE_SLIDES.length) {
            setMorphing(false);
            setTimeout(() => setPhase('video2'), 300);
            return prev;
          }
          setNextIndex(next + 1 < IMAGE_SLIDES.length ? next + 1 : next);
          setMorphing(false);
          return next;
        });

        timerRef.current = setTimeout(tick, SLIDE_DURATION);
      }, MORPH_DURATION);
    }, SLIDE_DURATION);

    return () => clearTimeout(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase === 'video1' && video1Ref.current) {
      video1Ref.current.currentTime = 0;
      video1Ref.current.play().catch(() => {});
    }
    if (phase === 'video2' && video2Ref.current) {
      video2Ref.current.currentTime = 0;
      video2Ref.current.play().catch(() => {});
    }
  }, [phase]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1)    translate(0%, 0%); }
          50%  { transform: scale(1.06) translate(-1%, -1%); }
          100% { transform: scale(1)    translate(0%, 0%); }
        }
        .hero-img {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          animation: kenBurns ${(SLIDE_DURATION + MORPH_DURATION) / 1000}s ease-in-out infinite;
        }
      `}</style>

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

      {/* IMAGE CROSS-DISSOLVE SLIDES */}
      {phase === 'images' && (
        <>
          {/* Current image */}
          <div
            key={`img-${imgIndex}`}
            className="hero-img"
            style={{
              backgroundImage: `url(${IMAGE_SLIDES[imgIndex]})`,
              opacity: morphing ? 0 : 1,
              transition: `opacity ${MORPH_DURATION}ms ease-in-out`,
            }}
          />
          {/* Next image dissolving in */}
          {morphing && nextIndex < IMAGE_SLIDES.length && (
            <div
              key={`next-${nextIndex}`}
              className="hero-img"
              style={{
                backgroundImage: `url(${IMAGE_SLIDES[nextIndex]})`,
                opacity: morphing ? 1 : 0,
                transition: `opacity ${MORPH_DURATION}ms ease-in-out`,
              }}
            />
          )}
        </>
      )}

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