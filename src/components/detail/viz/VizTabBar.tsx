"use client";

export type VizTab = "bohr" | "orbitals" | "crystal" | "radii";

interface VizTabBarProps {
  activeTab: VizTab;
  onTabChange: (tab: VizTab) => void;
  disabledTabs?: VizTab[];
}

const TAB_CONFIG: { id: VizTab; label: string }[] = [
  { id: "bohr", label: "Bohr" },
  { id: "orbitals", label: "Orbitals" },
  { id: "crystal", label: "Crystal" },
  { id: "radii", label: "Radii" },
];

export default function VizTabBar({
  activeTab,
  onTabChange,
  disabledTabs = [],
}: VizTabBarProps) {
  return (
    <div className="flex items-center justify-center py-2 px-4 flex-shrink-0 z-10">
      <div className="glass flex items-center gap-0 rounded-[14px] p-1">
        {TAB_CONFIG.map((tab) => {
          const isDisabled = disabledTabs.includes(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              title={isDisabled ? `No ${tab.label.toLowerCase()} data` : tab.label}
              className={`
                px-3 py-1.5 rounded-[10px] text-[11px] font-medium whitespace-nowrap
                transition-all duration-150
                ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                ${
                  isActive
                    ? "text-[var(--accent-primary)] bg-[rgba(212,168,67,0.1)] font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
