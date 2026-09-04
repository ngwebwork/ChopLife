import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { Truck, Banknote, ShieldCheck, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Input, Textarea } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { formatNaira } from "@/utils/currency";
import { orderService, cartItemsToOrderItems } from "@/services/orderService";
import { getErrorMessage } from "@/services/api";
import { toast } from "@/store/toastStore";
import type { PaymentMethod } from "@/types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import clsx from "clsx";

interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  city: string;
  deliveryInstructions: string;
}

export function Checkout() {
  useDocumentTitle("Checkout");
  const { items, subtotal, clear } = useCartStore();
  const { settings, fetch } = useSettingsStore();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");
  const [submitting, setSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showDemoPayment, setShowDemoPayment] = useState(false);
  const orderPlacedRef = useRef(false);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>();

  if (items.length === 0 && !orderPlacedRef.current) {
    return <Navigate to="/menu" replace />;
  }

  const total = subtotal();

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true);
    try {
      const order = await orderService.create({
        customer: { name: data.fullName, phone: data.phone, email: data.email },
        items: cartItemsToOrderItems(items),
        deliveryAddress: data.deliveryAddress,
        city: data.city,
        phone: data.phone,
        paymentMethod,
        specialInstructions: data.deliveryInstructions,
      });
      orderPlacedRef.current = true;
      clear();
      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${order.orderNumber}`, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">Checkout</h1>

      <form
        onSubmit={handleSubmit(() => setShowSummary(true))}
        className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-ink-900">Contact Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="Adaeze Okafor"
                {...register("fullName", { required: "Full name is required" })}
                error={errors.fullName?.message}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="080X XXX XXXX"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: { value: /^[0-9+\s-]{7,15}$/, message: "Enter a valid phone number" },
                })}
                error={errors.phone?.message}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                  })}
                  error={errors.email?.message}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-ink-900">Delivery Details</h2>
            <div className="space-y-4">
              <Input
                label="Delivery Address"
                placeholder="12 Admiralty Way, Lekki Phase 1"
                {...register("deliveryAddress", { required: "Delivery address is required" })}
                error={errors.deliveryAddress?.message}
              />
              <Input
                label="City"
                placeholder="Lagos"
                {...register("city", { required: "City is required" })}
                error={errors.city?.message}
              />
              <Textarea
                label="Delivery Instructions (optional)"
                placeholder="E.g. gate code, landmark, preferred drop-off point"
                rows={3}
                {...register("deliveryInstructions")}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-ink-900">Payment Method</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("Cash on Delivery")}
                className={clsx(
                  "flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors cursor-pointer",
                  paymentMethod === "Cash on Delivery"
                    ? "border-brand-600 bg-brand-50"
                    : "border-ink-200 bg-white"
                )}
              >
                <Banknote size={20} className="text-brand-700" />
                <div>
                  <p className="text-sm font-bold text-ink-900">Cash on Delivery</p>
                  <p className="text-xs text-ink-400">Pay when your order arrives</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("Demo Payment")}
                className={clsx(
                  "flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors cursor-pointer",
                  paymentMethod === "Demo Payment"
                    ? "border-brand-600 bg-brand-50"
                    : "border-ink-200 bg-white"
                )}
              >
                <Sparkles size={20} className="text-brand-700" />
                <div>
                  <p className="text-sm font-bold text-ink-900">Demo Payment</p>
                  <p className="text-xs text-ink-400">Simulated payment for this demo</p>
                </div>
              </button>
            </div>
            {paymentMethod === "Demo Payment" && (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                This is a demo checkout only. No real payment gateway is used and no real money
                will ever be charged — no card details are collected or stored.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <OrderSummary
            subtotal={total}
            deliveryFee={settings.deliveryFee}
            minimumOrder={settings.minimumOrder}
          />
          <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-600">
            <Truck size={16} className="shrink-0 text-brand-600" />
            Estimated delivery: 30 - 45 minutes after confirmation
          </div>
          <Button type="submit" size="lg" fullWidth>
            Review Order — {formatNaira(total + settings.deliveryFee)}
          </Button>
        </div>
      </form>

      {showSummary && (
        <OrderReviewModal
          paymentMethod={paymentMethod}
          onClose={() => setShowSummary(false)}
          onPlaceOrder={handleSubmit(onSubmit)}
          onContinueToDemoPayment={() => {
            setShowSummary(false);
            setShowDemoPayment(true);
          }}
          submitting={submitting}
        />
      )}

      {showDemoPayment && (
        <DemoPaymentModal
          amount={total + settings.deliveryFee}
          onBack={() => {
            setShowDemoPayment(false);
            setShowSummary(true);
          }}
          onComplete={handleSubmit(onSubmit)}
          submitting={submitting}
        />
      )}
    </div>
  );
}

function OrderReviewModal({
  paymentMethod,
  onClose,
  onPlaceOrder,
  onContinueToDemoPayment,
  submitting,
}: {
  paymentMethod: PaymentMethod;
  onClose: () => void;
  onPlaceOrder: () => void;
  onContinueToDemoPayment: () => void;
  submitting: boolean;
}) {
  const { items, subtotal } = useCartStore();
  const { settings } = useSettingsStore();
  const total = subtotal();
  const isDemoPayment = paymentMethod === "Demo Payment";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl animate-slide-up sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-ink-900">Confirm Your Order</h2>
        <div className="mt-4 divide-y divide-ink-100">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex justify-between py-2.5 text-sm">
              <span className="text-ink-700">
                {item.quantity}x {item.name}
              </span>
              <span className="font-semibold text-ink-900">
                {formatNaira((item.price + item.extras.reduce((s, e) => s + e.price, 0)) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <OrderSummary subtotal={total} deliveryFee={settings.deliveryFee} />
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={submitting}>
            Back
          </Button>
          {isDemoPayment ? (
            <Button fullWidth onClick={onContinueToDemoPayment}>
              Continue to Payment
            </Button>
          ) : (
            <Button fullWidth onClick={onPlaceOrder} loading={submitting}>
              Place Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DemoPaymentModal({
  amount,
  onBack,
  onComplete,
  submitting,
}: {
  amount: number;
  onBack: () => void;
  onComplete: () => void;
  submitting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={submitting ? undefined : onBack}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-6 text-center shadow-xl animate-slide-up sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Sparkles size={26} />
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink-900">Demo Payment</h2>
        <p className="mt-1 text-sm text-ink-400">
          This is a simulated checkout for demo purposes only.
        </p>

        <div className="mt-5 rounded-xl bg-ink-50 py-4">
          <p className="text-xs font-semibold text-ink-400">Amount to "pay"</p>
          <p className="text-2xl font-extrabold text-ink-900">{formatNaira(amount)}</p>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-left text-xs font-medium text-blue-800">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          No real money will be charged. No card details are collected or stored — this button
          only simulates a successful payment for demonstration.
        </p>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" fullWidth onClick={onBack} disabled={submitting}>
            Back
          </Button>
          <Button fullWidth onClick={onComplete} loading={submitting}>
            Complete Demo Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
