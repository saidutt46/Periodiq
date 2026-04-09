"use client";

import { useAppStore } from "@/lib/store";

export function UtilityBar() {
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <div className="glass fixed top-4 right-6 z-50 flex items-center rounded-xl p-1">
      <button
        onClick={toggleTheme}
        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[var(--text-muted)]
                   transition-all duration-150 hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
        title="Toggle theme"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>
    </div>
  );
}
