import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LeadTable } from "@/components/dashboard/LeadTable";
import { Topbar } from "@/components/dashboard/Topbar";
import { UploadExcel } from "@/components/dashboard/UploadExcel";
import { hasAuthCookie } from "@/lib/auth";

export default function DashboardPage() {
  const cookieStore = cookies();

  if (!hasAuthCookie(cookieStore)) {
    redirect("/login");
  }

  return (
    <main className="section-shell min-h-screen py-6">
      <div className="flex flex-col gap-6">
        <Topbar />

        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <UploadExcel />
          <LeadTable />
        </section>
      </div>
    </main>
  );
}
