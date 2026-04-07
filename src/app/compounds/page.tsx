import { Chrome } from "@/components/chrome/Chrome";

export default function CompoundsPage() {
  return (
    <>
      <Chrome />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Compound Explorer</h1>
          <p className="text-sm text-[var(--text-muted)]">Drag elements to discover compounds — coming soon</p>
        </div>
      </main>
    </>
  );
}
