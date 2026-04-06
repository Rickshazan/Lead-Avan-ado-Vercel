import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasWorkspaceAccess, hasWorkspaceIdentity } from "@/lib/auth";

export default function HomePage() {
  const cookieStore = cookies();

  redirect(hasWorkspaceAccess(cookieStore) && hasWorkspaceIdentity(cookieStore) ? "/dashboard" : "/login");
}
