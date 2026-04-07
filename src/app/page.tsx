import { PeriodicTable } from "@/components/table/PeriodicTable";
import { Chrome } from "@/components/chrome/Chrome";
import { Sidebar } from "@/components/chrome/Sidebar";

export default function HomePage() {
  return (
    <>
      <Chrome />
      <main className="min-h-screen flex items-center justify-center px-8 py-[72px] pb-[80px]">
        <PeriodicTable />
      </main>
      <Sidebar />
    </>
  );
}
