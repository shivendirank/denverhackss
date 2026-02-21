'use client';

import { useEffect, useState } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const ScrambleText = ({ text, className = '', delay = 0 }: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let currentIndex = 0;
    const targetText = text;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex >= targetText.length) {
          setIsComplete(true);
          clearInterval(interval);
          return;
        }

        const scrambledPart = targetText
          .slice(currentIndex + 1)
          .split('')
          .map(() => chars[Math.floor(Math.random() * chars.length)])
          .join('');

        setDisplayText(targetText.slice(0, currentIndex + 1) + scrambledPart);
        currentIndex++;
      }, 30);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className={className}>
      {isComplete ? text : displayText}
    </span>
  );
};
