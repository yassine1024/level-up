import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "@/src/store/auth";

// Mode is controlled by EXPO_PUBLIC_API_MODE (mock | live).
// Defaults to "live" so the app runs against the backend.
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

// Attach auth token when present.
apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  const token = useAuthStore.getState().token;
  if (token) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Posts a multipart/form-data body (teacher resource uploads).
 *
 * Uses axios (React Native's XHR adapter) rather than `fetch`: XHR natively
 * handles React Native's FormData descriptors (`{ uri, name, type }`), while
 * Expo's fetch would reject them with "Unsupported FormDataPart
 * implementation". The Content-Type header is intentionally left unset so
 * the platform adds the multipart boundary itself.
 */
export async function postMultipart<T>(
  url: string,
  form: FormData,
  timeout = 120000
): Promise<T> {
  const res = await apiClient.post<T>(url, form, { timeout });
  return res.data;
}