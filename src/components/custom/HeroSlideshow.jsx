import React, { useEffect, useRef, useState } from 'react';

// Each video: src + how many seconds to show before crossfading to the next
const CLIPS = [
  { src: 'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/e1692a956_CockRug.mp4', duration: 4 },
  { src: 'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/01602df31_FireflyThefirstfewvideosyoumadeintermsofdirectionandanglesstartingtwofeetfromthebo.mp4', duration: 4 },
  { src: 'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/62467a756_FireflyCreateabackgroundvideoforawebsitethatallowspeopletopaintwhateverdesigntheywan.mp4', duration: 4 },
];

export default function HeroSlideshow() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fadingIdx, setFadingIdx] = useState(null);
  const videoRefs = useRef(CLIPS.map(() => React.createRef()));
  const timerRef = useRef(null);

  // Play the active video, pause others
  useEffect(() => {
    CLIPS.forEach((_, i) => {
      const v = videoRefs.current[i]?.current;
      if (!v) return;
      if (i === activeIdx) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });

    // Schedule next clip
    timerRef.current = setTimeout(() => {
      const nextIdx = (activeIdx + 1) % CLIPS.length;
      setFadingIdx(activeIdx);
      setActiveIdx(nextIdx);
      // Clear fading after transition
      setTimeout(() => setFadingIdx(null), 700);
    }, CLIPS[activeIdx].duration * 1000);

    return () => clearTimeout(timerRef.current);
  }, [activeIdx]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gray-900">
      {CLIPS.map((clip, i) => (
        <video
          key={clip.src}
          ref={videoRefs.current[i]}
          src={clip.src}
          muted
          playsInline
          preload={i === 0 ? 'auto' : 'metadata'}
          loop={false}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === activeIdx ? 1 : i === fadingIdx ? 0 : 0,
            transition: i === activeIdx ? 'opacity 0.7s ease-in-out' : i === fadingIdx ? 'opacity 0.7s ease-in-out' : 'none',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}