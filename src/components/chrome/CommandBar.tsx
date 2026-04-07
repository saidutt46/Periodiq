"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Table", href: "/" },
  { label: "List", href: "/list" },
  { label: "Compounds", href: "/compounds" },
  { label: "Compare", href: "/compare" },
] as const;

export function CommandBar() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 rounded-[14px] p-1">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              px-4 py-[7px] rounded-[10px] text-xs font-medium no-underline whitespace-nowrap
              transition-all duration-150
              ${
                isActive
                  ? "text-[var(--text-primary)] bg-[var(--bg-surface)] shadow-sm font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]"
              }
            `}
          >
            {tab.label}
          </Link>
        );
      })}

      <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

      <button
        className="flex items-center gap-1.5 px-3 py-[7px] rounded-[10px] text-[var(--text-muted)] text-xs
                   transition-all duration-150 hover:text-[var(--text-secondary)] hover:bg-white/[0.04]"
        title="Search elements (⌘K)"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search
        <kbd className="text-[10px] px-1.5 py-px rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-sans">
          ⌘K
        </kbd>
      </button>
    </nav>
  );
}
