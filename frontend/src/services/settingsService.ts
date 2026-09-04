import { api } from "@/services/api";
import type { ApiResponse, Settings } from "@/types";

export const settingsService = {
  async get(): Promise<Settings> {
    const res = await api.get<ApiResponse<Settings>>("/settings");
    if (!res.data.data) throw new Error("Could not load settings");
    return res.data.data;
  },

  async update(payload: Partial<Settings>): Promise<Settings> {
    const res = await api.put<ApiResponse<Settings>>("/settings", payload);
    if (!res.data.data) throw new Error("Could not update settings");
    return res.data.data;
  },
};
