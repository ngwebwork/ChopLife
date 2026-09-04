import { api } from "@/services/api";
import type { AdminUser, ApiResponse } from "@/types";

interface AuthPayload {
  token: string;
  user: AdminUser;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthPayload> {
    const res = await api.post<ApiResponse<AuthPayload>>("/auth/login", { email, password });
    if (!res.data.data) throw new Error("Login failed");
    return res.data.data;
  },

  async register(name: string, email: string, password: string): Promise<AuthPayload> {
    const res = await api.post<ApiResponse<AuthPayload>>("/auth/register", {
      name,
      email,
      password,
    });
    if (!res.data.data) throw new Error("Registration failed");
    return res.data.data;
  },
};
