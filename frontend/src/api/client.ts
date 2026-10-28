import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "@/src/store/auth";

// Mode is controlled by EXPO_PUBLIC_API_MODE (mock | live).
// Defaults to "mock" so the app runs without a backend.
export const API_MODE = (process.env.EXPO_PUBLIC_API_MODE ?? "live") as
  | "mock"
  | "live";

const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

// Android emulators resolve localhost inside the emulator, not on the
// development machine. Keep explicit LAN URLs untouched for physical devices.
export const API_BASE_URL =
  Platform.OS === "android" && configuredApiUrl.includes("localhost")
    ? configuredApiUrl.replace("localhost", "10.0.2.2")
    : configuredApiUrl;

// eslint-disable-next-line import/no-named-as-default-member
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// NOTE: no default `Content-Type` here on purpose.
// Axios sets `application/json` by itself for plain-object bodies, and it only
// JSON.stringify()s a FormData body when the Content-Type already says
// application/json. Leaving it unset lets React Native's networking layer
// (and the browser on web) add `multipart/form-data; boundary=…` for uploads.

// Attach auth token when present.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Posts a multipart/form-data body (teacher resource uploads).
 * The Content-Type header is intentionally left unset so the platform adds
 * the multipart boundary itself.
 */
export async function postMultipart<T>(
  url: string,
  form: FormData,
  timeout = 120000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const token = useAuthStore.getState().token;

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
      signal: controller.signal,
    });
    const body = await response.text();
    let data: unknown = null;
    if (body) {
      try {
        data = JSON.parse(body);
      } catch {
        data = { detail: body };
      }
    }
    if (!response.ok) {
      const error = new Error(
        (data as { detail?: string; error?: string })?.detail ??
          (data as { detail?: string; error?: string })?.error ??
          `Request failed with status ${response.status}`
      ) as Error & {
        response?: { status: number; data: unknown };
      };
      error.response = { status: response.status, data };
      throw error;
    }
    return data as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
