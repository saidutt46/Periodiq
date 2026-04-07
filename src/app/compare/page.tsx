import { Chrome } from "@/components/chrome/Chrome";

export default function ComparePage() {
  return (
    <>
      <Chrome />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Compare Elements</h1>
          <p className="text-sm text-[var(--text-muted)]">Side-by-side element comparison — coming soon</p>
        </div>
      </main>
    </>
  );
}
