import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE_KEY, getWorkspaceAccessToken } from "@/lib/auth";

const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const expectedToken = getWorkspaceAccessToken();
  const redirectUrl = new URL("/login", request.url);

  if (!expectedToken || params.token !== expectedToken) {
    redirectUrl.searchParams.set("error", "invalid-link");
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(ACCESS_COOKIE_KEY, expectedToken, {
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:"
  });

  return response;
}
