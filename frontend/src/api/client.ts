import axios, { AxiosInstance } from "axios";
import { useAuthStore } from "@/src/store/auth";

// Mode is controlled by EXPO_PUBLIC_API_MODE (mock | live).
// Defaults to "mock" so the app runs without a backend.
export const API_MODE = (process.env.EXPO_PUBLIC_API_MODE ?? "live") as
  | "mock"
  | "live";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

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
  const res = await apiClient.post<T>(url, form, { timeout });
  return res.data;
}
