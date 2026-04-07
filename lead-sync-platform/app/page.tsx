import { LeadTable } from "@/components/dashboard/LeadTable";
import { UploadExcel } from "@/components/dashboard/UploadExcel";
import { Topbar } from "@/components/dashboard/Topbar";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Topbar />
        
        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <UploadExcel />
          <LeadTable />
        </section>
      </div>
    </main>
  );
}
