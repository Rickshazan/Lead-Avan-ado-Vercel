import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasAuthCookie } from "@/lib/auth";

export default function HomePage() {
  const cookieStore = cookies();

  redirect(hasAuthCookie(cookieStore) ? "/dashboard" : "/login");
}
