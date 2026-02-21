"use client";

import React, { useState } from "react";
import { VoicePoweredOrb } from "./voice-powered-orb";
import { SplineScene } from "./splite";
import { cn } from "@/lib/utils";

interface AgentOrbWith3DProps {
  className?: string;
  hue?: number;
  enableVoiceControl?: boolean;
  voiceSensitivity?: number;
  splineScene?: string;
  agentName?: string;
  showSpline?: boolean;
}

export const AgentOrbWith3D: React.FC<AgentOrbWith3DProps> = ({
  className,
  hue = 0,
  enableVoiceControl = false,
  voiceSensitivity = 1.5,
  splineScene = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
  agentName = "AI Agent",
  showSpline = true,
}) => {
  const [voiceDetected, setVoiceDetected] = useState(false);

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Background Orb (reduced brightness) */}
      <div className="absolute inset-0 z-0">
        <VoicePoweredOrb
          hue={hue}
          enableVoiceControl={enableVoiceControl}
          voiceSensitivity={voiceSensitivity}
          maxRotationSpeed={1.0}
          maxHoverIntensity={0.6}
          onVoiceDetected={setVoiceDetected}
        />
      </div>

      {/* 3D Model inside the orb */}
      {showSpline && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className={cn(
            "w-full h-full max-w-[80%] max-h-[80%] transition-transform duration-300",
            voiceDetected ? "scale-110" : "scale-100"
          )}>
            <SplineScene 
              scene={splineScene}
              className="w-full h-full opacity-90"
            />
          </div>
        </div>
      )}

      {/* Agent name label */}
      {agentName && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
          <p className="text-sm font-medium text-white/90">{agentName}</p>
        </div>
      )}
    </div>
  );
};
