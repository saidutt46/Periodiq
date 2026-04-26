"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/* ─── types ─── */
interface AtomVisualizationProps {
  electronsPerShell: number[];
  categoryColor: string; // hex like "#4facfe"
  atomicNumber: number;
  symbol: string;
}

/* ─── helpers ─── */
const SHELL_NAMES = ["K", "L", "M", "N", "O", "P", "Q"];

/** Generate positions evenly spaced on an elliptical ring */
function electronPositionsOnRing(
  count: number,
  radiusX: number,
  radiusY: number,
  tiltX: number,
  tiltZ: number,
  timeOffset: number,
  time: number,
  speed: number
): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  const tiltMatrix = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(tiltX, 0, tiltZ)
  );

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + time * speed + timeOffset;
    const x = Math.cos(angle) * radiusX;
    const y = Math.sin(angle) * radiusY;
    const pos = new THREE.Vector3(x, y, 0);
    pos.applyMatrix4(tiltMatrix);
    positions.push(pos);
  }
  return positions;
}

/* ─── Nucleus ─── */
function Nucleus({
  color,
  atomicNumber,
}: {
  color: string;
  atomicNumber: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Nucleus size scales with atomic number (subtle)
  const radius = 0.3 + Math.log(atomicNumber + 1) * 0.08;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.03);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.06);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group>
      {/* Core nucleus sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.6, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          toneMapped={false}
        />
      </mesh>

      {/* Bright core hotspot */}
      <mesh>
        <sphereGeometry args={[radius * 0.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          toneMapped={false}
        />
      </mesh>

      {/* Point light from nucleus */}
      <pointLight color={color} intensity={2} distance={12} decay={2} />
    </group>
  );
}

/* ─── OrbitalRing ─── */
function OrbitalRing({
  shellIndex,
  electronCount,
  totalShells,
  color,
  time,
}: {
  shellIndex: number;
  electronCount: number;
  totalShells: number;
  color: string;
  time: number;
}) {
  const ringRef = useRef<THREE.Group>(null);

  // Each shell gets progressively larger radius
  const baseRadius = 1.2 + shellIndex * 0.85;
  const radiusX = baseRadius;
  const ellipseScale = 0.85 + (shellIndex % 3) * 0.04; // slight deterministic ellipse variation
  const radiusY = baseRadius * ellipseScale;

  // Unique tilts per shell for 3D feel
  const tilts = useMemo(() => {
    const tiltAngles = [
      { x: 0.3, z: 0 },
      { x: 1.2, z: 0.5 },
      { x: 0.6, z: -0.8 },
      { x: 1.5, z: 1.2 },
      { x: 0.2, z: -1.5 },
      { x: 1.0, z: 0.7 },
      { x: 0.8, z: -0.3 },
    ];
    return tiltAngles[shellIndex % tiltAngles.length];
  }, [shellIndex]);

  // Orbital speed decreases with distance (outer shells slower)
  const speed = 0.4 / (1 + shellIndex * 0.35);
  const timeOffset = shellIndex * 1.1;

  // Ring geometry (torus for the orbital path)
  const ringOpacity = 0.12 + (1 - shellIndex / Math.max(totalShells, 1)) * 0.08;

  // Electron positions
  const electronPositions = useMemo(
    () =>
      electronPositionsOnRing(
        electronCount,
        radiusX,
        radiusY,
        tilts.x,
        tilts.z,
        timeOffset,
        time,
        speed
      ),
    [electronCount, radiusX, radiusY, tilts, timeOffset, time, speed]
  );

  return (
    <group ref={ringRef}>
      {/* Orbital path ring */}
      <mesh rotation={[tilts.x, 0, tilts.z]}>
        <torusGeometry args={[baseRadius, 0.008, 16, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={ringOpacity}
          toneMapped={false}
        />
      </mesh>

      {/* Electrons */}
      {electronPositions.map((pos, i) => (
        <Electron key={i} position={pos} color={color} shellIndex={shellIndex} />
      ))}
    </group>
  );
}

/* ─── Electron ─── */
function Electron({
  position,
  color,
  shellIndex,
}: {
  position: THREE.Vector3;
  color: string;
  shellIndex: number;
}) {
  const size = 0.06 - shellIndex * 0.004;
  const clampedSize = Math.max(size, 0.03);

  return (
    <group position={position}>
      {/* Electron sphere */}
      <mesh>
        <sphereGeometry args={[clampedSize, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Electron glow */}
      <mesh>
        <sphereGeometry args={[clampedSize * 3, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          toneMapped={false}
        />
      </mesh>

      {/* Electron trail (stretched in orbit direction) */}
      <mesh>
        <sphereGeometry args={[clampedSize * 5, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Atom Scene (all the 3D content) ─── */
function AtomScene({
  electronsPerShell,
  categoryColor,
  atomicNumber,
}: Omit<AtomVisualizationProps, "symbol">) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;

    // Gentle auto-rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <>
      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.3}
        color="#ffffff"
      />

      {/* Main atom group */}
      <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2}>
        <group ref={groupRef}>
          <Nucleus color={categoryColor} atomicNumber={atomicNumber} />
          {electronsPerShell.map((count, i) => (
            <OrbitalRingAnimated
              key={i}
              shellIndex={i}
              electronCount={count}
              totalShells={electronsPerShell.length}
              color={categoryColor}
            />
          ))}
        </group>
      </Float>

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005, 0.0005)}
        />
      </EffectComposer>

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={12}
        autoRotate={false}
        dampingFactor={0.05}
        enableDamping
      />
    </>
  );
}

/* ─── Animated orbital ring (uses useFrame) ─── */
function OrbitalRingAnimated({
  shellIndex,
  electronCount,
  totalShells,
  color,
}: {
  shellIndex: number;
  electronCount: number;
  totalShells: number;
  color: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const electronsRef = useRef<THREE.Group[]>([]);

  const baseRadius = 1.2 + shellIndex * 0.85;
  const radiusX = baseRadius;
  const radiusY = baseRadius * 0.9;

  const tilts = useMemo(() => {
    const tiltAngles = [
      { x: 0.3, z: 0 },
      { x: 1.2, z: 0.5 },
      { x: 0.6, z: -0.8 },
      { x: 1.5, z: 1.2 },
      { x: 0.2, z: -1.5 },
      { x: 1.0, z: 0.7 },
      { x: 0.8, z: -0.3 },
    ];
    return tiltAngles[shellIndex % tiltAngles.length];
  }, [shellIndex]);

  const speed = 0.4 / (1 + shellIndex * 0.35);
  const timeOffset = shellIndex * 1.1;
  const ringOpacity =
    0.12 + (1 - shellIndex / Math.max(totalShells, 1)) * 0.08;

  // Tilt matrix for electron positions
  const tiltMatrix = useMemo(() => {
    return new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(tilts.x, 0, tilts.z)
    );
  }, [tilts]);

  const setElectronRef = useCallback(
    (index: number) => (el: THREE.Group | null) => {
      if (el) electronsRef.current[index] = el;
    },
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Update electron positions each frame
    for (let i = 0; i < electronCount; i++) {
      const ref = electronsRef.current[i];
      if (!ref) continue;

      const angle =
        (i / electronCount) * Math.PI * 2 + t * speed + timeOffset;
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      const pos = new THREE.Vector3(x, y, 0);
      pos.applyMatrix4(tiltMatrix);
      ref.position.copy(pos);
    }
  });

  const electronSize = Math.max(0.06 - shellIndex * 0.004, 0.03);

  return (
    <group ref={groupRef}>
      {/* Orbital path ring */}
      <mesh rotation={[tilts.x, 0, tilts.z]}>
        <torusGeometry args={[baseRadius, 0.008, 16, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={ringOpacity}
          toneMapped={false}
        />
      </mesh>

      {/* Faint outer glow ring */}
      <mesh rotation={[tilts.x, 0, tilts.z]}>
        <torusGeometry args={[baseRadius, 0.05, 16, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.03}
          toneMapped={false}
        />
      </mesh>

      {/* Electrons */}
      {Array.from({ length: electronCount }).map((_, i) => (
        <group key={i} ref={setElectronRef(i)}>
          {/* Electron core */}
          <mesh>
            <sphereGeometry args={[electronSize, 16, 16]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          {/* Electron glow */}
          <mesh>
            <sphereGeometry args={[electronSize * 3, 12, 12]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.18}
              toneMapped={false}
            />
          </mesh>
          {/* Electron soft halo */}
          <mesh>
            <sphereGeometry args={[electronSize * 6, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.04}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Main exported component ─── */
export default function AtomVisualization({
  electronsPerShell,
  categoryColor,
  atomicNumber,
  symbol,
}: AtomVisualizationProps) {
  // Calculate ideal camera distance based on number of shells
  const cameraDistance = 3 + electronsPerShell.length * 0.8;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{
          position: [0, 0, cameraDistance],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <AtomScene
          electronsPerShell={electronsPerShell}
          categoryColor={categoryColor}
          atomicNumber={atomicNumber}
        />
      </Canvas>
    </div>
  );
}

export { SHELL_NAMES };
