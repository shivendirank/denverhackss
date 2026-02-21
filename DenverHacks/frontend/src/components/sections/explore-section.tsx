"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import TextBlockAnimation from "@/components/ui/text-block-animation";
import { AnimatedFolder } from "@/components/ui/3d-folder";

export const ExploreSection = () => {
  const router = useRouter();

  const handleFileClick = (destination: string) => {
    // Check if it's an external URL (http/https)
    if (destination.startsWith('http://') || destination.startsWith('https://')) {
      window.open(destination, '_blank', 'noopener,noreferrer');
    } else {
      router.push(destination);
    }
  };

  const teeFiles = [
    {
      id: "1",
      label: "TEE Attestation",
      type: "2D" as const,
      destination: "/demo",
    },
    {
      id: "2",
      label: "Trust Visualization",
      type: "3D" as const,
      destination: "/3d",
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden bg-black pt-40">
      <ContainerScroll
        titleComponent={
          <div className="space-y-6 mb-20">
            <TextBlockAnimation
              blockColor="#FFB6D9"
              animateOnScroll={true}
              delay={0.2}
              duration={0.7}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">Trust Components</span>
              </h1>
            </TextBlockAnimation>
            <motion.p
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Dive deep into the core technologies powering the decentralized trust infrastructure.
            </motion.p>
          </div>
        }
      >
        {/* Laptop Screen Content */}
        <div className="relative h-full w-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900 rounded-lg overflow-hidden">
          {/* Desktop UI */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            {/* Single 3D Folder */}
            <AnimatedFolder
              title="TEE"
              files={teeFiles}
              onFileClick={handleFileClick}
            />

            {/* Additional UI Elements - Make it look like a desktop */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-white/40 text-xs font-mono">
                ~/trust-layer/tee
              </div>
            </div>

            {/* Grid pattern background */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Scan line effect */}
          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent pointer-events-none"
            animate={{
              top: ['0%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Corner glow effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </ContainerScroll>
    </div>
  );
};
