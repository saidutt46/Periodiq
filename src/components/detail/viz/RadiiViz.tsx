"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import styles from "../DetailPage.module.css";

interface RadiiVizProps {
  atomicRadius: number | null;
  covalentRadius: number | null;
  vanDerWaalsRadius: number | null;
  categoryColor: string;
  symbol: string;
  theme: "dark" | "light";
}

/* ─── Equator ring (dashed circle at the midline of a sphere) ─── */
function EquatorRing({ radius, color, opacity }: { radius: number; color: string; opacity: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return pts;
  }, [radius]);

  return <Line points={points} color={color} lineWidth={1.5} transparent opacity={opacity} />;
}

/* ─── Scene ─── */
function RadiiScene({
  atomicRadius,
  covalentRadius,
  vanDerWaalsRadius,
  categoryColor,
  symbol,
  theme,
}: RadiiVizProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
  });

  // Normalize radii to scene scale (pm → scene units)
  const maxR = Math.max(atomicRadius || 0, covalentRadius || 0, vanDerWaalsRadius || 0, 100);
  const scale = 1.6 / maxR;

  const cov = covalentRadius ? covalentRadius * scale : null;
  const atom = atomicRadius ? atomicRadius * scale : null;
  const vdw = vanDerWaalsRadius ? vanDerWaalsRadius * scale : null;

  const bloomIntensity = theme === "light" ? 0.25 : 0.5;

  // Fixed color palette — warm core to cool outer, always readable
  const innerHex = "#f59e0b"; // amber — covalent (bonding, compact)
  const midHex = "#3b82f6";   // blue — atomic (empirical boundary)
  const outerHex = "#8b5cf6"; // purple — van der Waals (influence zone)

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />

      <Sparkles count={30} scale={6} size={1} speed={0.2} opacity={0.06} color={categoryColor} />

      <group ref={groupRef}>
        {/* ── Van der Waals (outermost) — wireframe style ── */}
        {vdw && (
          <group>
            <mesh>
              <sphereGeometry args={[vdw, 32, 32]} />
              <meshBasicMaterial
                color={outerHex}
                transparent
                opacity={0.04}
                side={THREE.DoubleSide}
                depthWrite={false}
                wireframe
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[vdw, 24, 24]} />
              <meshBasicMaterial
                color={outerHex}
                transparent
                opacity={0.03}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            <EquatorRing radius={vdw} color={outerHex} opacity={0.25} />
            {/* Label */}
            <Html position={[vdw + 0.12, 0, 0]} center>
              <span style={{
                color: "var(--text-dim)",
                fontSize: 8,
                fontFamily: "var(--font-mono)",
                whiteSpace: "nowrap",
                opacity: 0.7,
              }}>
                vdW
              </span>
            </Html>
          </group>
        )}

        {/* ── Atomic radius (middle) — soft translucent boundary ── */}
        {atom && (
          <group>
            <mesh>
              <sphereGeometry args={[atom, 32, 32]} />
              <meshBasicMaterial
                color={midHex}
                transparent
                opacity={0.1}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            <EquatorRing radius={atom} color={midHex} opacity={0.4} />
            <Html position={[atom + 0.12, 0, 0]} center>
              <span style={{
                color: "var(--text-muted)",
                fontSize: 8,
                fontFamily: "var(--font-mono)",
                whiteSpace: "nowrap",
                opacity: 0.8,
              }}>
                atomic
              </span>
            </Html>
          </group>
        )}

        {/* ── Covalent radius (innermost) — solid bonding shell ── */}
        {cov && (
          <group>
            <mesh>
              <sphereGeometry args={[cov, 32, 32]} />
              <meshStandardMaterial
                color={innerHex}
                emissive={innerHex}
                emissiveIntensity={0.2}
                transparent
                opacity={0.35}
                roughness={1}
                metalness={0}
              />
            </mesh>
            <EquatorRing radius={cov} color={innerHex} opacity={0.6} />
            <Html position={[cov + 0.12, 0, 0]} center>
              <span style={{
                color: "var(--text-secondary)",
                fontSize: 8,
                fontFamily: "var(--font-mono)",
                whiteSpace: "nowrap",
              }}>
                cov
              </span>
            </Html>
          </group>
        )}

        {/* Nucleus dot */}
        <mesh>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Element symbol at center */}
        <Html position={[0, -0.15, 0]} center>
          <span style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "var(--font-sans)",
            opacity: 0.7,
          }}>
            {symbol}
          </span>
        </Html>
      </group>

      <EffectComposer multisampling={0}>
        <Bloom intensity={bloomIntensity} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>

      <OrbitControls enablePan={false} enableZoom={true} minDistance={2.5} maxDistance={20} dampingFactor={0.08} enableDamping zoomSpeed={0.5} />
    </>
  );
}

export default function RadiiViz(props: RadiiVizProps) {
  const hasData = props.atomicRadius || props.covalentRadius || props.vanDerWaalsRadius;

  if (!hasData) {
    return (
      <div className={styles.atomCanvas}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100%", color: "var(--text-muted)", fontSize: 13,
        }}>
          No radius data available for this element.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.atomCanvas} style={{ position: "relative" }}>
      <Canvas
        camera={{ position: [0, 3.5, 4.5], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <RadiiScene {...props} />
      </Canvas>

      {/* Legend overlay */}
      <div className={styles.radiiLegend}>
        {props.covalentRadius && (
          <div className={styles.radiiLegendItem}>
            <div className={styles.radiiLegendDot} style={{ background: "#f59e0b" }} />
            Covalent {props.covalentRadius} pm
          </div>
        )}
        {props.atomicRadius && (
          <div className={styles.radiiLegendItem}>
            <div className={styles.radiiLegendDot} style={{ background: "#3b82f6", opacity: 0.6 }} />
            Atomic {props.atomicRadius} pm
          </div>
        )}
        {props.vanDerWaalsRadius && (
          <div className={styles.radiiLegendItem}>
            <div className={styles.radiiLegendDot} style={{
              background: "transparent",
              border: "1.5px solid #8b5cf6",
            }} />
            vdW {props.vanDerWaalsRadius} pm
          </div>
        )}
      </div>
    </div>
  );
}
