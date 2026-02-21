'use client';

import dynamic from 'next/dynamic';

const CyberBg = dynamic(
  () => import('./cyber-bg').then((m) => m.CyberBg),
  { ssr: false, loading: () => null }
);

export const CyberBgWrapper = () => <CyberBg />;
