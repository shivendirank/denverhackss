'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CitadelSphereProps {
  imageUrl: string;
  hotspots?: Array<{
    position: [number, number, number];
    label: string;
    onClick?: () => void;
  }>;
}

function SkyboxSphere({ imageUrl, hotspots = [] }: CitadelSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const { camera } = useThree();

  // Load texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (loadedTexture) => {
      loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
      setTexture(loadedTexture);
    });
  }, [imageUrl]);

  // Rotate slowly
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Main skybox sphere */}
      <mesh ref={meshRef} scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial 
          map={texture} 
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>

      {/* Interactive hotspots */}
      {hotspots.map((spot, i) => (
        <Hotspot
          key={i}
          position={spot.position}
          label={spot.label}
          onClick={spot.onClick}
        />
      ))}

      {/* Camera controller */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1}
        maxDistance={400}
        target={[0, 0, 0]}
      />
    </group>
  );
}

function Hotspot({ 
  position, 
  label, 
  onClick 
}: { 
  position: [number, number, number]; 
  label: string; 
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Glowing orb */}
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial
          color="#FF89C0"
          emissive="#FF89C0"
          emissiveIntensity={hovered ? 2 : 1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Label billboard */}
      {hovered && (
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[6, 2]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

interface CitadelViewerProps {
  skyboxUrl?: string;
  isLoading?: boolean;
  progress?: number;
  hotspots?: Array<{
    position: [number, number, number];
    label: string;
    onClick?: () => void;
  }>;
}

export default function CitadelViewer({
  skyboxUrl,
  isLoading = false,
  progress = 0,
  hotspots = [],
}: CitadelViewerProps) {
  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-mono text-sm">
              Generating Citadel...
            </p>
            <p className="text-pink-400 text-xs mt-2">{Math.round(progress)}%</p>
          </div>
        </div>
      ) : skyboxUrl ? (
        <Canvas
          camera={{ position: [0, 0, 0.1], fov: 75 }}
          gl={{ antialias: true, alpha: false }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <SkyboxSphere imageUrl={skyboxUrl} hotspots={hotspots} />
        </Canvas>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 font-mono">
            No citadel loaded
          </p>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 text-white/60 text-xs font-mono space-y-1">
        <div>🖱️ Left click + drag to look around</div>
        <div>🔬 Scroll to zoom in/out</div>
        <div>⚡ Click hotspots to interact</div>
      </div>
    </div>
  );
}
