"use client";

import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="fixed top-5 left-6 z-50 flex items-center gap-2.5 no-underline">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-extrabold text-sm"
        style={{
          background: "linear-gradient(135deg, var(--accent-primary), var(--accent-warm))",
          boxShadow: "0 2px 12px color-mix(in srgb, var(--accent-primary) 25%, transparent)",
          color: "#111",
        }}
      >
        Pq
      </div>
      <span className="font-mono font-bold text-[15px] tracking-tight text-[var(--text-primary)]">
        Periodiq
        <span className="text-[var(--accent-primary)]">.</span>
        <span className="font-normal text-[var(--text-muted)]">dev</span>
      </span>
    </Link>
  );
}
