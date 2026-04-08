"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Html } from "@react-three/drei";
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

function RadiiScene({
  atomicRadius,
  covalentRadius,
  vanDerWaalsRadius,
  categoryColor,
  theme,
}: RadiiVizProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
  });

  // Normalize radii to scene scale (pm → scene units)
  const maxR = Math.max(atomicRadius || 0, covalentRadius || 0, vanDerWaalsRadius || 0, 100);
  const scale = 1.8 / maxR;

  const cov = covalentRadius ? covalentRadius * scale : null;
  const atom = atomicRadius ? atomicRadius * scale : null;
  const vdw = vanDerWaalsRadius ? vanDerWaalsRadius * scale : null;

  const bloomIntensity = theme === "light" ? 0.3 : 0.6;

  // Derive lighter/darker shades from category color
  const color = new THREE.Color(categoryColor);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);

  const innerColor = new THREE.Color().setHSL(hsl.h, hsl.s, Math.min(hsl.l + 0.15, 0.9));
  const midColor = new THREE.Color().setHSL(hsl.h, hsl.s * 0.8, hsl.l);
  const outerColor = new THREE.Color().setHSL(hsl.h, hsl.s * 0.6, Math.max(hsl.l - 0.1, 0.15));

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-3, -2, -4]} intensity={0.3} />

      <Sparkles count={40} scale={6} size={1} speed={0.2} opacity={0.08} color={categoryColor} />

      <group ref={groupRef}>
        {/* Van der Waals (outermost) */}
        {vdw && (
          <mesh>
            <sphereGeometry args={[vdw, 48, 48]} />
            <meshPhysicalMaterial
              color={"#" + outerColor.getHexString()}
              transparent
              opacity={0.08}
              roughness={0.1}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* Atomic (middle) */}
        {atom && (
          <mesh>
            <sphereGeometry args={[atom, 48, 48]} />
            <meshPhysicalMaterial
              color={"#" + midColor.getHexString()}
              emissive={"#" + midColor.getHexString()}
              emissiveIntensity={0.15}
              transparent
              opacity={0.18}
              roughness={0.2}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* Covalent (innermost) */}
        {cov && (
          <mesh>
            <sphereGeometry args={[cov, 48, 48]} />
            <meshPhysicalMaterial
              color={"#" + innerColor.getHexString()}
              emissive={"#" + innerColor.getHexString()}
              emissiveIntensity={0.4}
              transparent
              opacity={0.4}
              roughness={0.15}
              metalness={0.3}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* Tiny nucleus dot */}
        <mesh>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </group>

      <EffectComposer multisampling={0}>
        <Bloom intensity={bloomIntensity} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
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
        camera={{ position: [0, 0, 5.5], fov: 45, near: 0.1, far: 100 }}
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
            <div className={styles.radiiLegendDot} style={{ background: props.categoryColor, opacity: 0.8 }} />
            Covalent {props.covalentRadius} pm
          </div>
        )}
        {props.atomicRadius && (
          <div className={styles.radiiLegendItem}>
            <div className={styles.radiiLegendDot} style={{ background: props.categoryColor, opacity: 0.4 }} />
            Atomic {props.atomicRadius} pm
          </div>
        )}
        {props.vanDerWaalsRadius && (
          <div className={styles.radiiLegendItem}>
            <div className={styles.radiiLegendDot} style={{ background: props.categoryColor, opacity: 0.15 }} />
            vdW {props.vanDerWaalsRadius} pm
          </div>
        )}
      </div>
    </div>
  );
}
