'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface TalkingAgent3DProps {
  isPlaying: boolean;
  audioData: Uint8Array | null;
  agentName: string;
}

// Simple 3D head model with mouth animation
function AnimatedHead({ isPlaying, audioData }: { isPlaying: boolean; audioData: Uint8Array | null }) {
  const meshRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  
  // Mouth parameters
  const [mouthOpen, setMouthOpen] = useState(0);

  // Animate based on audio data
  useEffect(() => {
    if (!audioData || !isPlaying) {
      setMouthOpen(0);
      return;
    }

    // Calculate average volume from audio data
    const sum = audioData.reduce((acc, val) => acc + val, 0);
    const average = sum / audioData.length;
    
    // Map volume (0-255) to mouth open amount (0-1)
    const normalized = Math.min(average / 128, 1);
    setMouthOpen(normalized);
  }, [audioData, isPlaying]);

  // Idle animation when not talking
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle head sway
      if (!isPlaying) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
      }
    }
    
    // Animate mouth with smooth lerp
    if (mouthRef.current) {
      const targetScaleY = 1 + mouthOpen * 0.5;
      const targetScaleX = 1 - mouthOpen * 0.1;
      mouthRef.current.scale.y = THREE.MathUtils.lerp(
        mouthRef.current.scale.y,
        targetScaleY,
        0.3
      );
      mouthRef.current.scale.x = THREE.MathUtils.lerp(
        mouthRef.current.scale.x,
        targetScaleX,
        0.3
      );
    }

    // Blink animation
    const blinkTime = state.clock.elapsedTime % 4;
    const isBlinking = blinkTime > 3.8 && blinkTime < 4;
    if (leftEyeRef.current && rightEyeRef.current) {
      const targetScale = isBlinking ? 0.1 : 1;
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, targetScale, 0.3);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, targetScale, 0.3);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Head */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#ffdbac" 
          roughness={0.8} 
          metalness={0.2} 
        />
      </mesh>

      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Eye pupils */}
      <mesh position={[-0.3, 0.2, 0.93]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#4a9eff" emissive="#4a9eff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.3, 0.2, 0.93]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#4a9eff" emissive="#4a9eff" emissiveIntensity={0.5} />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.3, 0.8]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.15, 0.3, 8, 16]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0, 1]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.08, 0.15, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
    </group>
  );
}

export default function TalkingAgent3D({ isPlaying, audioData, agentName }: TalkingAgent3DProps) {
  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-black/40 to-red-950/20 rounded-2xl overflow-hidden border border-red-500/20 shadow-2xl">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={!isPlaying}
          autoRotateSpeed={0.5}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-5, -5, 5]} intensity={0.8} color="#ef4444" />
        <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} />
        
        <Suspense fallback={null}>
          <AnimatedHead isPlaying={isPlaying} audioData={audioData} />
        </Suspense>
      </Canvas>

      {/* Agent name badge */}
      <div className="absolute bottom-4 left-4 px-4 py-2 bg-red-950/90 border border-red-500/40 rounded-lg backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-white text-sm font-mono font-semibold">{agentName}</span>
          {isPlaying && <span className="text-xs text-green-400">Speaking...</span>}
        </div>
      </div>

      {/* Audio visualizer overlay */}
      {isPlaying && audioData && (
        <div className="absolute top-4 left-4 right-4 h-12 flex items-end gap-1 justify-center">
          {Array.from({ length: 20 }).map((_, i) => {
            const value = audioData[i * 4] || 0;
            const height = (value / 255) * 100;
            return (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-red-600 to-red-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
