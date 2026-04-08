"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import styles from "../DetailPage.module.css";

interface CrystalStructureVizProps {
  crystalStructure: string;
  categoryColor: string;
  atomicRadius: number | null;
  theme: "dark" | "light";
}

/* ─── Unit cell generators ─── */
interface UnitCell {
  atoms: [number, number, number][];
  edges: [[number, number, number], [number, number, number]][];
  label: string;
}

function normalizeCrystalName(raw: string): string {
  const lower = raw.toLowerCase().replace(/[^a-z ]/g, "").trim();
  if (lower.includes("body") && lower.includes("cubic")) return "bcc";
  if (lower.includes("face") && lower.includes("cubic")) return "fcc";
  if (lower.includes("hexagonal")) return "hcp";
  if (lower.includes("diamond")) return "diamond";
  if (lower.includes("simple") && lower.includes("cubic")) return "sc";
  if (lower.includes("orthorhombic")) return "ortho";
  if (lower.includes("tetragonal")) return "tetra";
  if (lower.includes("monoclinic")) return "mono";
  if (lower.includes("rhombohedral") || lower.includes("trigonal")) return "rhombo";
  if (lower.includes("cubic")) return "fcc"; // default cubic
  return "sc"; // fallback
}

function generateUnitCell(type: string): UnitCell {
  const s = 1.2; // half-size
  // Cube corners
  const corners: [number, number, number][] = [
    [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
    [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
  ];
  // Cube edges
  const cubeEdges: [[number, number, number], [number, number, number]][] = [
    [corners[0], corners[1]], [corners[1], corners[2]], [corners[2], corners[3]], [corners[3], corners[0]],
    [corners[4], corners[5]], [corners[5], corners[6]], [corners[6], corners[7]], [corners[7], corners[4]],
    [corners[0], corners[4]], [corners[1], corners[5]], [corners[2], corners[6]], [corners[3], corners[7]],
  ];

  switch (type) {
    case "bcc":
      return {
        atoms: [...corners, [0, 0, 0]],
        edges: cubeEdges,
        label: "Body-Centered Cubic",
      };
    case "fcc":
      return {
        atoms: [
          ...corners,
          [0, 0, -s], [0, 0, s], // face centers z
          [-s, 0, 0], [s, 0, 0], // face centers x
          [0, -s, 0], [0, s, 0], // face centers y
        ],
        edges: cubeEdges,
        label: "Face-Centered Cubic",
      };
    case "hcp": {
      const h = s * 1.633; // c/a ratio
      const atoms: [number, number, number][] = [
        // Bottom layer
        [0, -h / 2, 0], [s, -h / 2, 0], [s / 2, -h / 2, s * 0.866],
        // Top layer
        [0, h / 2, 0], [s, h / 2, 0], [s / 2, h / 2, s * 0.866],
        // Middle interstitial
        [s / 2, 0, s * 0.289],
      ];
      return { atoms, edges: cubeEdges.slice(0, 6), label: "Hexagonal Close-Packed" };
    }
    case "diamond":
      return {
        atoms: [
          ...corners,
          [0, 0, 0],
          [-s / 2, -s / 2, -s / 2], [s / 2, s / 2, -s / 2],
          [s / 2, -s / 2, s / 2], [-s / 2, s / 2, s / 2],
        ],
        edges: cubeEdges,
        label: "Diamond Cubic",
      };
    default: // simple cubic or fallback
      return {
        atoms: corners,
        edges: cubeEdges,
        label: type === "ortho" ? "Orthorhombic" : type === "tetra" ? "Tetragonal" : type === "mono" ? "Monoclinic" : type === "rhombo" ? "Rhombohedral" : "Simple Cubic",
      };
  }
}

/* ─── Scene ─── */
function CrystalScene({ crystalStructure, categoryColor, theme }: CrystalStructureVizProps) {
  const groupRef = useRef<THREE.Group>(null);
  const type = normalizeCrystalName(crystalStructure);
  const cell = useMemo(() => generateUnitCell(type), [type]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
  });

  const bloomIntensity = theme === "light" ? 0.4 : 0.8;
  const edgeColor = theme === "light" ? "#999" : "#555";

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, -2, -4]} intensity={0.3} />

      <Sparkles count={40} scale={6} size={1} speed={0.2} opacity={0.08} color={categoryColor} />

      <group ref={groupRef}>
        {/* Wireframe edges */}
        {cell.edges.map((edge, i) => (
          <Line key={i} points={edge} color={edgeColor} lineWidth={1} transparent opacity={0.4} />
        ))}

        {/* Atoms */}
        {cell.atoms.map((pos, i) => {
          const isCorner = i < 8;
          return (
            <mesh key={i} position={pos}>
              <sphereGeometry args={[isCorner ? 0.12 : 0.16, 24, 24]} />
              <meshPhysicalMaterial
                color={categoryColor}
                emissive={categoryColor}
                emissiveIntensity={isCorner ? 0.2 : 0.5}
                roughness={0.2}
                metalness={0.4}
                transparent
                opacity={isCorner ? 0.5 : 0.85}
                toneMapped={false}
              />
            </mesh>
          );
        })}

        {/* Structure label */}
        <Html position={[0, -2, 0]} center>
          <div style={{
            color: "var(--text-muted)",
            fontSize: 11,
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}>
            {cell.label}
          </div>
        </Html>
      </group>

      <EffectComposer multisampling={0}>
        <Bloom intensity={bloomIntensity} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>

      <OrbitControls enablePan={false} enableZoom={true} minDistance={3} maxDistance={20} dampingFactor={0.08} enableDamping zoomSpeed={0.5} />
    </>
  );
}

export default function CrystalStructureViz(props: CrystalStructureVizProps) {
  return (
    <div className={styles.atomCanvas}>
      <Canvas
        camera={{ position: [3.5, 2.8, 4.5], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <CrystalScene {...props} />
      </Canvas>
    </div>
  );
}
