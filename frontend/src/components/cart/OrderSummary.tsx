import { formatNaira } from "@/utils/currency";

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  minimumOrder?: number;
}

export function OrderSummary({ subtotal, deliveryFee, discount = 0, minimumOrder }: OrderSummaryProps) {
  const total = subtotal + deliveryFee - discount;
  const belowMinimum = minimumOrder !== undefined && subtotal < minimumOrder && subtotal > 0;

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <h3 className="mb-4 text-base font-bold text-ink-900">Order Summary</h3>
      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between text-ink-600">
          <dt>Subtotal</dt>
          <dd className="font-medium text-ink-900">{formatNaira(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-ink-600">
          <dt>Delivery</dt>
          <dd className="font-medium text-ink-900">{formatNaira(deliveryFee)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-700">
            <dt>Discount</dt>
            <dd className="font-medium">-{formatNaira(discount)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex justify-between border-t border-ink-100 pt-4">
        <span className="text-base font-bold text-ink-900">Total</span>
        <span className="text-lg font-extrabold text-brand-700">{formatNaira(total)}</span>
      </div>
      {belowMinimum && minimumOrder && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Minimum order is {formatNaira(minimumOrder)}. Add {formatNaira(minimumOrder - subtotal)} more to checkout.
        </p>
      )}
    </div>
  );
}
