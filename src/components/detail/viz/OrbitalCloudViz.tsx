"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  parseElectronConfiguration,
  expandSubshellToOrbitals,
  generateOrbitalMeshData,
  getOrbitalLabel,
  type SubshellInfo,
  type OrbitalInfo,
} from "@/lib/chemistry/orbitals";
import styles from "../DetailPage.module.css";

/* ─── types ─── */
interface OrbitalCloudVizProps {
  electronConfiguration: string;
  electronsPerShell: number[];
  atomicNumber: number;
  categoryColor: string;
  theme: "dark" | "light";
}

/* ─── Orbital Lobe Mesh ─── */
function OrbitalLobe({
  vertices,
  normals,
  color,
  opacity,
  breatheSpeed,
}: {
  vertices: Float32Array;
  normals: Float32Array;
  color: string;
  opacity: number;
  breatheSpeed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    return geo;
  }, [vertices, normals]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      const s = 1 + Math.sin(t * breatheSpeed) * 0.03;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={opacity}
        roughness={0.3}
        metalness={0.1}
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ─── Single Orbital Visualization ─── */
function OrbitalShape({
  orbital,
  positiveColor,
  negativeColor,
  opacity,
}: {
  orbital: OrbitalInfo;
  positiveColor: string;
  negativeColor: string;
  opacity: number;
}) {
  const meshData = useMemo(
    () => generateOrbitalMeshData(orbital.n, orbital.l, orbital.m, 48),
    [orbital.n, orbital.l, orbital.m]
  );

  return (
    <group>
      {meshData.positive.length > 0 && (
        <OrbitalLobe
          vertices={meshData.positive}
          normals={meshData.positiveNormals}
          color={positiveColor}
          opacity={opacity}
          breatheSpeed={1.2 + orbital.l * 0.3}
        />
      )}
      {meshData.negative.length > 0 && (
        <OrbitalLobe
          vertices={meshData.negative}
          normals={meshData.negativeNormals}
          color={negativeColor}
          opacity={opacity}
          breatheSpeed={1.4 + orbital.l * 0.3}
        />
      )}
    </group>
  );
}

/* ─── XYZ Axis Lines ─── */
function AxisLines({ size, theme }: { size: number; theme: "dark" | "light" }) {
  const color = theme === "light" ? "#555" : "#777";
  const labelColor = theme === "light" ? "#444" : "#999";
  return (
    <group>
      <Line points={[[-size, 0, 0], [size, 0, 0]]} color={color} lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[0, -size, 0], [0, size, 0]]} color={color} lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[0, 0, -size], [0, 0, size]]} color={color} lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Html position={[size + 0.15, 0, 0]} center>
        <span style={{ color: labelColor, fontSize: 10, fontFamily: "var(--font-mono)" }}>+X</span>
      </Html>
      <Html position={[0, size + 0.15, 0]} center>
        <span style={{ color: labelColor, fontSize: 10, fontFamily: "var(--font-mono)" }}>+Y</span>
      </Html>
      <Html position={[0, 0, size + 0.15]} center>
        <span style={{ color: labelColor, fontSize: 10, fontFamily: "var(--font-mono)" }}>+Z</span>
      </Html>
    </group>
  );
}

/* ─── Nucleus dot ─── */
function NucleusDot({ color }: { color: string }) {
  return (
    <mesh>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

/* ─── Scene ─── */
function OrbitalScene({
  subshells,
  selectedSubshell,
  categoryColor,
  theme,
}: {
  subshells: SubshellInfo[];
  selectedSubshell: number | null; // index into subshells, null = show valence
  categoryColor: string;
  theme: "dark" | "light";
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  // Determine which subshell to visualize
  const activeSubshell = selectedSubshell !== null
    ? subshells[selectedSubshell]
    : subshells[subshells.length - 1]; // valence shell by default

  // Expand to individual orbitals with m quantum numbers
  const orbitals = useMemo(
    () => (activeSubshell ? expandSubshellToOrbitals(activeSubshell) : []),
    [activeSubshell]
  );

  // Complementary color for negative lobes
  const negativeColor = useMemo(() => {
    const c = new THREE.Color(categoryColor);
    // Shift hue by 180° for complementary
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    c.setHSL((hsl.h + 0.55) % 1, hsl.s * 0.8, hsl.l);
    return "#" + c.getHexString();
  }, [categoryColor]);

  const bloomIntensity = theme === "light" ? 0.5 : 1.0;
  const axisSize = activeSubshell ? 0.6 + activeSubshell.n * 0.35 + 0.5 : 2;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-3, -2, -4]} intensity={0.2} />

      <Sparkles count={60} scale={8} size={1} speed={0.2} opacity={0.1} color={categoryColor} />

      <group ref={groupRef}>
        <NucleusDot color={categoryColor} />

        {orbitals.map((orbital, i) => (
          <OrbitalShape
            key={`${orbital.n}-${orbital.l}-${orbital.m}`}
            orbital={orbital}
            positiveColor={categoryColor}
            negativeColor={negativeColor}
            opacity={0.55}
          />
        ))}
      </group>

      <AxisLines size={axisSize} theme={theme} />

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
        minZoom={40}
        maxZoom={300}
        dampingFactor={0.08}
        enableDamping
        zoomSpeed={0.5}
      />
    </>
  );
}

/* ─── Subshell Selector UI ─── */
function SubshellSelector({
  subshells,
  selected,
  onSelect,
  categoryColor,
}: {
  subshells: SubshellInfo[];
  selected: number | null;
  onSelect: (idx: number | null) => void;
  categoryColor: string;
}) {
  // Show only the outer subshells (last 6 max) to avoid clutter
  const visibleShells = subshells.slice(-8);
  const offset = subshells.length - visibleShells.length;

  return (
    <div className={styles.orbitalSelector}>
      {visibleShells.map((sub, i) => {
        const realIdx = i + offset;
        const isActive = selected === realIdx || (selected === null && realIdx === subshells.length - 1);
        return (
          <button
            key={sub.label}
            className={`${styles.orbitalSelectorBtn} ${isActive ? styles.orbitalSelectorBtnActive : ""}`}
            onClick={() => onSelect(realIdx === subshells.length - 1 ? null : realIdx)}
            style={isActive ? { borderColor: categoryColor, color: categoryColor } : undefined}
          >
            <span className={styles.orbitalSelectorLabel}>{sub.label}</span>
            <span className={styles.orbitalSelectorCount}>{sub.electrons}e⁻</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Quantum Number Display ─── */
function QuantumNumbers({
  subshell,
  orbitals,
}: {
  subshell: SubshellInfo | null;
  orbitals: OrbitalInfo[];
}) {
  if (!subshell) return null;

  return (
    <div className={styles.quantumNumbers}>
      <div className={styles.quantumRow}>
        <span className={styles.quantumLabel}>n</span>
        <span className={styles.quantumValue}>{subshell.n}</span>
      </div>
      <div className={styles.quantumRow}>
        <span className={styles.quantumLabel}>l</span>
        <span className={styles.quantumValue}>{subshell.l}</span>
      </div>
      <div className={styles.quantumRow}>
        <span className={styles.quantumLabel}>type</span>
        <span className={styles.quantumValue}>{["s", "p", "d", "f"][subshell.l]}</span>
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export default function OrbitalCloudViz({
  electronConfiguration,
  electronsPerShell,
  atomicNumber,
  categoryColor,
  theme,
}: OrbitalCloudVizProps) {
  const [selectedSubshell, setSelectedSubshell] = useState<number | null>(null);

  const subshells = useMemo(
    () => parseElectronConfiguration(electronConfiguration),
    [electronConfiguration]
  );

  const activeSubshell = selectedSubshell !== null
    ? subshells[selectedSubshell]
    : subshells[subshells.length - 1];

  const orbitals = useMemo(
    () => (activeSubshell ? expandSubshellToOrbitals(activeSubshell) : []),
    [activeSubshell]
  );

  if (subshells.length === 0) {
    return (
      <div className={styles.atomCanvas}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100%", color: "var(--text-muted)", fontSize: 13,
        }}>
          No electron configuration data available.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.atomCanvas} style={{ display: "flex", flexDirection: "column" }}>
      {/* Subshell selector */}
      <SubshellSelector
        subshells={subshells}
        selected={selectedSubshell}
        onSelect={setSelectedSubshell}
        categoryColor={categoryColor}
      />

      {/* 3D Canvas */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Canvas
          orthographic
          camera={{ position: [4, 3, 4], zoom: 120, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          <OrbitalScene
            subshells={subshells}
            selectedSubshell={selectedSubshell}
            categoryColor={categoryColor}
            theme={theme}
          />
        </Canvas>

        {/* Quantum numbers overlay */}
        <QuantumNumbers subshell={activeSubshell} orbitals={orbitals} />
      </div>
    </div>
  );
}
