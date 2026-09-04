import { api } from "@/services/api";
import type { ApiResponse, Category } from "@/types";

export const categoryService = {
  async list(activeOnly = false): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>("/categories", {
      params: activeOnly ? { active: "true" } : {},
    });
    return res.data.data ?? [];
  },

  async create(payload: Partial<Category>): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>("/categories", payload);
    if (!res.data.data) throw new Error("Could not create category");
    return res.data.data;
  },

  async update(id: string, payload: Partial<Category>): Promise<Category> {
    const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload);
    if (!res.data.data) throw new Error("Could not update category");
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
