import { api } from "@/services/api";
import type { ApiResponse, MenuItem } from "@/types";

export interface MenuQuery {
  category?: string;
  search?: string;
  popular?: boolean;
  available?: boolean;
}

export const menuService = {
  async list(query: MenuQuery = {}): Promise<MenuItem[]> {
    const res = await api.get<ApiResponse<MenuItem[]>>("/menu", { params: query });
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<MenuItem> {
    const res = await api.get<ApiResponse<MenuItem>>(`/menu/${id}`);
    if (!res.data.data) throw new Error("Food item not found");
    return res.data.data;
  },

  async create(payload: Partial<MenuItem>): Promise<MenuItem> {
    const res = await api.post<ApiResponse<MenuItem>>("/menu", payload);
    if (!res.data.data) throw new Error("Could not create food item");
    return res.data.data;
  },

  async update(id: string, payload: Partial<MenuItem>): Promise<MenuItem> {
    const res = await api.put<ApiResponse<MenuItem>>(`/menu/${id}`, payload);
    if (!res.data.data) throw new Error("Could not update food item");
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/menu/${id}`);
  },
};
