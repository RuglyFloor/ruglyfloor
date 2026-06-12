import React, { useEffect, useRef, useState } from 'react';

const VIDEOS = [
  'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/01602df31_FireflyThefirstfewvideosyoumadeintermsofdirectionandanglesstartingtwofeetfromthebo.mp4',
  'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/e1692a956_CockRug.mp4',
  'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/62467a756_FireflyCreateabackgroundvideoforawebsitethatallowspeopletopaintwhateverdesigntheywan.mp4',
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const refs = useRef(VIDEOS.map(() => React.createRef()));

  const playNext = () => setCurrent(prev => (prev + 1) % VIDEOS.length);

  useEffect(() => {
    VIDEOS.forEach((_, i) => {
      const v = refs.current[i]?.current;
      if (!v) return;
      if (i === current) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [current]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gray-900">
      {VIDEOS.map((src, i) => (
        <video
          key={src}
          ref={refs.current[i]}
          src={src}
          muted
          playsInline
          preload={i === 0 ? 'auto' : 'none'}
          onEnded={playNext}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: 'none' }}
        />
      ))}
    </div>
  );
}