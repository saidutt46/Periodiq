"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import styles from "../DetailPage.module.css";

/* ─── types ─── */
interface BohrModelVizProps {
  electronsPerShell: number[];
  categoryColor: string;
  atomicNumber: number;
  theme: "dark" | "light";
}

/* Predefined tilt angles per shell */
const SHELL_TILTS = [
  { x: 0.3, z: 0 },
  { x: 1.2, z: 0.5 },
  { x: 0.6, z: -0.8 },
  { x: 1.5, z: 1.2 },
  { x: 0.2, z: -1.5 },
  { x: 1.0, z: 0.7 },
  { x: 0.8, z: -0.3 },
];

/* ─── Nucleus ─── */
function Nucleus({ color, atomicNumber }: { color: string; atomicNumber: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const radius = 0.3 + Math.log(atomicNumber + 1) * 0.08;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) meshRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.03);
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.06);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group>
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
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.6, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 0.5, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={2} distance={12} decay={2} />
    </group>
  );
}

/* ─── Animated orbital ring with electrons ─── */
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
  // Cap rendered electrons: 8 dots on a spinning ring looks the same as 32
  const renderedCount = Math.min(electronCount, 8);

  const electronsRef = useRef<THREE.Group[]>([]);
  const baseRadius = 1.2 + shellIndex * 0.85;
  const radiusX = baseRadius;
  const radiusY = baseRadius * 0.9;
  const tilts = SHELL_TILTS[shellIndex % SHELL_TILTS.length];
  const speed = 0.4 / (1 + shellIndex * 0.35);
  const timeOffset = shellIndex * 1.1;
  const ringOpacity = 0.12 + (1 - shellIndex / Math.max(totalShells, 1)) * 0.08;

  const tiltMatrix = useMemo(
    () => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(tilts.x, 0, tilts.z)),
    [tilts]
  );

  const setElectronRef = useCallback(
    (index: number) => (el: THREE.Group | null) => {
      if (el) electronsRef.current[index] = el;
    },
    []
  );

  const _pos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < renderedCount; i++) {
      const ref = electronsRef.current[i];
      if (!ref) continue;
      const angle = (i / renderedCount) * Math.PI * 2 + t * speed + timeOffset;
      _pos.set(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0);
      _pos.applyMatrix4(tiltMatrix);
      ref.position.copy(_pos);
    }
  });

  const electronSize = Math.max(0.06 - shellIndex * 0.004, 0.03);

  return (
    <group>
      {/* Orbital ring */}
      <mesh rotation={[tilts.x, 0, tilts.z]}>
        <torusGeometry args={[baseRadius, 0.008, 12, 96]} />
        <meshBasicMaterial color={color} transparent opacity={ringOpacity} toneMapped={false} />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[tilts.x, 0, tilts.z]}>
        <torusGeometry args={[baseRadius, 0.05, 12, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.03} toneMapped={false} />
      </mesh>
      {/* Electrons — 2 meshes each: core + glow (dropped the faint halo) */}
      {Array.from({ length: renderedCount }).map((_, i) => (
        <group key={i} ref={setElectronRef(i)}>
          <mesh>
            <sphereGeometry args={[electronSize, 12, 12]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[electronSize * 3, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.18} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Scene ─── */
function BohrScene({
  electronsPerShell,
  categoryColor,
  atomicNumber,
  theme,
}: BohrModelVizProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  const bloomIntensity = theme === "light" ? 0.6 : 1.2;

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#ffffff" />

      <Sparkles count={40} scale={12} size={1.2} speed={0.3} opacity={0.1} color={categoryColor} />

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

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={25}
        dampingFactor={0.08}
        enableDamping
        zoomSpeed={0.5}
      />
    </>
  );
}

/* ─── Export with Canvas wrapper ─── */
export default function BohrModelViz(props: BohrModelVizProps) {
  // Camera scales with atom size — pulled back so model is comfortably centered
  const cameraDistance = 5 + props.electronsPerShell.length * 1.1;

  return (
    <div className={styles.atomCanvas}>
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <BohrScene {...props} />
      </Canvas>
    </div>
  );
}
