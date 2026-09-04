import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/types";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

/** Extracts a user-friendly message from any API/network error. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error as AxiosError<ApiResponse<unknown>>;
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    if (apiError.code === "ERR_NETWORK") {
      return "Can't reach the server. Please check your connection and try again.";
    }
    return "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
