"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Shield, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["secure", "verifiable", "trustless", "private", "sovereign"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full relative py-10">
      <div className="container mx-auto px-6">
        <div className="flex gap-10 py-16 lg:py-24 items-center justify-center flex-col">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative"
          >
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-3 bg-red-950/50 border-2 border-red-500/30 text-red-300 hover:bg-red-900/60 hover:text-red-200 hover:border-red-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-red-500/20"
            >
              <Shield className="w-4 h-4 animate-pulse" />
              <span className="font-bold tracking-wide">The Solution</span>
              <div className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
            </Button>
            <div className="absolute inset-0 blur-xl bg-red-500/20 -z-10" />
          </motion.div>

          {/* Animated Heading */}
          <div className="flex gap-6 flex-col">
            <motion.h1
              className="text-5xl md:text-8xl max-w-5xl tracking-tighter text-center font-black leading-[0.95]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.span 
                className="text-white block mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Sovereign Execution
              </motion.span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-2">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-500 to-amber-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-2xl leading-relaxed tracking-tight text-white/70 max-w-3xl text-center font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Hardware-enforced <span className="text-red-400 font-semibold">TEEs</span>, 
              autonomous <span className="text-orange-400 font-semibold">X402 payments</span>, 
              and fully homomorphic <span className="text-amber-400 font-semibold">encryption</span>.
              <br />
              <span className="text-white/90 font-medium">
                Your agents execute with cryptographic guarantees — no trust required.
              </span>
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-row gap-4 flex-wrap justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Link href="/tee">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg shadow-red-500/30 border border-red-400/20 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <Zap className="w-5 h-5" />
                  <span className="relative">Start Building</span>
                  <MoveRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="gap-3 border-2 border-red-500/40 text-red-300 hover:bg-red-950/60 hover:text-red-200 hover:border-red-400/60 font-bold backdrop-blur-sm transition-all duration-300"
              >
                <Lock className="w-5 h-5" />
                View Documentation
                <MoveRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats Row with Enhanced Effects */}
          <motion.div
            className="flex gap-10 md:gap-16 flex-wrap justify-center mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            {[
              { label: "Uptime", value: "99.9%", color: "from-red-500 to-red-600" },
              { label: "Verified Executions", value: "2.1M+", color: "from-orange-500 to-orange-600" },
              { label: "Gas Optimized", value: "<0.01Ξ", color: "from-amber-500 to-amber-600" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-2 group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
              >
                <div className="relative">
                  <div className={`text-3xl md:text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]`}>
                    {stat.value}
                  </div>
                  <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300 -z-10" />
                </div>
                <div className="text-xs text-white/50 uppercase tracking-widest font-mono font-bold group-hover:text-white/70 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Background Glow Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(234,88,12,0.08) 40%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

export { AnimatedHero };
