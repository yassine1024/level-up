import { API_MODE, apiClient } from "./client";
import { mockApi } from "./mock";
import type { User, LoginRequest } from "@/src/types/api";

export const userApi = {
  getMe: async (): Promise<User> => {
    if (API_MODE === "mock") return mockApi.getMe();
    const res = await apiClient.get<User>("/api/users/me");
    return res.data;
  },
};

export const authApi = {
  login: async (payload: LoginRequest): Promise<{ token: string }> => {
    if (API_MODE === "mock") return mockApi.login(payload.username, payload.password);
    const res = await apiClient.post<{ token: string }>("/api/auth/login", payload);
    return res.data;
  },
  register: async (payload: {
    username: string;
    password: string;
    role: string;
  }): Promise<{ token: string }> => {
    if (API_MODE === "mock") return mockApi.login(payload.username, payload.password);
    const res = await apiClient.post<{ token: string }>("/api/auth/register", payload);
    return res.data;
  },
};