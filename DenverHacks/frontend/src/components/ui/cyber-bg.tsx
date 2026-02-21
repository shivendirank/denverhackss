'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-page red matrix code rain — sits fixed behind all content.
 * Uses mix-blend-mode:screen so the black canvas background becomes
 * transparent; only the red glyphs bleed through section backgrounds.
 */

const CHARS =
  '01アイウエオ<>{}[]//\\\\;:#ABCDEF010101##$$⟨⟩→←⊕⊗∇∂∑∏‖|01nullundefined0x0x';

export const CyberBg = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const FONTSIZE = 24;  // larger font = fewer total columns
    let drops: number[] = [];
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.floor(canvas.width / FONTSIZE);
      // activate only ~30% of columns for subtle sparse effect
      drops = Array.from({ length: cols }, () =>
        Math.random() > 0.7 ? Math.random() * -80 : -9999
      );
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      // Semi-transparent black fill creates the fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.052)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONTSIZE}px "Courier New", monospace`;

      drops.forEach((y, i) => {
        if (y === -9999) return; // inactive column
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const px = i * FONTSIZE;
        const py = y * FONTSIZE;

        // Bright head glyph
        ctx.fillStyle = 'rgba(255, 182, 217, 0.85)';
        ctx.fillText(char, px, py);

        // Reset column when it falls off screen
        if (py > canvas.height && Math.random() > 0.97) {
          drops[i] = 0;
        }

        drops[i] += 0.32;
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 5,              // above backgrounds, behind text content
        mixBlendMode: 'screen', // black canvas = transparent, red glyphs bleed through
        opacity: 0.58,          // slightly dimmed for subtlety
      }}
      aria-hidden
    />
  );
};
