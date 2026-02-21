'use client';

import dynamic from 'next/dynamic';

const AnimatedShaderBackground = dynamic(
  () => import('./animated-shader-background').then((m) => ({ default: m.AnimatedShaderBackground })),
  { 
    ssr: false,
    loading: () => null
  }
);

export const AnimatedShaderWrapper = () => {
  return <AnimatedShaderBackground />;
};
