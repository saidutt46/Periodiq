"use client";

export function CommandBar() {
  return (
    <nav className="glass fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center rounded-[14px] p-1">
      <button
        className="flex items-center gap-2 px-4 py-[7px] rounded-[10px] text-[var(--text-muted)] text-xs
                   transition-all duration-150 hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
        title="Search elements (⌘K)"
        onClick={() => { const fn = (window as unknown as Record<string, () => void>).__openSearch; if (fn) fn(); }}
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
        Search elements
        <kbd className="text-[10px] px-1.5 py-px rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-sans">
          ⌘K
        </kbd>
      </button>
    </nav>
  );
}
