"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { elements } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { CATEGORY_CSS_VAR } from "@/lib/chemistry/colors";
import { searchElements, getCategoryOptions, filterByCategory } from "@/lib/search";
import type { ElementCategory } from "@/lib/types";
import styles from "./SearchPalette.module.css";

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ElementCategory | null>(null);
  const router = useRouter();
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveCategory(null);
    }
  }, [open]);

  // Handle backspace on empty input to clear category
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Backspace" || e.key === "Delete") && query === "" && activeCategory) {
        e.preventDefault();
        setActiveCategory(null);
      }
    },
    [query, activeCategory]
  );

  // Search results
  const searchResults = useMemo(() => {
    if (activeCategory) {
      const filtered = filterByCategory(elements, activeCategory);
      if (!query) return filtered;
      return searchElements(filtered, query).map((r) => r.element);
    }
    if (!query) return [];
    return searchElements(elements, query).map((r) => r.element);
  }, [query, activeCategory]);

  // Category options
  const categoryOptions = useMemo(() => getCategoryOptions(elements), []);

  const navigateToElement = useCallback(
    (symbol: string) => {
      setOpen(false);
      router.push(`/element/${symbol}`);
    },
    [router]
  );

  const handleCategorySelect = useCallback((category: ElementCategory) => {
    setActiveCategory(category);
    setQuery("");
  }, []);

  const clearCategory = useCallback(() => {
    setActiveCategory(null);
    setQuery("");
  }, []);

  return (
    <>
      {/* Trigger — called from CommandBar */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search elements"
        className={styles.dialog}
        shouldFilter={false}
      >
        {/* Backdrop */}
        <div className={styles.backdrop} onClick={() => setOpen(false)} />

        <div className={styles.dialogContent}>
          <DialogTitle className="sr-only">Search elements</DialogTitle>
          <DialogDescription className="sr-only">Search by name, symbol, or atomic number</DialogDescription>

          {/* Search input */}
          <div className={styles.inputArea}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            {activeCategory && (
              <button className={styles.categoryChip} onClick={clearCategory}>
                <span className={styles.categoryChipDot} style={{ background: `var(--cat-${activeCategory})` }} />
                {categoryOptions.find((c) => c.category === activeCategory)?.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            <Command.Input
              className={styles.input}
              placeholder={activeCategory ? "Filter elements..." : "Search elements..."}
              value={query}
              onValueChange={setQuery}
              onKeyDown={handleInputKeyDown}
            />
            <kbd className={styles.kbd}>ESC</kbd>
          </div>

          {/* Results */}
          <Command.List className={styles.results}>
            {/* No query, no category: show categories + actions */}
            {!query && !activeCategory && (
              <>
                <Command.Group heading="Quick Categories" className={styles.group}>
                  {categoryOptions.map((cat) => (
                    <Command.Item
                      key={cat.category}
                      className={styles.categoryItem}
                      onSelect={() => handleCategorySelect(cat.category)}
                      value={`category-${cat.category}`}
                    >
                      <span className={styles.catDot} style={{ background: `var(--cat-${cat.category})` }} />
                      <span className={styles.catName}>{cat.label}</span>
                      <span className={styles.catCount}>{cat.count}</span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Separator className={styles.separator} />

                <Command.Group heading="Actions" className={styles.group}>
                  <Command.Item
                    className={styles.actionItem}
                    onSelect={() => { toggleTheme(); setOpen(false); }}
                    value="toggle-theme"
                  >
                    <div className={styles.actionIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/></svg>
                    </div>
                    <span className={styles.actionText}>Toggle Theme</span>
                    <kbd className={styles.actionShortcut}>T</kbd>
                  </Command.Item>
                  <Command.Item
                    className={styles.actionItem}
                    onSelect={() => { setOpen(false); router.push("/"); }}
                    value="back-to-table"
                  >
                    <div className={styles.actionIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    </div>
                    <span className={styles.actionText}>Back to Table</span>
                    <kbd className={styles.actionShortcut}>Home</kbd>
                  </Command.Item>
                </Command.Group>
              </>
            )}

            {/* Category selected, no query: show all elements in category */}
            {!query && activeCategory && (
              <Command.Group heading={categoryOptions.find((c) => c.category === activeCategory)?.label} className={styles.group}>
                {searchResults.map((el) => (
                  <Command.Item
                    key={el.symbol}
                    className={styles.elementItem}
                    onSelect={() => navigateToElement(el.symbol)}
                    value={`${el.symbol}-${el.name}-${el.atomic_number}`}
                  >
                    <span className={styles.elNumber}>{el.atomic_number}</span>
                    <span className={styles.elSymbol} style={{ color: CATEGORY_CSS_VAR[el.category] }}>{el.symbol}</span>
                    <div className={styles.elInfo}>
                      <span className={styles.elName}>{el.name}</span>
                      <span className={styles.elMeta}>Period {el.period} · Group {el.group} · Block {el.block}</span>
                    </div>
                    <span className={styles.elArrow}>&rsaquo;</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search results */}
            {query && searchResults.length > 0 && (
              <Command.Group heading="Elements" className={styles.group}>
                {searchResults.slice(0, 20).map((el) => (
                  <Command.Item
                    key={el.symbol}
                    className={styles.elementItem}
                    onSelect={() => navigateToElement(el.symbol)}
                    value={`${el.symbol}-${el.name}-${el.atomic_number}`}
                  >
                    <span className={styles.elNumber}>{el.atomic_number}</span>
                    <span className={styles.elSymbol} style={{ color: CATEGORY_CSS_VAR[el.category] }}>{el.symbol}</span>
                    <div className={styles.elInfo}>
                      <span className={styles.elName}>{el.name}</span>
                      <span className={styles.elMeta}>Period {el.period} · Group {el.group} · Block {el.block}</span>
                    </div>
                    <div className={styles.elBadge} style={{
                      background: `color-mix(in srgb, ${CATEGORY_CSS_VAR[el.category]} 12%, transparent)`,
                      color: CATEGORY_CSS_VAR[el.category],
                    }}>
                      <span className={styles.elBadgeDot} style={{ background: CATEGORY_CSS_VAR[el.category] }} />
                      {el.category_label}
                    </div>
                    <span className={styles.elArrow}>&rsaquo;</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* No results */}
            {query && searchResults.length === 0 && (
              <Command.Empty className={styles.empty}>
                No elements found for &ldquo;{query}&rdquo;.
                <br />
                <span style={{ color: "var(--text-dim)", fontSize: 11 }}>
                  Try a name, symbol, or atomic number.
                </span>
              </Command.Empty>
            )}
          </Command.List>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.footerHints}>
              <span className={styles.footerHint}><kbd>&uarr;&darr;</kbd> Navigate</span>
              <span className={styles.footerHint}><kbd>&crarr;</kbd> Open</span>
              {activeCategory && (
                <span className={styles.footerHint}><kbd>&lArr;</kbd> Clear filter</span>
              )}
              <span className={styles.footerHint}><kbd>ESC</kbd> Close</span>
            </div>
            <span className={styles.footerLogo}>Periodiq</span>
          </div>
        </div>
      </Command.Dialog>

      {/* Expose open function for CommandBar button */}
      <SearchTriggerBridge onOpen={() => setOpen(true)} />
    </>
  );
}

/**
 * Bridge component that registers a global function so the CommandBar
 * button can open the search palette without prop drilling.
 */
function SearchTriggerBridge({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__openSearch = onOpen;
    return () => {
      delete (window as unknown as Record<string, unknown>).__openSearch;
    };
  }, [onOpen]);
  return null;
}
