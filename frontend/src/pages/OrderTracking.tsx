import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Search, XCircle } from "lucide-react";
import clsx from "clsx";
import { orderService } from "@/services/orderService";
import { usePolling } from "@/hooks/usePolling";
import type { Order } from "@/types";
import { ORDER_STATUS_FLOW } from "@/types";
import { formatNaira } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function OrderTracking() {
  const { orderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderNumber);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState(orderNumber || "");

  const fetchOrder = (num: string) => {
    orderService
      .getByOrderNumber(num)
      .then((data) => {
        setOrder(data);
        setError("");
      })
      .catch(() => setError("Order not found. Please check your order number and try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (orderNumber) {
      setLoading(true);
      fetchOrder(orderNumber);
    }
  }, [orderNumber]);

  usePolling(() => {
    if (orderNumber && order && order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled") {
      fetchOrder(orderNumber);
    }
  }, 10000);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/order/${searchValue.trim()}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-center font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
        Track Your Order
      </h1>
      <p className="mt-2 text-center text-sm text-ink-400">
        Enter your order number to see live status updates.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <Input
          placeholder="e.g. CLK-2026-000123"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="uppercase"
        />
        <Button type="submit" icon={<Search size={18} />} />
      </form>

      <div className="mt-8">
        {loading && <LoadingSpinner fullPage label="Looking up your order..." />}

        {!loading && error && (
          <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 py-10 text-center">
            <XCircle className="text-red-500" size={32} />
            <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {!loading && order && <TrackingTimeline order={order} />}
      </div>
    </div>
  );
}

function TrackingTimeline({ order }: { order: Order }) {
  const isCancelled = order.orderStatus === "Cancelled";
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.orderStatus);

  return (
    <div>
      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-400">Order Number</p>
            <p className="text-lg font-extrabold text-ink-900">#{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-ink-400">Total</p>
            <p className="text-lg font-extrabold text-brand-700">{formatNaira(order.total)}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-400">Placed on {formatDateTime(order.createdAt)}</p>
      </div>

      {isCancelled ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 py-10 text-center">
          <XCircle className="text-red-500" size={32} />
          <p className="mt-3 text-sm font-bold text-red-700">This order has been cancelled</p>
        </div>
      ) : (
        <ol className="mt-8 space-y-0">
          {ORDER_STATUS_FLOW.map((status, index) => {
            const isDone = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isLast = index === ORDER_STATUS_FLOW.length - 1;

            return (
              <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
                {!isLast && (
                  <span
                    className={clsx(
                      "absolute left-[15px] top-8 h-full w-0.5",
                      isDone ? "bg-brand-600" : "bg-ink-200"
                    )}
                  />
                )}
                <span
                  className={clsx(
                    "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                    isDone && "border-brand-600 bg-brand-600 text-white",
                    isCurrent && "border-brand-600 bg-white text-brand-600 animate-pulse",
                    !isDone && !isCurrent && "border-ink-200 bg-white text-ink-300"
                  )}
                >
                  {isDone ? <Check size={16} /> : index + 1}
                </span>
                <div className="pt-1">
                  <p
                    className={clsx(
                      "text-sm font-bold",
                      isDone || isCurrent ? "text-ink-900" : "text-ink-400"
                    )}
                  >
                    {status}
                  </p>
                  {isCurrent && (
                    <p className="text-xs font-medium text-brand-600">Current status</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
