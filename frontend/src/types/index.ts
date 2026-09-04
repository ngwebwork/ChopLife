export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface Extra {
  name: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  image: string;
  ingredients: string[];
  extras: Extra[];
  available: boolean;
  popular: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
];

export type PaymentMethod = "Cash on Delivery" | "Demo Payment";
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  extras: Extra[];
  specialInstructions: string;
  subtotal: number;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: string;
  city: string;
  phone: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paidAt?: string;
  orderStatus: OrderStatus;
  specialInstructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  totalOrders: number;
  todaysOrders: number;
  revenue: number;
  todaysRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface Settings {
  id: string;
  restaurantName: string;
  tagline: string;
  logo: string;
  phone: string;
  whatsapp: string;
  address: string;
  openingHours: string;
  deliveryFee: number;
  minimumOrder: number;
  facebook: string;
  instagram: string;
  twitter: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// --- Cart-specific types ---

export interface CartExtra extends Extra {}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  extras: CartExtra[];
  specialInstructions: string;
  available: boolean;
}
