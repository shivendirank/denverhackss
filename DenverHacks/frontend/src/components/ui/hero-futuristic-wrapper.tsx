'use client';

import dynamic from 'next/dynamic';

const HeroFuturistic = dynamic(
  () =>
    import('@/components/ui/hero-futuristic').then((m) => m.HeroFuturistic),
  {
    ssr: false,
    loading: () => (
      <div className="h-svh bg-black flex items-center justify-center">
        <span className="text-white/30 text-sm tracking-widest uppercase animate-pulse">
          Loading…
        </span>
      </div>
    ),
  }
);

export default HeroFuturistic;
