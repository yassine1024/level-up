import axios, { AxiosInstance } from "axios";

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

// Attach auth token when present (wire to auth store later).
apiClient.interceptors.request.use((config) => {
  // TODO: inject bearer token from auth store once implemented
  return config;
});