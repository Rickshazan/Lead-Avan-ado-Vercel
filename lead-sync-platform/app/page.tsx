import { UploadExcel } from "@/components/dashboard/UploadExcel";
import { LeadTable } from "@/components/dashboard/LeadTable";

export default function Home() {
  return (
    <main className="p-10 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">
        Lead Control
      </h1>

      <UploadExcel />

      <LeadTable />
    </main>
  );
}
