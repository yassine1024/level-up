import type { User } from "@/src/types/api";

// Simulated network delay for mock responses.
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async getMe(): Promise<User> {
    await delay();
    return {
      id: "u_1",
      name: "Demo User",
      email: "demo@levelup.app",
      avatarUrl: undefined,
    };
  },

  async login(email: string, _password: string): Promise<{ token: string }> {
    await delay();
    return { token: `mock-token-${email}` };
  },
};