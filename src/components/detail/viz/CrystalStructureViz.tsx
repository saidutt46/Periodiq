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

/* ─── Unit cell types & generators ─── */
interface UnitCell {
  atoms: { pos: [number, number, number]; type: "corner" | "face" | "body" | "interstitial" }[];
  edges: [[number, number, number], [number, number, number]][];
  bonds: [[number, number, number], [number, number, number]][];
  label: string;
  info: string; // e.g. "4 atoms/cell, CN=12"
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
  if (lower.includes("cubic")) return "fcc";
  return "sc";
}

function generateUnitCell(type: string): UnitCell {
  const s = 1.2; // half-size

  const corners: [number, number, number][] = [
    [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
    [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
  ];

  const cubeEdges: [[number, number, number], [number, number, number]][] = [
    [corners[0], corners[1]], [corners[1], corners[2]], [corners[2], corners[3]], [corners[3], corners[0]],
    [corners[4], corners[5]], [corners[5], corners[6]], [corners[6], corners[7]], [corners[7], corners[4]],
    [corners[0], corners[4]], [corners[1], corners[5]], [corners[2], corners[6]], [corners[3], corners[7]],
  ];

  const cornerAtoms = corners.map((pos) => ({ pos, type: "corner" as const }));

  switch (type) {
    case "bcc": {
      const center: [number, number, number] = [0, 0, 0];
      // Bonds from center to each corner
      const bonds: [[number, number, number], [number, number, number]][] =
        corners.map((c) => [center, c]);
      return {
        atoms: [...cornerAtoms, { pos: center, type: "body" }],
        edges: cubeEdges,
        bonds,
        label: "Body-Centered Cubic",
        info: "2 atoms/cell · CN 8",
      };
    }

    case "fcc": {
      const faceCenters: [number, number, number][] = [
        [0, 0, -s], [0, 0, s],
        [-s, 0, 0], [s, 0, 0],
        [0, -s, 0], [0, s, 0],
      ];
      // Bonds between nearest face-center neighbors
      const bonds: [[number, number, number], [number, number, number]][] = [];
      for (let i = 0; i < faceCenters.length; i++) {
        for (let j = i + 1; j < faceCenters.length; j++) {
          const dx = faceCenters[i][0] - faceCenters[j][0];
          const dy = faceCenters[i][1] - faceCenters[j][1];
          const dz = faceCenters[i][2] - faceCenters[j][2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < s * 1.8) bonds.push([faceCenters[i], faceCenters[j]]);
        }
      }
      return {
        atoms: [
          ...cornerAtoms,
          ...faceCenters.map((pos) => ({ pos, type: "face" as const })),
        ],
        edges: cubeEdges,
        bonds,
        label: "Face-Centered Cubic",
        info: "4 atoms/cell · CN 12",
      };
    }

    case "hcp": {
      const a = s;
      const c = s * 1.633;
      const h = c / 2;
      // Hexagonal prism vertices
      const hexAngles = [0, 60, 120, 180, 240, 300].map((d) => (d * Math.PI) / 180);
      const bottomHex = hexAngles.map((angle): [number, number, number] => [
        a * Math.cos(angle), -h, a * Math.sin(angle),
      ]);
      const topHex = hexAngles.map((angle): [number, number, number] => [
        a * Math.cos(angle), h, a * Math.sin(angle),
      ]);
      // Middle layer (3 atoms in triangular interstitial sites)
      const midAtoms: [number, number, number][] = [
        [a * 0.5, 0, a * 0.289],
        [-a * 0.25, 0, a * 0.577],
        [-a * 0.25, 0, -a * 0.289],
      ];
      // Hexagonal prism edges
      const hexEdges: [[number, number, number], [number, number, number]][] = [];
      for (let i = 0; i < 6; i++) {
        hexEdges.push([bottomHex[i], bottomHex[(i + 1) % 6]]);
        hexEdges.push([topHex[i], topHex[(i + 1) % 6]]);
        hexEdges.push([bottomHex[i], topHex[i]]);
      }
      // Bonds from mid atoms to nearest top/bottom
      const bonds: [[number, number, number], [number, number, number]][] = [];
      for (const mid of midAtoms) {
        for (const layer of [bottomHex, topHex]) {
          let closest: [number, number, number] | null = null;
          let minDist = Infinity;
          for (const v of layer) {
            const d = Math.sqrt((mid[0] - v[0]) ** 2 + (mid[1] - v[1]) ** 2 + (mid[2] - v[2]) ** 2);
            if (d < minDist) { minDist = d; closest = v; }
          }
          if (closest) bonds.push([mid, closest]);
        }
      }
      return {
        atoms: [
          ...bottomHex.map((pos) => ({ pos, type: "corner" as const })),
          ...topHex.map((pos) => ({ pos, type: "corner" as const })),
          ...midAtoms.map((pos) => ({ pos, type: "interstitial" as const })),
        ],
        edges: hexEdges,
        bonds,
        label: "Hexagonal Close-Packed",
        info: "6 atoms/cell · CN 12",
      };
    }

    case "diamond": {
      // FCC + 4 tetrahedral interstitial sites
      const tetrahedral: [number, number, number][] = [
        [-s / 2, -s / 2, -s / 2],
        [s / 2, s / 2, -s / 2],
        [s / 2, -s / 2, s / 2],
        [-s / 2, s / 2, s / 2],
      ];
      // Tetrahedral bonds (each interstitial bonds to 4 nearest neighbors)
      const allPositions = [...corners, [0, 0, -s] as [number, number, number], [0, 0, s] as [number, number, number], [-s, 0, 0] as [number, number, number], [s, 0, 0] as [number, number, number], [0, -s, 0] as [number, number, number], [0, s, 0] as [number, number, number]];
      const bonds: [[number, number, number], [number, number, number]][] = [];
      for (const t of tetrahedral) {
        const dists = allPositions.map((p) => ({
          p,
          d: Math.sqrt((t[0] - p[0]) ** 2 + (t[1] - p[1]) ** 2 + (t[2] - p[2]) ** 2),
        }));
        dists.sort((a, b) => a.d - b.d);
        for (let i = 0; i < 4 && i < dists.length; i++) {
          bonds.push([t, dists[i].p as [number, number, number]]);
        }
      }
      return {
        atoms: [
          ...cornerAtoms,
          ...tetrahedral.map((pos) => ({ pos, type: "interstitial" as const })),
        ],
        edges: cubeEdges,
        bonds,
        label: "Diamond Cubic",
        info: "8 atoms/cell · CN 4",
      };
    }

    default: {
      const labelMap: Record<string, string> = {
        ortho: "Orthorhombic",
        tetra: "Tetragonal",
        mono: "Monoclinic",
        rhombo: "Rhombohedral",
      };
      return {
        atoms: cornerAtoms,
        edges: cubeEdges,
        bonds: [],
        label: labelMap[type] || "Simple Cubic",
        info: type === "sc" ? "1 atom/cell · CN 6" : "—",
      };
    }
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
  const edgeColor = theme === "light" ? "#777" : "#666";
  const bondColor = categoryColor;

  // Atom sizing by type
  const atomSize = (atomType: string) => {
    switch (atomType) {
      case "corner": return 0.1;
      case "face": return 0.13;
      case "body": return 0.16;
      case "interstitial": return 0.14;
      default: return 0.12;
    }
  };

  const atomOpacity = (atomType: string) => {
    switch (atomType) {
      case "corner": return 0.4;  // shared between 8 cells
      case "face": return 0.6;    // shared between 2 cells
      default: return 0.9;        // fully inside cell
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, -2, -4]} intensity={0.3} />

      <Sparkles count={30} scale={6} size={1} speed={0.2} opacity={0.06} color={categoryColor} />

      <group ref={groupRef}>
        {/* Wireframe edges */}
        {cell.edges.map((edge, i) => (
          <Line key={`e-${i}`} points={edge} color={edgeColor} lineWidth={1} transparent opacity={0.5} />
        ))}

        {/* Bonds */}
        {cell.bonds.map((bond, i) => (
          <Line key={`b-${i}`} points={bond} color={bondColor} lineWidth={1.5} transparent opacity={0.35} />
        ))}

        {/* Atoms */}
        {cell.atoms.map((atom, i) => (
          <mesh key={i} position={atom.pos}>
            <sphereGeometry args={[atomSize(atom.type), 24, 24]} />
            <meshPhysicalMaterial
              color={categoryColor}
              emissive={categoryColor}
              emissiveIntensity={atom.type === "corner" ? 0.2 : 0.5}
              roughness={0.2}
              metalness={0.4}
              transparent
              opacity={atomOpacity(atom.type)}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Fixed label outside the rotating group */}
      <Html position={[0, -2.2, 0]} center>
        <div style={{
          textAlign: "center",
          whiteSpace: "nowrap",
        }}>
          <div style={{
            color: "var(--text-secondary)",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
          }}>
            {cell.label}
          </div>
          <div style={{
            color: "var(--text-dim)",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            marginTop: 2,
          }}>
            {cell.info}
          </div>
        </div>
      </Html>

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
