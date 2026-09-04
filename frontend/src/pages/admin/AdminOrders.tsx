import { useEffect, useState } from "react";
import { Eye, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { orderService } from "@/services/orderService";
import type { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_FLOW } from "@/types";
import { formatNaira } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { toast } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";

const STATUS_FILTERS: (OrderStatus | "All")[] = ["All", ...ORDER_STATUS_FLOW, "Cancelled"];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending: "Confirmed",
  Confirmed: "Preparing",
  Preparing: "Ready",
  Ready: "Out for Delivery",
  "Out for Delivery": "Delivered",
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setOrders(null);
    orderService
      .list({ page, limit: 10, status: statusFilter === "All" ? undefined : statusFilter })
      .then((res) => {
        setOrders(res.items);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => setOrders([]));
  };

  useEffect(load, [page, statusFilter]);

  const updateStatus = async (order: Order, status: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      const updated = await orderService.updateStatus(order.id, status);
      setOrders((prev) => prev?.map((o) => (o.id === order.id ? updated : o)) ?? null);
      if (selectedOrder?.id === order.id) setSelectedOrder(updated);
      toast.success(`Order #${order.orderNumber} marked as ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Orders</h1>
          <p className="mt-1 text-sm text-ink-400">Manage and track every order in real time.</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              statusFilter === status
                ? "bg-ink-900 text-white"
                : "bg-white text-ink-600 border border-ink-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {orders === null &&
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={8} />)}

            {orders?.map((order) => {
              const nextStatus = NEXT_STATUS[order.orderStatus];
              const canCancel = order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled";
              return (
                <tr key={order.id} className="hover:bg-ink-50/50">
                  <td className="px-4 py-3 font-semibold text-ink-900">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-ink-600">{order.customer.name}</td>
                  <td className="px-4 py-3 text-ink-600">{order.items.length} item(s)</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{formatNaira(order.total)}</td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.orderStatus} /></td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-400">{formatDateTime(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        aria-label={`View order ${order.orderNumber}`}
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                      {nextStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={updatingId === order.id}
                          onClick={() => updateStatus(order, nextStatus)}
                        >
                          Mark {nextStatus}
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          loading={updatingId === order.id}
                          onClick={() => updateStatus(order, "Cancelled")}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orders?.length === 0 && (
          <div className="p-4">
            <EmptyState icon={ShoppingBag} title="No orders found" description="Try a different status filter." />
          </div>
        )}
      </div>

      {orders && orders.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.orderNumber}` : ""}
        size="lg"
      >
        {selectedOrder && <OrderDetailView order={selectedOrder} />}
      </Modal>
    </div>
  );
}

function OrderDetailView({ order }: { order: Order }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs font-semibold text-ink-400">Customer</p>
          <p className="font-semibold text-ink-900">{order.customer.name}</p>
          <p className="text-ink-500">{order.customer.phone}</p>
          <p className="text-ink-500">{order.customer.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-ink-400">Delivery Address</p>
          <p className="text-ink-700">{order.deliveryAddress}, {order.city}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-ink-400">Items</p>
        <div className="divide-y divide-ink-100 rounded-xl border border-ink-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div>
                <p className="font-medium text-ink-900">{item.quantity}x {item.name}</p>
                {item.extras.length > 0 && (
                  <p className="text-xs text-ink-400">{item.extras.map((e) => e.name).join(", ")}</p>
                )}
              </div>
              <span className="font-semibold text-ink-900">{formatNaira(item.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {order.specialInstructions && (
        <div>
          <p className="text-xs font-semibold text-ink-400">Special Instructions</p>
          <p className="text-sm italic text-ink-700">"{order.specialInstructions}"</p>
        </div>
      )}

      <div className="rounded-xl bg-ink-50 p-4 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>{formatNaira(order.deliveryFee)}</span></div>
        <div className="mt-2 flex justify-between border-t border-ink-200 pt-2 font-bold">
          <span>Total</span><span>{formatNaira(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
