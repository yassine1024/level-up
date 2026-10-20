// Shared API contract types for the mobile frontend.
// These mirror the expected Spring Boot backend responses.
// When the backend is ready, keep these in sync with the OpenAPI spec in docs/.

export interface User {
  id: number;
  username: string;
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
}