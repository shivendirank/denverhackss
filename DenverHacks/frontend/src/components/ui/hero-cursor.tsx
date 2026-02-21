'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Red glowing custom cursor — active only inside the hero section.
 * Shows a precise dot + a lagging outer ring + a burst when clicking.
 */
export const HeroCursor = ({ heroRef }: { heroRef: React.RefObject<HTMLDivElement | null> }) => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let ringX = 0, ringY = 0;
    let dotX = 0, dotY = 0;
    let raf = 0;

    const moveDot = (x: number, y: number) => {
      dotX = x;
      dotY = y;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animateRing = () => {
      ringX = lerp(ringX, dotX, 0.10);
      ringY = lerp(ringY, dotY, 0.10);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animateRing);
    };
    raf = requestAnimationFrame(animateRing);

    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      moveDot(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseenter', onEnter);
    hero.addEventListener('mouseleave', onLeave);
    hero.addEventListener('mousedown', onDown);
    hero.addEventListener('mouseup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseenter', onEnter);
      hero.removeEventListener('mouseleave', onLeave);
      hero.removeEventListener('mousedown', onDown);
      hero.removeEventListener('mouseup', onUp);
    };
  }, [heroRef]);

  return (
    <>
      {/* Inner dot — precise */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-[200] transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div
          className="rounded-full transition-all duration-150"
          style={{
            width: clicking ? 10 : 8,
            height: clicking ? 10 : 8,
            background: '#FFB6D9',
            boxShadow: clicking
              ? '0 0 20px 8px rgba(255,182,217,0.8), 0 0 40px 16px rgba(255,182,217,0.4)'
              : '0 0 12px 4px rgba(255,182,217,0.7), 0 0 24px 8px rgba(255,182,217,0.3)',
          }}
        />
      </div>

      {/* Outer ring — lagging */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-[199] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div
          className="rounded-full border transition-all duration-200"
          style={{
            width: clicking ? 48 : 36,
            height: clicking ? 48 : 36,
            borderColor: clicking ? 'rgba(255,192,224,0.9)' : 'rgba(255,182,217,0.55)',
            boxShadow: clicking
              ? '0 0 24px 8px rgba(255,182,217,0.4), inset 0 0 12px rgba(255,182,217,0.1)'
              : '0 0 12px 4px rgba(255,182,217,0.2)',
            background: clicking ? 'rgba(255,182,217,0.06)' : 'transparent',
          }}
        />
      </div>
    </>
  );
};
