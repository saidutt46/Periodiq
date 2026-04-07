import { Chrome } from "@/components/chrome/Chrome";

export default function ListPage() {
  return (
    <>
      <Chrome />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">List View</h1>
          <p className="text-sm text-[var(--text-muted)]">Element cards coming soon</p>
        </div>
      </main>
    </>
  );
}
