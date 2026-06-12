import React, { useEffect, useRef, useState } from 'react';

// The main video to scrub through
const SCRUB_VIDEO = 'https://media.base44.com/videos/public/695ded1a209dda33af9a1cf6/60e0551e7_videoadrugly.mp4';

export default function HeroSlideshow() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const isMobile = useRef(false);

  // Detect mobile once on mount
  useEffect(() => {
    isMobile.current = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
      ('ontouchstart' in window && window.innerWidth < 1024);
  }, []);

  const handleMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    // Pause immediately — we drive it manually
    v.pause();
    v.currentTime = 0;
    setIsReady(true);
  };

  // Smooth lerp loop — runs on rAF, eases current toward target
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      if (v.duration) {
        currentProgressRef.current = lerp(
          currentProgressRef.current,
          targetProgressRef.current,
          0.06
        );
        v.currentTime = currentProgressRef.current * v.duration;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Desktop: mouse move → scrub
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isMobile.current) return;
      const progress = e.clientX / window.innerWidth;
      targetProgressRef.current = Math.min(1, Math.max(0, progress));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mobile: scroll → scrub
  useEffect(() => {
    const handleScroll = () => {
      if (!isMobile.current) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      // progress 0 when hero is fully visible, 1 when hero is scrolled past
      const scrolled = -rect.top;
      const total = rect.height + viewH;
      const progress = Math.min(1, Math.max(0, scrolled / total));
      targetProgressRef.current = progress;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      {/* Subtle hint overlay on desktop */}
      {isReady && !isMobile.current && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            fontFamily: 'Barlow Condensed, sans-serif',
            textTransform: 'uppercase',
          }}
        >
          ← Move mouse to explore →
        </div>
      )}

      {/* Scrub video — always paused, driven by rAF */}
      <video
        ref={videoRef}
        src={SCRUB_VIDEO}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={handleMetadata}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.6s ease' }}
      />

      {/* Dark fallback while loading */}
      {!isReady && (
        <div className="absolute inset-0 bg-gray-900" />
      )}
    </div>
  );
}