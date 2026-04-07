"use client";

import { useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import styles from "./TemperatureSlider.module.css";

const MIN_TEMP = 0;
const MAX_TEMP = 6000;

function kelvinToCelsius(k: number): number {
  return Math.round(k - 273.15);
}

export function TemperatureSlider() {
  const temperature = useAppStore((s) => s.temperature);
  const setTemperature = useAppStore((s) => s.setTemperature);
  const coloringMode = useAppStore((s) => s.coloringMode);
  const trackRef = useRef<HTMLDivElement>(null);

  const progress = ((temperature - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * 100;

  const handleTrackInteraction = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setTemperature(Math.round(MIN_TEMP + ratio * (MAX_TEMP - MIN_TEMP)));
    },
    [setTemperature]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleTrackInteraction(e.clientX);
      const onMove = (ev: MouseEvent) => handleTrackInteraction(ev.clientX);
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [handleTrackInteraction]
  );

  const step = useCallback(
    (delta: number) => {
      setTemperature(Math.max(MIN_TEMP, Math.min(MAX_TEMP, temperature + delta)));
    },
    [temperature, setTemperature]
  );

  const isStateMode = coloringMode === "state";

  return (
    <div className={`${styles.strip} ${isStateMode ? styles.active : ""}`}>
      <span className={styles.label}>Temperature</span>

      <button
        className={styles.stepBtn}
        onClick={() => step(-50)}
        title="Decrease temperature"
      >
        −
      </button>

      {/* Track */}
      <div
        className={styles.track}
        ref={trackRef}
        onMouseDown={handleMouseDown}
        role="slider"
        aria-label="Temperature"
        aria-valuemin={MIN_TEMP}
        aria-valuemax={MAX_TEMP}
        aria-valuenow={temperature}
        tabIndex={0}
        onKeyDown={(e) => {
          const s = e.shiftKey ? 100 : 10;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(s);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-s);
          }
        }}
      >
        <div className={styles.trackBg} />
        <div className={styles.trackFill} style={{ width: `${progress}%` }} />
        <div className={styles.thumb} style={{ left: `${progress}%` }}>
          <div className={styles.thumbDot} />
        </div>
      </div>

      <button
        className={styles.stepBtn}
        onClick={() => step(50)}
        title="Increase temperature"
      >
        +
      </button>

      {/* Readout */}
      <div className={styles.readout}>
        <span className={styles.readoutValue}>{kelvinToCelsius(temperature)}</span>
        <span className={styles.readoutUnit}>°C</span>
        <span className={styles.readoutAlt}>
          {temperature.toLocaleString()} K
        </span>
      </div>

      {/* Phase legend — state mode only */}
      {isStateMode && (
        <div className={styles.phases}>
          <span className={styles.phase} style={{ "--pc": "#64748b" } as React.CSSProperties}>
            <span className={styles.phaseDot} />
            Solid
          </span>
          <span className={styles.phase} style={{ "--pc": "#f472b6" } as React.CSSProperties}>
            <span className={styles.phaseDot} />
            Liquid
          </span>
          <span className={styles.phase} style={{ "--pc": "#22d3ee" } as React.CSSProperties}>
            <span className={styles.phaseDot} />
            Gas
          </span>
        </div>
      )}
    </div>
  );
}
