'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

const FloatingGeo = ({
  shape,
  color,
  speed = 1,
}: {
  shape: 'tetra' | 'cube' | 'icosa';
  color: string;
  speed?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.4;
      meshRef.current.rotation.y = t * 0.6;
    }
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.15;
    }
  });

  const geo =
    shape === 'tetra' ? (
      <tetrahedronGeometry args={[1.2, 0]} />
    ) : shape === 'cube' ? (
      <boxGeometry args={[1.5, 1.5, 1.5]} />
    ) : (
      <icosahedronGeometry args={[1.2, 0]} />
    );

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={8} color={color} />
      <pointLight position={[-2, -2, 2]} intensity={4} color={color} />

      <group ref={groupRef}>
        <mesh ref={meshRef}>
          {geo}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            roughness={0.15}
            metalness={0.85}
            transparent
            opacity={0.85}
          />
          <Edges color={color} threshold={10} />
        </mesh>
      </group>
    </>
  );
};

export const FloatingTetra = ({ className = '' }: { className?: string }) => (
  <Canvas camera={{ position: [0, 0, 4], fov: 45 }} className={className} gl={{ antialias: true, alpha: true }}>
    <FloatingGeo shape="tetra" color="#ff2200" speed={0.8} />
  </Canvas>
);

export const FloatingCube = ({ className = '' }: { className?: string }) => (
  <Canvas camera={{ position: [0, 0, 4], fov: 45 }} className={className} gl={{ antialias: true, alpha: true }}>
    <FloatingGeo shape="cube" color="#ff5500" speed={0.6} />
  </Canvas>
);

export const FloatingIcosa = ({ className = '' }: { className?: string }) => (
  <Canvas camera={{ position: [0, 0, 4], fov: 45 }} className={className} gl={{ antialias: true, alpha: true }}>
    <FloatingGeo shape="icosa" color="#ff8800" speed={1.0} />
  </Canvas>
);
