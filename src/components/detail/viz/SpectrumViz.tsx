"use client";

import { useRef, useEffect, useMemo } from "react";
import styles from "../DetailPage.module.css";

interface SpectrumVizProps {
  ionizationEnergy: number | null;
  ionizationEnergies: number[];
  categoryColor: string;
  symbol: string;
  name: string;
  atomicNumber: number;
}

/* ─── Wavelength to RGB ─── */
function wavelengthToRGB(wavelength: number): [number, number, number] {
  let r = 0, g = 0, b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1;
  }

  // Intensity falloff at edges
  let factor = 1;
  if (wavelength >= 380 && wavelength < 420) factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  else if (wavelength >= 700 && wavelength <= 780) factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);

  return [r * factor, g * factor, b * factor];
}

/* ─── Generate approximate spectral lines from atomic number ─── */
function generateSpectralLines(atomicNumber: number, ionizationEnergy: number | null): { wavelength: number; intensity: number }[] {
  // Use a deterministic approach based on atomic number to create characteristic lines
  // This simulates the Balmer/Lyman-like series patterns
  const lines: { wavelength: number; intensity: number }[] = [];

  // Rydberg-like formula for hydrogen-like transitions: 1/λ = R * Z_eff² * (1/n1² - 1/n2²)
  const R = 1.097e-2; // Rydberg constant in nm⁻¹ (adjusted for visible range)
  const Zeff = Math.sqrt(atomicNumber); // very rough effective nuclear charge

  // Generate transitions for the visible range
  for (let n1 = 1; n1 <= 4; n1++) {
    for (let n2 = n1 + 1; n2 <= n1 + 6; n2++) {
      const invLambda = R * (Zeff / (n1 + atomicNumber * 0.1)) * (1 / (n1 * n1) - 1 / (n2 * n2));
      if (invLambda > 0) {
        const lambda = 1 / invLambda;
        if (lambda >= 380 && lambda <= 780) {
          const intensity = 1 / (n2 - n1) * (n1 === 1 ? 1 : 0.6);
          lines.push({ wavelength: lambda, intensity: Math.min(intensity, 1) });
        }
      }
    }
  }

  // Add some characteristic lines based on atomic number modulation
  const seed = atomicNumber * 7.31;
  for (let i = 0; i < 3 + (atomicNumber % 5); i++) {
    const wl = 400 + ((seed * (i + 1) * 17.3) % 350);
    if (wl >= 380 && wl <= 780) {
      lines.push({ wavelength: wl, intensity: 0.3 + (i % 3) * 0.25 });
    }
  }

  return lines;
}

/* ─── Canvas rendering ─── */
function drawSpectrum(
  canvas: HTMLCanvasElement,
  lines: { wavelength: number; intensity: number }[],
  categoryColor: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Black background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  // Draw continuous spectrum (very dim)
  for (let x = 0; x < w; x++) {
    const wavelength = 380 + (x / w) * 400;
    const [r, g, b] = wavelengthToRGB(wavelength);
    ctx.fillStyle = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 0.06)`;
    ctx.fillRect(x, 0, 1, h);
  }

  // Draw emission lines
  for (const line of lines) {
    const x = ((line.wavelength - 380) / 400) * w;
    const [r, g, b] = wavelengthToRGB(line.wavelength);

    // Glow
    const gradient = ctx.createLinearGradient(x - 8, 0, x + 8, 0);
    gradient.addColorStop(0, `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 0)`);
    gradient.addColorStop(0.5, `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${line.intensity * 0.4})`);
    gradient.addColorStop(1, `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 8, 0, 16, h);

    // Core line
    ctx.fillStyle = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${line.intensity})`;
    ctx.fillRect(Math.round(x) - 1, 0, 2, h);

    // Bright center
    ctx.fillStyle = `rgba(255, 255, 255, ${line.intensity * 0.5})`;
    ctx.fillRect(Math.round(x), 0, 1, h);
  }
}

export default function SpectrumViz({
  ionizationEnergy,
  ionizationEnergies,
  categoryColor,
  symbol,
  name,
  atomicNumber,
}: SpectrumVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lines = useMemo(
    () => generateSpectralLines(atomicNumber, ionizationEnergy),
    [atomicNumber, ionizationEnergy]
  );

  useEffect(() => {
    if (canvasRef.current) {
      drawSpectrum(canvasRef.current, lines, categoryColor);
    }
  }, [lines, categoryColor]);

  return (
    <div className={styles.spectrumContainer}>
      <div className={styles.spectrumLabel}>
        Emission Spectrum — {name} ({symbol})
      </div>

      <div className={styles.spectrumStrip}>
        <canvas
          ref={canvasRef}
          width={600}
          height={80}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 500, padding: "0 4px" }}>
        <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>380 nm</span>
        <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>UV ← Visible → IR</span>
        <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>780 nm</span>
      </div>

      <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", maxWidth: 400, lineHeight: 1.6 }}>
        Approximate emission spectrum based on atomic energy levels.
        Each bright line represents a photon emitted during an electron transition.
      </div>
    </div>
  );
}
