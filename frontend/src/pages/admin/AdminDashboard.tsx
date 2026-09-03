import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Wallet, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { orderService } from "@/services/orderService";
import type { DashboardStats, Order } from "@/types";
import { StatCard } from "@/components/admin/StatCard";
import { formatNaira } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { usePolling } from "@/hooks/usePolling";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function AdminDashboard() {
  useDocumentTitle("Admin Dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const load = () => {
    orderService.getStats().then(setStats).catch(() => {});
    orderService
      .list({ page: 1, limit: 6 })
      .then((res) => setRecentOrders(res.items))
      .catch(() => {});
  };

  useEffect(load, []);
  usePolling(load, 20000);

  if (!stats) {
    return <LoadingSpinner fullPage label="Loading dashboard..." />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-400">Here's what's happening at ChopLife Kitchen today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Today's Orders" value={String(stats.todaysOrders)} accent="brand" />
        <StatCard icon={Wallet} label="Revenue" value={formatNaira(stats.revenue)} accent="green" />
        <StatCard icon={Clock} label="Pending Orders" value={String(stats.pendingOrders)} accent="amber" />
        <StatCard icon={CheckCircle2} label="Completed Orders" value={String(stats.completedOrders)} accent="blue" />
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">Recent Orders</h2>
          <Link to="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                  <th className="pb-3 pr-4 font-semibold">Order</th>
                  <th className="pb-3 pr-4 font-semibold">Customer</th>
                  <th className="pb-3 pr-4 font-semibold">Total</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 pr-4 font-semibold text-ink-900 whitespace-nowrap">#{order.orderNumber}</td>
                    <td className="py-3 pr-4 text-ink-600">{order.customer.name}</td>
                    <td className="py-3 pr-4 font-semibold text-ink-900">{formatNaira(order.total)}</td>
                    <td className="py-3 pr-4"><OrderStatusBadge status={order.orderStatus} /></td>
                    <td className="py-3 text-ink-400">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
