'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { Mesh } from 'three';

import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  pass,
  mix,
  add,
} from 'three/tsl';

const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

extend(THREE as any);

// ─── Post Processing ───────────────────────────────────────────────────────────

const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    const postProcessing = new THREE.PostProcessing(gl as any);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    const pinkOverlay = vec3(1, 0.71, 0.85).mul(oneMinus(scanLine)).mul(0.5);

    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, pinkOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0
    );

    const final = withScanEffect.add(bloomPass);
    postProcessing.outputNode = final;

    return postProcessing;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    progressRef.current.value =
      Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    render.renderAsync();
  }, 1);

  return null;
};

// ─── Scene ─────────────────────────────────────────────────────────────────────

const WIDTH = 300;
const HEIGHT = 300;

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(true); // Start visible immediately

  useEffect(() => {
    // Ensure visibility is always true once component mounts
    setVisible(true);
  }, []);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.15; // Increased strength for more visible distortion
    const tDepthMap = texture(depthMap);
    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength))
    );

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));
    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    const depth = tDepthMap;
    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));
    const mask = dot.mul(flow).mul(vec3(10, 0, 0));

    const final = blendScreen(tMap, mask);

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
      transparent: true,
      opacity: 0.95, // Start nearly visible
    });

    return { material, uniforms: { uPointer, uProgress } };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    uniforms.uProgress.value =
      Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;

    // Ensure the blob stays visible
    if (
      meshRef.current &&
      'material' in meshRef.current &&
      meshRef.current.material
    ) {
      const mat = meshRef.current.material as any;
      if ('opacity' in mat && mat.opacity < 1) {
        // Fast fade-in to ensure blob is visible immediately
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1, 0.15);
      }
    }
  });

  useFrame(({ pointer }) => {
    // Smooth lerp toward cursor position with more responsiveness
    uniforms.uPointer.value.x = THREE.MathUtils.lerp(
      uniforms.uPointer.value.x,
      pointer.x,
      0.12
    );
    uniforms.uPointer.value.y = THREE.MathUtils.lerp(
      uniforms.uPointer.value.y,
      pointer.y,
      0.12
    );
  });

  const scaleFactor = 0.4;
  return (
    <mesh
      ref={meshRef}
      scale={[w * scaleFactor, h * scaleFactor, 1]}
      material={material}
    >
      <planeGeometry />
    </mesh>
  );
};

// ─── Hero HTML Overlay ─────────────────────────────────────────────────────────

export const HeroFuturistic = () => {
  const titleText = 'Maat';
  const subtitle = 'Decentralized Trust Infrastructure for Autonomous AI Agents';
  const heroRef = useRef<HTMLDivElement>(null);

  const [visibleChars, setVisibleChars] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);



  // Typewriter effect for title
  useEffect(() => {
    if (visibleChars < titleText.length) {
      const timeout = setTimeout(
        () => setVisibleChars(visibleChars + 1),
        150 // Speed of typewriter effect (ms per character)
      );
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setSubtitleVisible(true), 300);
      return () => clearTimeout(timeout);
    }
  }, [visibleChars, titleText.length]);

  return (
    <div ref={heroRef} className="h-svh relative overflow-hidden">
      {/* ── Text overlay ── */}
      <div className="h-svh uppercase items-center w-full absolute z-[60] pointer-events-none px-10 flex justify-center flex-col">
        <div className="text-3xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold">
          <div className="flex overflow-hidden">
            <span className="text-white">
              {titleText.split('').map((char, index) => (
                <span
                  key={index}
                  className="inline-block"
                  style={{
                    opacity: index < visibleChars ? 1 : 0,
                    transition: 'opacity 0.1s ease-in',
                  }}
                >
                  {char}
                </span>
              ))}
              <span className="inline-block animate-pulse ml-1" style={{ opacity: visibleChars < titleText.length ? 1 : 0 }}>|</span>
            </span>
          </div>
        </div>

        <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden text-white font-bold">
          <div
            className={subtitleVisible ? 'fade-in-subtitle' : ''}
            style={{
              opacity: subtitleVisible ? undefined : 0,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>



      {/* ── Three.js Canvas ── */}
      <Canvas
        flat
        className="absolute inset-0 bg-black z-0"
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(props as any);
          await renderer.init();
          return renderer;
        }}
      >
        <PostProcessing fullScreenEffect={true} />
        <Suspense fallback={
          <mesh material={new THREE.MeshBasicMaterial({ color: '#220000', transparent: true, opacity: 0.3 })}>
            <planeGeometry args={[2, 2]} />
          </mesh>
        }>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroFuturistic;
