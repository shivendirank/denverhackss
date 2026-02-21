'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export const GlitchText = ({ text, className = '' }: GlitchTextProps) => {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      {glitchActive && (
        <>
          <motion.span
            className="absolute inset-0 text-red-500"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [-2, 2, -2, 2, 0], opacity: [0.7, 0.9, 0.7, 0.9, 0] }}
            transition={{ duration: 0.15, times: [0, 0.25, 0.5, 0.75, 1] }}
          >
            {text}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-cyan-400"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [2, -2, 2, -2, 0], opacity: [0.7, 0.9, 0.7, 0.9, 0] }}
            transition={{ duration: 0.15, times: [0, 0.25, 0.5, 0.75, 1] }}
          >
            {text}
          </motion.span>
        </>
      )}
    </span>
  );
};
