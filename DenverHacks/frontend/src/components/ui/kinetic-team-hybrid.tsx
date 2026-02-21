'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { ArrowUpRight, Plus } from 'lucide-react';
import Image from 'next/image';
import { AGENTS, type Agent } from '@/lib/agents';

const TEAM = AGENTS;

/* ---------- Main Component ---------- */

export default function KineticTeamHybrid() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAgentClick = (id: string) => {
    router.push(`/demo/agent/${id}`);
  };

  // Mouse position resources (Global for the floating card)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth physics for the floating card
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Detect mobile for conditional rendering logic
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    // Offset the cursor card so it doesn't block the text
    mouseX.set(e.clientX + 20); 
    mouseY.set(e.clientY + 20);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full cursor-default bg-[#020202] px-6 py-24 text-neutral-200 md:px-12 selection:bg-red-500 selection:text-white"
    >
      {/* Background Ambience - Red themed */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.08),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      
      {/* Red glow effects */}
      <div className="pointer-events-none absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/3 w-80 h-80 bg-red-600/5 rounded-full blur-3xl" />

      <div className="mx-auto max-w-6xl">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <h1 className="text-4xl font-light tracking-tighter text-white sm:text-6xl md:text-8xl">
              AI <span className="text-red-500/70">Recruits</span>
            </h1>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-red-900/50 via-red-500/20 to-red-900/50 mx-8 hidden md:block" />
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-red-400/60">
            Security Features
          </p>
        </motion.header>

        {/* The List */}
        <div className="flex flex-col">
          {TEAM.map((member, index) => (
            <TeamRow
              key={member.id}
              data={member}
              index={index}
              isActive={activeId === member.id}
              setActiveId={setActiveId}
              isMobile={isMobile}
              isAnyActive={activeId !== null}
              onSelectAgent={handleAgentClick}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP ONLY: Global Floating Cursor Image */}
      {/* We use Portal-like fixed positioning to ensure it floats above everything smoothly */}
      {!isMobile && (
        <motion.div
          style={{ x: cursorX, y: cursorY }}
          className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
        >
          <AnimatePresence mode="wait">
            {activeId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative h-64 w-80 overflow-hidden rounded-xl border border-red-500/30 bg-black shadow-2xl shadow-red-500/20"
              >
                {/* Active team member image */}
                <Image
                  src={TEAM.find((t) => t.id === activeId)?.image || '/placeholder.png'}
                  alt="Preview"
                  fill
                  className="h-full w-full object-cover"
                />
                
                {/* Overlay Metadata */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-red-950/90 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-[10px] uppercase tracking-widest text-white/80">Active</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Row Component ---------- */

function TeamRow({
  data,
  index,
  isActive,
  setActiveId,
  isMobile,
  isAnyActive,
  onSelectAgent,
}: {
  data: Agent;
  index: number;
  isActive: boolean;
  setActiveId: (id: string | null) => void;
  isMobile: boolean;
  isAnyActive: boolean;
  onSelectAgent: (id: string) => void;
}) {
  const isDimmed = isAnyActive && !isActive;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDimmed ? 0.3 : 1, 
        y: 0,
        backgroundColor: isActive && isMobile ? 'rgba(255,255,255,0.03)' : 'transparent'
      }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => !isMobile && setActiveId(data.id)}
      onMouseLeave={() => !isMobile && setActiveId(null)}
      onClick={() => onSelectAgent(data.id)}
      className="group relative border-t border-red-950/30 hover:border-red-500/30 transition-all duration-500 last:border-b cursor-pointer hover:bg-red-950/10"
    >
      {/* Red glow on hover */}
      <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-all duration-500 rounded-xl opacity-0 group-hover:opacity-100" />
      
      <div className="relative z-10 flex flex-col py-8 md:flex-row md:items-center md:justify-between md:py-12">
        
        {/* Name & Index Section */}
        <div className="flex items-baseline gap-6 md:gap-12 pl-4 md:pl-0 transition-transform duration-500 group-hover:translate-x-4">
          <span className="font-mono text-xs text-red-600/60 group-hover:text-red-500">
            0{index + 1}
          </span>
          <h2 className="text-3xl font-medium tracking-tight text-neutral-400 transition-colors duration-300 group-hover:text-white md:text-6xl">
            {data.name}
          </h2>
        </div>

        {/* Role & Icon Section */}
        <div className="mt-4 flex items-center justify-between pl-12 pr-4 md:mt-0 md:justify-end md:gap-12 md:pl-0 md:pr-0">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-red-600/50 transition-colors group-hover:text-red-400/80">
            {data.role}
          </span>
          
          {/* Mobile: hint to tap */}
          <div className="block md:hidden text-red-500/60 group-hover:text-red-400">
            <Plus size={18} />
          </div>

          {/* Desktop Arrow */}
          <motion.div
             animate={{ x: isActive ? 0 : -10, opacity: isActive ? 1 : 0 }}
             className="hidden md:block text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
          >
             <ArrowUpRight size={28} strokeWidth={1.5} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
