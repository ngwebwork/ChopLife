import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PartyPopper, MapPin, CreditCard, MessageCircle, MapPinned } from "lucide-react";
import { orderService } from "@/services/orderService";
import { useSettingsStore } from "@/store/settingsStore";
import type { Order } from "@/types";
import { formatNaira } from "@/utils/currency";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/common/Button";
import { buildWhatsAppOrderLink } from "@/utils/whatsapp";
import { getErrorMessage } from "@/services/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function OrderConfirmation() {
  useDocumentTitle("Order Confirmed");
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const { settings, fetch } = useSettingsStore();

  useEffect(() => {
    fetch();
    if (!orderNumber) return;
    orderService
      .getByOrderNumber(orderNumber)
      .then(setOrder)
      .catch((err) => setError(getErrorMessage(err)));
  }, [orderNumber, fetch]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-lg font-bold text-ink-900">{error}</h1>
        <Link to="/menu" className="mt-6 inline-block">
          <Button>Back to Menu</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return <LoadingSpinner fullPage label="Loading your order..." />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <PartyPopper size={30} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
          Order Confirmed 🎉
        </h1>
        <p className="mt-2 text-sm text-ink-400">
          Thank you, {order.customer.name.split(" ")[0]}! Your order has been received.
        </p>
        <p className="mt-3 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-700">
          #{order.orderNumber}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-ink-900">Order Items</h2>
        <div className="divide-y divide-ink-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2.5 text-sm">
              <span className="text-ink-700">
                {item.quantity}x {item.name}
              </span>
              <span className="font-semibold text-ink-900">{formatNaira(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-ink-100 pt-3">
          <span className="text-base font-bold text-ink-900">Total</span>
          <span className="text-lg font-extrabold text-brand-700">{formatNaira(order.total)}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4">
          <MapPin size={18} className="mt-0.5 shrink-0 text-brand-600" />
          <div>
            <p className="text-xs font-semibold text-ink-400">Delivery Address</p>
            <p className="text-sm text-ink-900">
              {order.deliveryAddress}, {order.city}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4">
          <CreditCard size={18} className="mt-0.5 shrink-0 text-brand-600" />
          <div>
            <p className="text-xs font-semibold text-ink-400">Payment Method</p>
            <p className="text-sm text-ink-900">{order.paymentMethod}</p>
            <div className="mt-1">
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-600">
        <MapPinned size={16} className="shrink-0 text-brand-600" />
        Estimated delivery: 30 - 45 minutes
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to={`/order/${order.orderNumber}`} className="flex-1">
          <Button size="lg" fullWidth>
            Track Order
          </Button>
        </Link>
        <a
          href={buildWhatsAppOrderLink(order, settings.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button size="lg" variant="outline" fullWidth icon={<MessageCircle size={18} />}>
            Order via WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
