'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NODE_COUNT = 60;

const NetworkNodes = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, linePositions } = useMemo(() => {
    // Random node positions on a sphere
    const positions = new Float32Array(NODE_COUNT * 3);
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 0.8;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      nodes.push(new THREE.Vector3(x, y, z));
    }

    // Connect close nodes with lines
    const lineVerts: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.1) {
          lineVerts.push(
            nodes[i].x, nodes[i].y, nodes[i].z,
            nodes[j].x, nodes[j].y, nodes[j].z
          );
        }
      }
    }

    return {
      positions,
      linePositions: new Float32Array(lineVerts),
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.12;
      pointsRef.current.rotation.x = t * 0.05;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = t * 0.12;
      linesRef.current.rotation.x = t * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={6} color="#ff2200" />
      <pointLight position={[-4, -4, 2]} intensity={3} color="#ff6600" />

      {/* Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ff3300"
          size={0.07}
          sizeAttenuation
          transparent
          opacity={0.9}
        />
      </points>

      {/* Edges */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff220044" transparent opacity={0.25} />
      </lineSegments>
    </>
  );
};

export const Network3D = ({ className = '' }: { className?: string }) => (
  <Canvas
    camera={{ position: [0, 0, 5], fov: 50 }}
    className={className}
    gl={{ antialias: true, alpha: true }}
  >
    <NetworkNodes />
  </Canvas>
);
