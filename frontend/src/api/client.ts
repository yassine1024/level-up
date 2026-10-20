import axios, { AxiosInstance } from "axios";
import { useAuthStore } from "@/src/store/auth";

// Mode is controlled by EXPO_PUBLIC_API_MODE (mock | live).
// Defaults to "mock" so the app runs without a backend.
export const API_MODE = (process.env.EXPO_PUBLIC_API_MODE ?? "mock") as
  | "mock"
  | "live";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

// eslint-disable-next-line import/no-named-as-default-member
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token when present.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});