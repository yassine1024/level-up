import { create } from "zustand";

import { clearToken, loadToken, saveToken } from "@/src/store/tokenStorage";

interface AuthState {
  token: string | null;
  /** True once the persisted token has been read back on app start. */
  hydrated: boolean;
  setToken: (token: string | null) => void;
  /** Read the persisted token into memory. Safe to call multiple times. */
  hydrate: () => Promise<void>;
  logout: () => void;
}

/** Decode the JWT payload without verifying the signature (UI use only). */
export function decodeTokenPayload(token: string): Record<string, any> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * True only when we can positively prove the token is expired.
 * If the payload cannot be decoded we fail open — the server stays
 * the source of truth and a 401 routes the user to /session-expired.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== "number") return false;
  // 30s leeway so we drop tokens that expire mid-request.
  return Date.now() >= exp * 1000 - 30_000;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  hydrated: false,
  setToken: (token) => {
    set({ token });
    if (token) {
      void saveToken(token);
    } else {
      void clearToken();
    }
  },
  hydrate: async () => {
    if (get().hydrated) return;
    const stored = await loadToken();
    if (!stored) {
      set({ token: null, hydrated: true });
      return;
    }
    if (isTokenExpired(stored)) {
      await clearToken();
      set({ token: null, hydrated: true });
      return;
    }
    set({ token: stored, hydrated: true });
  },
  logout: () => {
    set({ token: null });
    void clearToken();
  },
}));
