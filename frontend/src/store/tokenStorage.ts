import * as SecureStore from "expo-secure-store";

/** Native (iOS/Android) JWT persistence via Keychain / Keystore. */

const KEY = "levelup.auth.jwt";

export async function loadToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, token);
  } catch {
    // Never crash the auth flow because persistence failed.
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // ignore
  }
}
