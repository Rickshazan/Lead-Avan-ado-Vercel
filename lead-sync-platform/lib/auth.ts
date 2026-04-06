export const ACCESS_COOKIE_KEY = "lead-control-access";
export const DISPLAY_NAME_COOKIE_KEY = "lead-control-display-name";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type CookieStoreLike = {
  get: (name: string) => { value: string } | undefined;
};

function isSecureContext() {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

function getCookieSuffix(maxAge = COOKIE_MAX_AGE) {
  const secure = isSecureContext() ? "; Secure" : "";
  return `; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function getWorkspaceAccessToken() {
  return process.env.APP_ACCESS_TOKEN?.trim() ?? "";
}

export function hasWorkspaceAccess(cookieStore: CookieStoreLike) {
  const expectedToken = getWorkspaceAccessToken();

  if (!expectedToken) {
    return false;
  }

  return cookieStore.get(ACCESS_COOKIE_KEY)?.value === expectedToken;
}

export function getWorkspaceDisplayName(cookieStore: CookieStoreLike) {
  const rawValue = cookieStore.get(DISPLAY_NAME_COOKIE_KEY)?.value;

  if (!rawValue) {
    return "";
  }

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export function hasWorkspaceIdentity(cookieStore: CookieStoreLike) {
  return getWorkspaceDisplayName(cookieStore).trim().length > 0;
}

export function persistWorkspaceIdentity(displayName: string) {
  if (typeof document === "undefined") {
    return;
  }

  const normalizedDisplayName = displayName.trim().slice(0, 60);

  if (!normalizedDisplayName) {
    clearWorkspaceIdentity();
    return;
  }

  document.cookie = `${DISPLAY_NAME_COOKIE_KEY}=${encodeURIComponent(normalizedDisplayName)}${getCookieSuffix()}`;
}

export function clearWorkspaceIdentity() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${DISPLAY_NAME_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax${isSecureContext() ? "; Secure" : ""}`;
}

export function clearWorkspaceAccess() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ACCESS_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax${isSecureContext() ? "; Secure" : ""}`;
}

export function clearWorkspaceSession() {
  clearWorkspaceIdentity();
  clearWorkspaceAccess();
}

export function getBrowserDisplayName() {
  if (typeof document === "undefined") {
    return "";
  }

  const cookiePair = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${DISPLAY_NAME_COOKIE_KEY}=`));

  if (!cookiePair) {
    return "";
  }

  const rawValue = cookiePair.split("=").slice(1).join("=");

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export function hasBrowserWorkspaceAccess() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split("; ")
    .some((entry) => entry.startsWith(`${ACCESS_COOKIE_KEY}=`));
}
