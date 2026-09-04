import clsx from "clsx";
import type { OrderStatus, PaymentStatus } from "@/types";

const orderStatusClasses: Record<OrderStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Preparing: "bg-purple-50 text-purple-700 border-purple-200",
  Ready: "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Out for Delivery": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const paymentStatusClasses: Record<PaymentStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Paid: "bg-green-50 text-green-700 border-green-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Refunded: "bg-ink-100 text-ink-700 border-ink-200",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        orderStatusClasses[status]
      )}
    >
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        paymentStatusClasses[status]
      )}
    >
      {status}
    </span>
  );
}
