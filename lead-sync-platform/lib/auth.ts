import type { Session } from "@supabase/supabase-js";

export const AUTH_COOKIE_KEY = "lead-control-session";

type CookieStoreLike = {
  get: (name: string) => { value: string } | undefined;
};

function isSecureContext() {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

export function persistAuthSession(session: Session | null) {
  if (typeof document === "undefined") {
    return;
  }

  if (!session?.access_token) {
    clearAuthSessionCookies();
    return;
  }

  const secure = isSecureContext() ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_KEY}=active; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
}

export function clearAuthSessionCookies() {
  if (typeof document === "undefined") {
    return;
  }

  const secure = isSecureContext() ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function hasAuthCookie(cookieStore: CookieStoreLike) {
  return cookieStore.get(AUTH_COOKIE_KEY)?.value === "active";
}
