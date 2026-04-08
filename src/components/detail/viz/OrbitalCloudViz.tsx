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
      const s = 1 + Math.sin(t * breatheSpeed) * 0.02;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.12}
        transparent
        opacity={opacity}
        roughness={0.35}
        metalness={0.05}
        side={THREE.DoubleSide}
        depthWrite={false}
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
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/* ─── Scene ─── */
function OrbitalScene({
  visibleOrbitals,
  categoryColor,
  negativeColor,
  theme,
  axisSize,
}: {
  visibleOrbitals: OrbitalInfo[];
  categoryColor: string;
  negativeColor: string;
  theme: "dark" | "light";
  axisSize: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  const bloomIntensity = theme === "light" ? 0.25 : 0.5;
  // When showing all, reduce opacity so overlapping shapes don't become opaque
  const lobeOpacity = visibleOrbitals.length > 1 ? 0.35 : 0.55;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <directionalLight position={[-3, -2, -4]} intensity={0.3} />

      <Sparkles count={40} scale={8} size={1} speed={0.2} opacity={0.07} color={categoryColor} />

      <group ref={groupRef}>
        <NucleusDot color={categoryColor} />

        {visibleOrbitals.map((orbital) => (
          <OrbitalShape
            key={`${orbital.n}-${orbital.l}-${orbital.m}`}
            orbital={orbital}
            positiveColor={categoryColor}
            negativeColor={negativeColor}
            opacity={lobeOpacity}
          />
        ))}
      </group>

      <AxisLines size={axisSize} theme={theme} />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.4}
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

/* ─── Subshell + Orbital Selector UI ─── */
function OrbitalSelector({
  subshells,
  selectedSubshellIdx,
  selectedOrbitalIdx,
  onSelectSubshell,
  onSelectOrbital,
  orbitals,
  categoryColor,
}: {
  subshells: SubshellInfo[];
  selectedSubshellIdx: number;
  selectedOrbitalIdx: number;
  onSelectSubshell: (idx: number) => void;
  onSelectOrbital: (idx: number) => void;
  orbitals: OrbitalInfo[];
  categoryColor: string;
}) {
  // Show last 8 subshells max
  const visibleShells = subshells.slice(-8);
  const offset = subshells.length - visibleShells.length;

  return (
    <div style={{ flexShrink: 0, padding: "6px 12px", display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
      {/* Subshell row */}
      <div className="glass flex items-center gap-0 rounded-[12px] p-0.5">
        {visibleShells.map((sub, i) => {
          const realIdx = i + offset;
          const isActive = selectedSubshellIdx === realIdx;
          return (
            <button
              key={sub.label}
              onClick={() => onSelectSubshell(realIdx)}
              className={`
                px-2.5 py-1 rounded-[8px] text-[10px] font-medium whitespace-nowrap
                transition-all duration-150 cursor-pointer
                ${isActive
                  ? "text-[var(--accent-primary)] bg-[rgba(212,168,67,0.1)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }
              `}
            >
              {sub.label}<sup className="text-[8px] ml-0.5">{sub.electrons}</sup>
            </button>
          );
        })}
      </div>

      {/* Individual orbital row — fixed height to prevent canvas jumping */}
      <div className="flex items-center gap-1" style={{ minHeight: 22, visibility: orbitals.length > 1 ? "visible" : "hidden" }}>
        {orbitals.length > 1 && (
          <>
          {/* "All" button */}
          <button
            onClick={() => onSelectOrbital(-1)}
            className={`
              px-2 py-0.5 rounded-[6px] text-[9px] font-medium whitespace-nowrap
              transition-all duration-150 cursor-pointer border
              ${selectedOrbitalIdx === -1
                ? "font-semibold bg-[rgba(255,255,255,0.05)]"
                : "text-[var(--text-dim)] hover:text-[var(--text-muted)] border-transparent"
              }
            `}
            style={selectedOrbitalIdx === -1 ? { borderColor: categoryColor, color: categoryColor } : undefined}
          >
            All
          </button>
          <div className="w-px h-3 bg-[var(--border-subtle)] mx-0.5" />
          {orbitals.map((orb, i) => {
            const isActive = selectedOrbitalIdx === i;
            const label = getOrbitalLabel(orb.l, orb.m);
            return (
              <button
                key={`${orb.l}-${orb.m}`}
                onClick={() => onSelectOrbital(i)}
                className={`
                  px-2 py-0.5 rounded-[6px] text-[9px] font-medium whitespace-nowrap
                  transition-all duration-150 cursor-pointer border
                  ${isActive
                    ? "font-semibold bg-[rgba(255,255,255,0.05)]"
                    : "text-[var(--text-dim)] hover:text-[var(--text-muted)] border-transparent"
                  }
                `}
                style={isActive ? { borderColor: categoryColor, color: categoryColor } : undefined}
              >
                {label}
                {orb.electrons === 2 && <span className="ml-0.5 opacity-50">↑↓</span>}
                {orb.electrons === 1 && <span className="ml-0.5 opacity-50">↑</span>}
              </button>
            );
          })}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Quantum Number Display ─── */
function QuantumNumbers({ orbital }: { orbital: OrbitalInfo | null }) {
  if (!orbital) return null;

  const typeLabel = ["s", "p", "d", "f"][orbital.l] || "?";
  const nameLabel = getOrbitalLabel(orbital.l, orbital.m);

  return (
    <div className={styles.quantumNumbers}>
      <div className={styles.quantumRow}>
        <span className={styles.quantumLabel}>n</span>
        <span className={styles.quantumValue}>{orbital.n}</span>
      </div>
      <div className={styles.quantumRow}>
        <span className={styles.quantumLabel}>l</span>
        <span className={styles.quantumValue}>{orbital.l}</span>
      </div>
      <div className={styles.quantumRow}>
        <span className={styles.quantumLabel}>m</span>
        <span className={styles.quantumValue}>{orbital.m}</span>
      </div>
      <div className={styles.quantumRow}>
        <span className={styles.quantumLabel}>orbital</span>
        <span className={styles.quantumValue}>{nameLabel}</span>
      </div>
      <div className={styles.quantumRow}>
        <span className={styles.quantumLabel}>e⁻</span>
        <span className={styles.quantumValue}>{orbital.electrons}</span>
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
  const subshells = useMemo(
    () => parseElectronConfiguration(electronConfiguration),
    [electronConfiguration]
  );

  // Default to the last (valence) subshell
  const [selectedSubshellIdx, setSelectedSubshellIdx] = useState(
    () => Math.max(subshells.length - 1, 0)
  );
  const [selectedOrbitalIdx, setSelectedOrbitalIdx] = useState(0);

  const activeSubshell = subshells[selectedSubshellIdx] || null;

  const orbitals = useMemo(
    () => (activeSubshell ? expandSubshellToOrbitals(activeSubshell) : []),
    [activeSubshell]
  );

  // Reset orbital index when subshell changes
  const handleSubshellChange = (idx: number) => {
    setSelectedSubshellIdx(idx);
    setSelectedOrbitalIdx(0);
  };

  // -1 = show all orbitals, >= 0 = show one
  const visibleOrbitals = selectedOrbitalIdx === -1
    ? orbitals
    : [orbitals[selectedOrbitalIdx] || orbitals[0]].filter(Boolean);

  // For quantum number display: show the single selected, or null when "All"
  const displayOrbital = selectedOrbitalIdx >= 0
    ? (orbitals[selectedOrbitalIdx] || orbitals[0] || null)
    : null;

  // Complementary color for negative lobes
  const negativeColor = useMemo(() => {
    const c = new THREE.Color(categoryColor);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    c.setHSL((hsl.h + 0.55) % 1, hsl.s * 0.8, hsl.l);
    return "#" + c.getHexString();
  }, [categoryColor]);

  const axisSize = activeSubshell ? 0.6 + activeSubshell.n * 0.35 + 0.5 : 2;

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
      {/* Subshell + orbital selector */}
      <OrbitalSelector
        subshells={subshells}
        selectedSubshellIdx={selectedSubshellIdx}
        selectedOrbitalIdx={selectedOrbitalIdx}
        onSelectSubshell={handleSubshellChange}
        onSelectOrbital={setSelectedOrbitalIdx}
        orbitals={orbitals}
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
            visibleOrbitals={visibleOrbitals}
            categoryColor={categoryColor}
            negativeColor={negativeColor}
            theme={theme}
            axisSize={axisSize}
          />
        </Canvas>

        {/* Quantum numbers overlay — hidden in "All" mode */}
        <QuantumNumbers orbital={displayOrbital} />
      </div>
    </div>
  );
}
