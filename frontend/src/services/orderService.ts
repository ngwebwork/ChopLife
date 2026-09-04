import { api } from "@/services/api";
import type {
  ApiResponse,
  CartItem,
  Customer,
  DashboardStats,
  Order,
  PaginatedResult,
  PaymentMethod,
} from "@/types";

export interface CheckoutPayload {
  customer: Customer;
  items: {
    menuItemId: string;
    quantity: number;
    extras: { name: string; price: number }[];
    specialInstructions: string;
  }[];
  deliveryAddress: string;
  city: string;
  phone: string;
  paymentMethod: PaymentMethod;
  specialInstructions: string;
}

export function cartItemsToOrderItems(items: CartItem[]) {
  return items.map((item) => ({
    menuItemId: item.menuItemId,
    quantity: item.quantity,
    extras: item.extras,
    specialInstructions: item.specialInstructions,
  }));
}

export const orderService = {
  async create(payload: CheckoutPayload): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>("/orders", payload);
    if (!res.data.data) throw new Error("Could not place order");
    return res.data.data;
  },

  async getByOrderNumber(orderNumber: string): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${orderNumber}`);
    if (!res.data.data) throw new Error("Order not found");
    return res.data.data;
  },

  async list(params: { page?: number; limit?: number; status?: string }): Promise<PaginatedResult<Order>> {
    const res = await api.get<ApiResponse<PaginatedResult<Order>>>("/orders", { params });
    if (!res.data.data) throw new Error("Could not load orders");
    return res.data.data;
  },

  async updateStatus(id: string, orderStatus: string): Promise<Order> {
    const res = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { orderStatus });
    if (!res.data.data) throw new Error("Could not update order status");
    return res.data.data;
  },

  async getStats(): Promise<DashboardStats> {
    const res = await api.get<ApiResponse<DashboardStats>>("/orders/stats");
    if (!res.data.data) throw new Error("Could not load dashboard stats");
    return res.data.data;
  },
};
