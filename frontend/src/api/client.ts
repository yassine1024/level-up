import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/src/store/auth";

export const API_MODE = (process.env.EXPO_PUBLIC_API_MODE ??
  (__DEV__ ? "mock" : "live")) as "mock" | "live";

export const DEFAULT_TIMEOUT = 60000;
export const GENERATION_TIMEOUT = 90000;
export const UPLOAD_TIMEOUT = 120000;
export const HEALTH_TIMEOUT = 90000;
export const DEFAULT_API_URL = "https://level-up-backend-elhs.onrender.com";

const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;

function normalizeBaseUrl(raw: string | undefined): string {
  if (!raw || !raw.trim()) {
    if (!isDev) {
      const msg = "EXPO_PUBLIC_API_URL is missing in a production build.";
      console.error(msg);
      throw new Error(msg);
    }
    return DEFAULT_API_URL;
  }
  let url = raw.trim();
  if (url.endsWith("/")) url = url.slice(0, -1);
  if (!isDev && !url.startsWith("https://")) {
    console.warn("EXPO_PUBLIC_API_URL is not https in a production build:", url);
  }
  return url;
}

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { router } = require("expo-router");
        router.replace("/login");
      } catch {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
  if (!config || config._retried) return Promise.reject(error);
  const method = (config.method ?? "get").toLowerCase();
  if (method !== "get") return Promise.reject(error);
  const isNetwork =
    !error.response ||
    error.code === "ECONNABORTED" ||
    error.code === "ERR_NETWORK" ||
    /timeout/i.test(error.message ?? "");
  if (!isNetwork) return Promise.reject(error);
  config._retried = true;
  return apiClient.request(config);
});

export async function postMultipart<T>(
  url: string,
  form: FormData,
  timeout = UPLOAD_TIMEOUT
): Promise<T> {
  const res = await apiClient.post<T>(url, form, { timeout });
  return res.data;
}
