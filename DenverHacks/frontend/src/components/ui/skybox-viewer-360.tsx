"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface SkyboxViewerProps {
  imageUrl: string;
  onLoad?: () => void;
  className?: string;
}

/**
 * Inner sphere component that renders the 360° skybox
 */
function SkyboxSphere({ imageUrl, onLoad }: { imageUrl: string; onLoad?: () => void }) {
  const texture = useTexture(imageUrl);
  const { camera } = useThree();

  useEffect(() => {
    if (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      onLoad?.();
    }
  }, [texture, onLoad]);

  useEffect(() => {
    // Position camera at center
    camera.position.set(0, 0, 0.1);
  }, [camera]);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

/**
 * 360° Skybox Viewer Component
 * Renders equirectangular panoramic images for immersive agent environments
 */
export function SkyboxViewer360({ imageUrl, onLoad, className }: SkyboxViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(75);
  const controlsRef = useRef<any>(null);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setZoom(75);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.max(30, prev - 10));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.min(120, prev + 10));
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-pink-400 animate-spin" />
            <p className="text-white/60 font-mono text-sm">
              Loading Memory Palace...
            </p>
          </div>
        </motion.div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ fov: zoom, position: [0, 0, 0.1] }}
        className="rounded-2xl"
      >
        <SkyboxSphere imageUrl={imageUrl} onLoad={handleLoad} />
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={false}
          rotateSpeed={-0.5}
          zoomSpeed={0.5}
          minDistance={0.1}
          maxDistance={1}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Controls Overlay */}
      {!isLoading && (
        <motion.div
          className="absolute bottom-6 right-6 flex gap-2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleZoomIn}
            className="p-2 bg-zinc-900/80 backdrop-blur-sm border border-pink-500/20 rounded-lg hover:border-pink-500/50 hover:bg-zinc-900 transition-all group"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-white/60 group-hover:text-pink-400 transition-colors" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-zinc-900/80 backdrop-blur-sm border border-pink-500/20 rounded-lg hover:border-pink-500/50 hover:bg-zinc-900 transition-all group"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-white/60 group-hover:text-pink-400 transition-colors" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-zinc-900/80 backdrop-blur-sm border border-pink-500/20 rounded-lg hover:border-pink-500/50 hover:bg-zinc-900 transition-all group"
            title="Reset View"
          >
            <RotateCcw className="w-5 h-5 text-white/60 group-hover:text-pink-400 transition-colors" />
          </button>
        </motion.div>
      )}

      {/* Instructions */}
      {!isLoading && (
        <motion.div
          className="absolute top-6 left-6 bg-zinc-900/80 backdrop-blur-sm border border-pink-500/20 rounded-lg px-4 py-2 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/60 font-mono text-xs">
            🖱️ Drag to look around • Scroll to zoom
          </p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Compact preview version for thumbnails
 */
export function SkyboxViewerMini({ imageUrl, className }: { imageUrl: string; className?: string }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
        <SkyboxSphere imageUrl={imageUrl} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={-0.3}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
