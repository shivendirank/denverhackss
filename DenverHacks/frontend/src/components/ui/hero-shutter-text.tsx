"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroShutterTextProps {
  text?: string;
  className?: string;
  inline?: boolean;
}

export default function HeroShutterText({
  text = "IMMERSE",
  className = "",
  inline = false,
}: HeroShutterTextProps) {
  const [count, setCount] = useState(0);
  const characters = text.split("");

  if (inline) {
    // Inline variant for use within text
    return (
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          className={cn("inline-flex", className)}
        >
          {characters.map((char, i) => (
            <span
              key={i}
              className="relative inline-block overflow-hidden"
            >
              {/* Main Character */}
              <motion.span
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: i * 0.04 + 0.3, duration: 0.8 }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>

              {/* Top Slice Layer */}
              <motion.span
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: "100%", opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.04,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 text-red-500 z-10 pointer-events-none"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)" }}
              >
                {char}
              </motion.span>

              {/* Middle Slice Layer */}
              <motion.span
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: "-100%", opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.04 + 0.1,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 text-red-400 z-10 pointer-events-none"
                style={{
                  clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
                }}
              >
                {char}
              </motion.span>

              {/* Bottom Slice Layer */}
              <motion.span
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: "100%", opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.04 + 0.2,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 text-orange-500 z-10 pointer-events-none"
                style={{
                  clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
                }}
              >
                {char}
              </motion.span>
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    );
  }

  // Full-page variant
  return (
    <div
      className={cn(
        `relative flex flex-col items-center justify-center h-full w-full 
        bg-white dark:bg-zinc-950 transition-colors duration-700`,
        className
      )}
    >
      {/* Immersive Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)`,
          backgroundSize: "clamp(20px, 5vw, 60px) clamp(20px, 5vw, 60px)",
        }}
      />

      {/* Main Text Container */}
      <div className="relative z-10 w-full px-4 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            className="flex flex-wrap justify-center items-center w-full"
          >
            {characters.map((char, i) => (
              <div
                key={i}
                className="relative px-[0.1vw] overflow-hidden group"
              >
                {/* Main Character - Responsive sizing using vw */}
                <motion.span
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ delay: i * 0.04 + 0.3, duration: 0.8 }}
                  className="text-[15vw] leading-none font-black text-zinc-900 dark:text-white tracking-tighter"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>

                {/* Top Slice Layer */}
                <motion.span
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: "100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.04,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 text-[15vw] leading-none font-black text-indigo-600 dark:text-emerald-400 z-10 pointer-events-none"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)" }}
                >
                  {char}
                </motion.span>

                {/* Middle Slice Layer */}
                <motion.span
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: "-100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.04 + 0.1,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 text-[15vw] leading-none font-black text-zinc-800 dark:text-zinc-200 z-10 pointer-events-none"
                  style={{
                    clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
                  }}
                >
                  {char}
                </motion.span>

                {/* Bottom Slice Layer */}
                <motion.span
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: "100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.04 + 0.2,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 text-[15vw] leading-none font-black text-indigo-600 dark:text-emerald-400 z-10 pointer-events-none"
                  style={{
                    clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
                  }}
                >
                  {char}
                </motion.span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-8 left-8 border-l border-t border-zinc-200 dark:border-zinc-800 w-12 h-12" />
      <div className="absolute bottom-8 right-8 border-r border-b border-zinc-200 dark:border-zinc-800 w-12 h-12" />
    </div>
  );
}

export { HeroShutterText };
