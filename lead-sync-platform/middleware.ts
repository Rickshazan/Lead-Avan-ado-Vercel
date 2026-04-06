import { NextResponse, type NextRequest } from "next/server";

import { hasWorkspaceAccess, hasWorkspaceIdentity } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccess = hasWorkspaceAccess(request.cookies);
  const hasIdentity = hasWorkspaceIdentity(request.cookies);

  if (pathname.startsWith("/dashboard") && !hasAccess) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/login") && hasAccess && hasIdentity) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/access/:path*"]
};
