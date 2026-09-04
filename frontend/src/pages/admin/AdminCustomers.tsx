import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { orderService } from "@/services/orderService";
import { formatNaira } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface CustomerSummary {
  name: string;
  phone: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
}

export function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerSummary[] | null>(null);

  useEffect(() => {
    orderService
      .list({ page: 1, limit: 100 })
      .then((res) => {
        const byPhone = new Map<string, CustomerSummary>();
        for (const order of res.items) {
          const key = order.customer.phone || order.customer.email;
          const existing = byPhone.get(key);
          if (existing) {
            existing.orderCount += 1;
            existing.totalSpent += order.total;
            if (new Date(order.createdAt) > new Date(existing.lastOrderAt)) {
              existing.lastOrderAt = order.createdAt;
            }
          } else {
            byPhone.set(key, {
              name: order.customer.name,
              phone: order.customer.phone,
              email: order.customer.email,
              orderCount: 1,
              totalSpent: order.total,
              lastOrderAt: order.createdAt,
            });
          }
        }
        setCustomers(
          Array.from(byPhone.values()).sort((a, b) => b.totalSpent - a.totalSpent)
        );
      })
      .catch(() => setCustomers([]));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Customers</h1>
        <p className="mt-1 text-sm text-ink-400">
          A summary of everyone who has ordered from ChopLife Kitchen, built from your order history.
        </p>
      </div>

      {customers === null ? (
        <LoadingSpinner fullPage label="Loading customers..." />
      ) : customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Customers will appear here once orders come in." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Total Spent</th>
                <th className="px-4 py-3 font-semibold">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {customers.map((c) => (
                <tr key={c.phone + c.email}>
                  <td className="px-4 py-3 font-semibold text-ink-900">{c.name}</td>
                  <td className="px-4 py-3 text-ink-600">{c.phone}</td>
                  <td className="px-4 py-3 text-ink-600">{c.email}</td>
                  <td className="px-4 py-3 text-ink-600">{c.orderCount}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{formatNaira(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-ink-400">{formatDate(c.lastOrderAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
