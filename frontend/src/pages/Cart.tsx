import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import { buildWhatsAppCartLink } from "@/utils/whatsapp";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function Cart() {
  useDocumentTitle("Your Cart");
  const { items, subtotal } = useCartStore();
  const { settings, fetch } = useSettingsStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetch();
  }, [fetch]);

  const hasUnavailable = items.some((i) => !i.available);
  const total = subtotal();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added any delicious meals yet."
          action={
            <Link to="/menu">
              <Button>Browse Menu</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">Your Cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 lg:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.cartItemId} item={item} />
          ))}
        </div>

        <div className="space-y-4">
          <OrderSummary
            subtotal={total}
            deliveryFee={settings.deliveryFee}
            minimumOrder={settings.minimumOrder}
          />

          <Button
            size="lg"
            fullWidth
            disabled={hasUnavailable || total < settings.minimumOrder}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </Button>

          <a
            href={buildWhatsAppCartLink(items, total + settings.deliveryFee, settings.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
          >
            <MessageCircle size={18} />
            Order via WhatsApp instead
          </a>
        </div>
      </div>
    </div>
  );
}
