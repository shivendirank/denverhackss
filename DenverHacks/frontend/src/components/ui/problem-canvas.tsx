"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const LiquidBackground = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame(({ clock, mouse }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    mat.uniforms.uMouse.value.lerp(mouse, 0.05);
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `}
        fragmentShader={`
          uniform float uTime; uniform vec2 uMouse; varying vec2 vUv;
          void main() {
            vec2 uv = vUv; float t = uTime * 0.12;
            vec2 m = uMouse * 0.08;
            float v = (sin(uv.x*7.0+t+m.x*10.0)+sin(uv.y*5.0-t+m.y*10.0))*0.5+0.5;
            float c = smoothstep(0.0,1.0,v);
            // Transparent background instead of red overlay
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          }
        `}
      />
    </mesh>
  );
};

const Monolith = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.15;
    }
  });
  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[11, 1]} />
        <MeshDistortMaterial
          color="#100000"
          speed={3}
          distort={0.35}
          roughness={0.05}
          metalness={1.0}
          envMapIntensity={0.4}
        />
      </mesh>
    </Float>
  );
};

export const ProblemCanvas = () => (
  <Canvas camera={{ position: [0, 0, 55], fov: 38 }}>
    <ambientLight intensity={0.3} />
    <spotLight position={[40, 40, 40]} intensity={2} color="#FFB6D9" />
    <spotLight position={[-40, -20, 20]} intensity={0.8} color="#FFB6D9" />
    <LiquidBackground />
    <Monolith />
  </Canvas>
);
