import React, { useEffect, useRef, useState } from 'react';

const VIDEOS = [
  'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/01602df31_FireflyThefirstfewvideosyoumadeintermsofdirectionandanglesstartingtwofeetfromthebo.mp4',
  'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/e1692a956_CockRug.mp4',
  'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/62467a756_FireflyCreateabackgroundvideoforawebsitethatallowspeopletopaintwhateverdesigntheywan.mp4',
];

// start/end in seconds for each clip (null = use full duration)
const CLIP_RANGES = [
  { start: 0, end: 4 },      // PanAm rug: first ~4 seconds
  { start: 1, end: null },   // Rooster rug: skip first 1 second
  { start: 0, end: null },   // Last clip: full
];

export default function HeroSlideshow() {
  const videoRefs = useRef(VIDEOS.map(() => React.createRef()));
  const durationsRef = useRef([]);
  const targetRef = useRef(0);   // 0–1 global progress
  const currentRef = useRef(0);  // lerped value
  const rafRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  const [ready, setReady] = useState(false);

  // Count how many videos have loaded metadata
  const loadedCount = useRef(0);

  const onMetadata = (i) => {
    const v = videoRefs.current[i]?.current;
    if (!v) return;
    const range = CLIP_RANGES[i];
    const clipStart = range?.start ?? 0;
    const clipEnd = range?.end ?? v.duration;
    durationsRef.current[i] = Math.max(0.1, Math.min(clipEnd, v.duration) - clipStart);
    v.pause();
    v.currentTime = clipStart;
    loadedCount.current += 1;
    if (loadedCount.current === VIDEOS.length) setReady(true);
  };

  // rAF scrub loop
  useEffect(() => {
    if (!ready) return;

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      currentRef.current = lerp(currentRef.current, targetRef.current, 0.18);
      const progress = currentRef.current;

      const durations = durationsRef.current;
      const total = durations.reduce((s, d) => s + d, 0);
      if (!total) { rafRef.current = requestAnimationFrame(tick); return; }

      // Which segment are we in?
      let elapsed = progress * total;
      let segIdx = 0;
      let segProgress = 0;
      for (let i = 0; i < durations.length; i++) {
        if (elapsed <= durations[i]) {
          segIdx = i;
          segProgress = elapsed / durations[i];
          break;
        }
        elapsed -= durations[i];
        segIdx = i; // fallback to last
        segProgress = 1;
      }

      // Update active video
      if (segIdx !== activeIdxRef.current) {
        activeIdxRef.current = segIdx;
        setActiveIdx(segIdx);
      }

      // Scrub active video — only seek if change is significant to reduce glitching
      const v = videoRefs.current[segIdx]?.current;
      if (v && v.duration) {
        const range = CLIP_RANGES[segIdx];
        const clipStart = range?.start ?? 0;
        const target = clipStart + segProgress * durationsRef.current[segIdx];
        if (Math.abs(v.currentTime - target) > 0.05) {
          v.currentTime = target;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  // Desktop: mouse X → progress
  useEffect(() => {
    const onMove = (e) => {
      targetRef.current = e.clientX / window.innerWidth;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Mobile: scroll → progress
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = window.innerHeight; // scrubs over first viewport height of scroll
      targetRef.current = Math.min(1, Math.max(0, scrolled / maxScroll));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gray-900">
      {VIDEOS.map((src, i) => (
        <video
          key={src}
          ref={videoRefs.current[i]}
          src={src}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={() => onMetadata(i)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: i === activeIdx ? 1 : 0, pointerEvents: 'none' }}
        />
      ))}
      {!ready && <div className="absolute inset-0 bg-gray-900" />}
    </div>
  );
}