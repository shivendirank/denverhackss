import HeroFuturistic from '@/components/ui/hero-futuristic-wrapper';
import { ProblemSection } from '@/components/sections/problem-section';
import { SolutionSection } from '@/components/sections/solution-section';
import { ExploreSection } from '@/components/sections/explore-section';

export default function Home() {
  return (
    <main className="bg-black text-white overflow-x-hidden">
      {/* ── Hero ── */}
      <HeroFuturistic />

      {/* ── Problem ── */}
      <ProblemSection />

      {/* ── Solution: TEE / X402 / FHE ── */}
      <SolutionSection />

      {/* ── Explore / Interactive Demo ── */}
      <ExploreSection />
    </main>
  );
}
