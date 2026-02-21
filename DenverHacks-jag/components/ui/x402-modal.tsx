'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';

type AnimationStage = 'instructions' | '404' | 'glitch' | '402' | 'demo';

interface X402ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function X402Modal({ isOpen, onClose }: X402ModalProps) {
  const [stage, setStage] = useState<AnimationStage>('instructions');

  useEffect(() => {
    if (!isOpen) {
      setStage('instructions');
      return;
    }

    // Start animation sequence
    const timeout1 = setTimeout(() => setStage('404'), 100);
    const timeout2 = setTimeout(() => setStage('glitch'), 1500);
    const timeout3 = setTimeout(() => setStage('402'), 2500);
    const timeout4 = setTimeout(() => setStage('demo'), 3500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Animated Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black"
        onClick={onClose}
      >
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(255 255 255) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(255 255 255) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </motion.div>

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="absolute top-6 right-6 z-[10001] p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm transition-colors"
      >
        <X className="w-5 h-5 text-zinc-400" />
      </motion.button>

      {/* Content */}
      <div className="relative z-[10000] w-full max-w-4xl mx-4">
        <AnimatePresence mode="wait">
          {stage === 'instructions' && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 25 
              }}
              className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="space-y-4 text-zinc-200">
                <h2 className="text-xl font-semibold text-zinc-100 mb-4">
                  Integration Instructions
                </h2>
                <div className="text-sm space-y-3 text-zinc-400">
                  <p>You are given a task to integrate an existing React component in the codebase</p>
                  
                  <div className="mt-4">
                    <h3 className="font-semibold text-zinc-300">The codebase should support:</h3>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>shadcn project structure</li>
                      <li>Tailwind CSS</li>
                      <li>Typescript</li>
                    </ul>
                  </div>

                  <p className="mt-4">
                    If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.
                  </p>

                  <div className="mt-4">
                    <h3 className="font-semibold text-zinc-300">Implementation Guidelines</h3>
                    <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                      <li>Analyze the component structure and identify all required dependencies</li>
                      <li>Review the component's arguments and state</li>
                      <li>Identify any required context providers or hooks and install them</li>
                    </ol>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold text-zinc-300">Questions to Ask</h3>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>What data/props will be passed to this component?</li>
                      <li>Are there any specific state management requirements?</li>
                      <li>Are there any required assets (images, icons, etc.)?</li>
                      <li>What is the expected responsive behavior?</li>
                      <li>What is the best place to use this component in the app?</li>
                    </ul>
                  </div>

                  <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-zinc-400 font-mono text-xs">
                      Loading animation sequence...
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {(stage === '404' || stage === 'glitch' || stage === '402') && (
            <motion.div
              key="number"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 20 
              }}
              className="relative"
            >
              <Empty>
                <EmptyHeader>
                  <EmptyTitle className="font-extrabold text-9xl text-zinc-200">
                    <span>4</span>
                    <span>0</span>
                    <motion.span
                      key={stage}
                      animate={
                        stage === 'glitch'
                          ? {
                              x: [0, -4, 4, -4, 4, -2, 2, 0],
                              y: [0, 3, -3, 2, -2, 1, -1, 0],
                              skewX: [0, -8, 8, -6, 6, -4, 4, 0],
                              opacity: [1, 0.7, 0.9, 0.6, 0.95, 0.75, 1, 1],
                              filter: [
                                'brightness(1)',
                                'brightness(1.5)',
                                'brightness(0.8)',
                                'brightness(1.3)',
                                'brightness(0.9)',
                                'brightness(1.2)',
                                'brightness(1)',
                              ],
                            }
                          : stage === '402'
                          ? { 
                              scale: [1, 1.1, 1],
                              opacity: 1,
                              filter: 'brightness(1)',
                            }
                          : { opacity: 1 }
                      }
                      transition={
                        stage === 'glitch'
                          ? {
                              duration: 0.8,
                              repeat: 1,
                              ease: [0.22, 1, 0.36, 1],
                            }
                          : stage === '402'
                          ? { 
                              duration: 0.5,
                              ease: [0.34, 1.56, 0.64, 1]
                            }
                          : { duration: 0.3 }
                      }
                      className="inline-block relative"
                      style={
                        stage === 'glitch'
                          ? {
                              textShadow:
                                '3px 3px 0 rgba(239, 68, 68, 0.8), -3px -3px 0 rgba(59, 130, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.5)',
                            }
                          : stage === '402'
                          ? {
                              textShadow: '0 0 40px rgba(52, 211, 153, 0.4), 0 0 80px rgba(52, 211, 153, 0.2)',
                            }
                          : {}
                      }
                    >
                      {stage === '402' ? '2' : '4'}
                      {stage === 'glitch' && (
                        <>
                          <motion.span
                            className="absolute inset-0 text-red-500"
                            animate={{
                              x: [-2, 2, -2],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 0.2,
                              repeat: 3,
                            }}
                          >
                            4
                          </motion.span>
                          <motion.span
                            className="absolute inset-0 text-blue-500"
                            animate={{
                              x: [2, -2, 2],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 0.2,
                              repeat: 3,
                              delay: 0.1,
                            }}
                          >
                            4
                          </motion.span>
                        </>
                      )}
                    </motion.span>
                  </EmptyTitle>
                  <EmptyDescription className="-mt-8 text-nowrap text-zinc-400">
                    {stage === '402' ? (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        Payment Required • X402 Protocol
                      </motion.span>
                    ) : (
                      <>
                        The page you're looking for might have been <br />
                        moved or doesn't exist.
                      </>
                    )}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </motion.div>
          )}

          {stage === 'demo' && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 25 
              }}
              className="w-full max-w-3xl"
            >
              {/* 402 Number Display */}
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <motion.div 
                  className="font-extrabold text-7xl text-zinc-200 mb-2"
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(52, 211, 153, 0.3)',
                      '0 0 40px rgba(52, 211, 153, 0.5)',
                      '0 0 20px rgba(52, 211, 153, 0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  402
                </motion.div>
                <div className="text-zinc-400 text-sm">Payment Required • X402 Protocol</div>
              </motion.div>

              {/* Demo Widget */}
              <motion.div 
                className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 25 }}
              >
                {/* Header */}
                <div className="bg-white/5 border-b border-white/10 px-6 py-4">
                  <h3 className="text-zinc-200 font-semibold text-lg">
                    How X402 Works with Kite
                  </h3>
                  <p className="text-zinc-500 text-sm mt-1">
                    Seamless micropayments for AI agent services
                  </p>
                </div>

                {/* Demo Flow */}
                <div className="p-6 space-y-6">
                  {/* Step 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.3, 
                      type: "spring", 
                      stiffness: 120, 
                      damping: 15 
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-sm">
1
                    </div>
                    <div className="flex-1">
                      <div className="text-zinc-200 font-medium mb-1">Agent Requests Service</div>
                      <div className="text-zinc-500 text-sm">
                        Agent <span className="text-cyan-400 font-mono">0x742d...bC31</span> calls{' '}
                        <span className="text-zinc-400">analyzeMarket()</span> tool
                      </div>
                      <div className="mt-2 bg-black/40 border border-white/5 rounded px-3 py-2 font-mono text-xs text-zinc-400">
                        POST /api/tools/execute
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.5, 
                      type: "spring", 
                      stiffness: 120, 
                      damping: 15 
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 font-bold text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="text-zinc-200 font-medium mb-1">402 Payment Required</div>
                      <div className="text-zinc-500 text-sm">
                        Server responds with payment details
                      </div>
                      <div className="mt-2 bg-black/40 border border-orange-500/20 rounded px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">HTTP Status:</span>
                          <span className="text-orange-400 font-mono">402 Payment Required</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">Cost:</span>
                          <span className="text-emerald-400 font-mono">0.0015 KITE</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">Payment Address:</span>
                          <span className="text-cyan-400 font-mono text-[10px]">0x8f3c...9aE2</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.7, 
                      type: "spring", 
                      stiffness: 120, 
                      damping: 15 
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="text-zinc-200 font-medium mb-1">Automatic Payment</div>
                      <div className="text-zinc-500 text-sm">
                        Agent wallet sends microtransaction on Kite Network
                      </div>
                      <div className="mt-2 bg-black/40 border border-cyan-500/20 rounded px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">TX Hash:</span>
                          <span className="text-cyan-400 font-mono text-[10px]">0xf4a2...c831</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">Gas Fee:</span>
                          <span className="text-zinc-400 font-mono">0.0001 KITE</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">Confirmation:</span>
                          <span className="text-emerald-400">✓ Instant</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 4 */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.9, 
                      type: "spring", 
                      stiffness: 120, 
                      damping: 15 
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      4
                    </div>
                    <div className="flex-1">
                      <div className="text-zinc-200 font-medium mb-1">Service Executed</div>
                      <div className="text-zinc-500 text-sm">
                        Tool executes and returns results to agent
                      </div>
                      <div className="mt-2 bg-black/40 border border-emerald-500/20 rounded px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">HTTP Status:</span>
                          <span className="text-emerald-400 font-mono">200 OK</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">Response Time:</span>
                          <span className="text-zinc-400">142ms</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">Total Cost:</span>
                          <span className="text-emerald-400 font-mono">0.0016 KITE</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Benefits Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 1.1, 
                    type: "spring", 
                    stiffness: 120, 
                    damping: 15 
                  }}
                  className="bg-white/5 border-t border-white/10 px-6 py-4"
                >
                  <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                      <div className="text-emerald-400 font-bold text-lg">$0.001</div>
                      <div className="text-zinc-500">Avg Cost/Call</div>
                    </div>
                    <div>
                      <div className="text-cyan-400 font-bold text-lg">&lt;200ms</div>
                      <div className="text-zinc-500">Payment Time</div>
                    </div>
                    <div>
                      <div className="text-orange-400 font-bold text-lg">100%</div>
                      <div className="text-zinc-500">Automatic</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
