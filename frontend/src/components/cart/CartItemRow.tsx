import { Trash2 } from "lucide-react";
import type { CartItem } from "@/types";
import { formatNaira } from "@/utils/currency";
import { QuantitySelector } from "@/components/common/QuantitySelector";
import { useCartStore } from "@/store/cartStore";

export function CartItemRow({ item }: { item: CartItem }) {
  const { increment, decrement, removeItem } = useCartStore();
  const extrasTotal = item.extras.reduce((sum, e) => sum + e.price, 0);
  const lineTotal = (item.price + extrasTotal) * item.quantity;

  return (
    <div className="flex gap-4 border-b border-ink-100 py-4 last:border-0">
      <img
        src={item.image}
        alt={item.name}
        className="h-20 w-20 shrink-0 rounded-xl object-cover"
      />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-bold text-ink-900">{item.name}</h4>
            <button
              onClick={() => removeItem(item.cartItemId)}
              aria-label={`Remove ${item.name} from cart`}
              className="shrink-0 rounded-full p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>
          {item.extras.length > 0 && (
            <p className="mt-0.5 text-xs text-ink-400">
              {item.extras.map((e) => e.name).join(", ")}
            </p>
          )}
          {item.specialInstructions && (
            <p className="mt-0.5 text-xs italic text-ink-400">"{item.specialInstructions}"</p>
          )}
          {!item.available && (
            <p className="mt-1 text-xs font-semibold text-red-600">
              No longer available — please remove this item
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={() => increment(item.cartItemId)}
            onDecrement={() => decrement(item.cartItemId)}
            size="sm"
          />
          <span className="text-sm font-extrabold text-ink-900">{formatNaira(lineTotal)}</span>
        </div>
      </div>
    </div>
  );
}
