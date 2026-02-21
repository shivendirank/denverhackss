'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ShieldCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.4;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = -t * 0.25;
      outerRef.current.rotation.z = t * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.6;
      ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <>
      {/* Ambient + point lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={8} color="#ff2222" />
      <pointLight position={[-3, -2, 2]} intensity={4} color="#ff6600" />
      <pointLight position={[0, 0, 4]} intensity={3} color="#ffffff" />

      {/* Core octahedron */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.1, 0]} />
        <MeshDistortMaterial
          color="#cc1111"
          emissive="#ff0000"
          emissiveIntensity={0.6}
          distort={0.25}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
        <Edges color="#ff4444" threshold={15} />
      </mesh>

      {/* Outer wireframe icosahedron */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.7, 0]} />
        <meshBasicMaterial color="#ff2200" wireframe opacity={0.18} transparent />
      </mesh>

      {/* Orbit ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.0, 0.025, 8, 80]} />
        <meshBasicMaterial color="#ff3300" opacity={0.5} transparent />
      </mesh>

      {/* Second orbit ring perpendicular */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.02, 8, 80]} />
        <meshBasicMaterial color="#ff5500" opacity={0.3} transparent />
      </mesh>
    </>
  );
};

export const Shield3D = ({ className = '' }: { className?: string }) => (
  <Canvas
    camera={{ position: [0, 0, 5], fov: 45 }}
    className={className}
    gl={{ antialias: true, alpha: true }}
  >
    <ShieldCore />
  </Canvas>
);
