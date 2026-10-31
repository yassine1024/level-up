import { api, getStoredToken, setStoredToken } from "./api";

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  createdAt?: string | null;
  lastLoginAt?: string | null;
}

export interface LoginResponse {
  token: string;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { username, password });
  setStoredToken(data.token);
  const me = await fetchMe();
  if (me.role !== "ADMIN") {
    setStoredToken(null);
    throw new Error("This account is not an admin.");
  }
  return me;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/api/users/me");
  return data;
}

export function logout(): void {
  setStoredToken(null);
  if (typeof window !== "undefined") window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}