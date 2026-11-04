/** Web JWT persistence via localStorage. Guarded for SSR (`window` undefined). */

const KEY = "levelup.auth.jwt";

export async function loadToken(): Promise<string | null> {
  try {
    return typeof window !== "undefined"
      ? window.localStorage.getItem(KEY)
      : null;
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, token);
    }
  } catch {
    // Storage unavailable (private mode, quota) — session becomes memory-only.
  }
}

export async function clearToken(): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(KEY);
    }
  } catch {
    // ignore
  }
}
