'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Edges, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Particle system for energy field
const EnergyParticles = () => {
  const count = 400;
  const particlesRef = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
      
      // Light pink gradient colors
      const heat = Math.random();
      col[i3] = 1;
      col[i3 + 1] = 0.71 + heat * 0.2;
      col[i3 + 2] = 0.85 + heat * 0.15;
    }
    
    return [pos, col];
  }, [count]);
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.08;
      particlesRef.current.rotation.x = clock.getElapsedTime() * 0.03;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Rotating energy rings
const EnergyRings = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.5;
      ring1Ref.current.rotation.y = t * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.4;
      ring2Ref.current.rotation.z = t * 0.2;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.6;
      ring3Ref.current.rotation.z = -t * 0.25;
    }
  });
  
  return (
    <>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.2, 0.035, 16, 100]} />
        <meshBasicMaterial
          color="#FFB6D9"
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.5, 0.03, 16, 100]} />
        <meshBasicMaterial
          color="#FFC0E0"
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.8, 0.025, 16, 100]} />
        <meshBasicMaterial
          color="#FFD6EC"
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
};

// Core interactive orb
const CoreOrb = () => {
  const mainOrbRef = useRef<THREE.Mesh>(null);
  const innerOrbRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (mainOrbRef.current) {
      // Smooth rotation with mouse influence
      mainOrbRef.current.rotation.y += 0.005;
      mainOrbRef.current.rotation.x = THREE.MathUtils.lerp(
        mainOrbRef.current.rotation.x,
        pointer.y * 0.3,
        0.05
      );
      mainOrbRef.current.rotation.z = THREE.MathUtils.lerp(
        mainOrbRef.current.rotation.z,
        pointer.x * 0.3,
        0.05
      );
    }
    
    if (innerOrbRef.current) {
      innerOrbRef.current.rotation.y = -t * 0.4;
      innerOrbRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      // Pulsing scale
      const pulse = 1 + Math.sin(t * 2) * 0.05;
      innerOrbRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <group>
      {/* Inner glowing core */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={innerOrbRef}>
          <icosahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial
            color="#FFB6D9"
            emissive="#FF9ED4"
            emissiveIntensity={2.2}
            roughness={0.1}
            metalness={0.95}
          />
          <Edges color="#FFE4F0" threshold={15} />
        </mesh>
      </Float>
      
      {/* Main holographic sphere */}
      <mesh ref={mainOrbRef}>
        <Sphere args={[1.4, 64, 64]}>
          <MeshDistortMaterial
            color="#FFC0E0"
            emissive="#FFB6D9"
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
            distort={0.5}
            speed={2.5}
            roughness={0.05}
            metalness={0.9}
          />
        </Sphere>
      </mesh>
      
      {/* Outer wireframe shell */}
      <mesh>
        <icosahedronGeometry args={[1.9, 0]} />
        <meshBasicMaterial
          color="#FF9ED4"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

// Main scene component
const TrustOrbScene = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={18} color="#FFB6D9" />
      <pointLight position={[5, 5, 5]} intensity={6} color="#FFC0E0" />
      <pointLight position={[-5, -5, 5]} intensity={4} color="#FFD6EC" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={3}
        color="#FF9ED4"
      />
      
      {/* Background stars */}
      <Stars
        radius={100}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      
      {/* Main components */}
      <CoreOrb />
      <EnergyRings />
      <EnergyParticles />
    </>
  );
};

// Export component
export const TrustOrb3D = ({ className = '' }: { className?: string }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      className={className}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      }}
      dpr={[1, 2]}
    >
      <TrustOrbScene />
    </Canvas>
  );
};
