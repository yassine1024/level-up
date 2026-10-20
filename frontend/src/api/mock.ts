import type { User } from "@/src/types/api";

// Simulated network delay for mock responses.
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async getMe(): Promise<User> {
    await delay();
    return {
      id: 1,
      username: "demo",
      role: "STUDENT",
    };
  },

  async login(username: string, _password: string): Promise<{ token: string }> {
    await delay();
    return { token: `mock-token-${username}` };
  },
};