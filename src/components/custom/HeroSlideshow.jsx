import React, { useState, useEffect, useRef } from 'react';

// Sequence: video1 → images (fast flash) → video2 → repeat
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

// Phases: 'video1' | 'images' | 'video2'
export default function HeroSlideshow() {
  const [phase, setPhase] = useState('video1');
  const [imgIndex, setImgIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const imgTimerRef = useRef(null);

  // When video1 ends → switch to images
  const handleVideo1End = () => {
    setPhase('images');
    setImgIndex(0);
  };

  // When video2 ends → restart
  const handleVideo2End = () => {
    setPhase('video1');
  };

  // Image flash loop
  useEffect(() => {
    if (phase !== 'images') return;

    imgTimerRef.current = setInterval(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 80);

      setImgIndex(prev => {
        const next = prev + 1;
        if (next >= IMAGE_SLIDES.length) {
          clearInterval(imgTimerRef.current);
          // Small delay then go to video2
          setTimeout(() => setPhase('video2'), 200);
          return prev;
        }
        return next;
      });
    }, 500);

    return () => clearInterval(imgTimerRef.current);
  }, [phase]);

  // Auto-play videos when phase changes
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

      {/* IMAGE FLASH SLIDES */}
      {phase === 'images' && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${IMAGE_SLIDES[imgIndex]})`,
            opacity: flash ? 0.3 : 1,
            transition: flash ? 'opacity 0.05s' : 'opacity 0.15s',
          }}
        />
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