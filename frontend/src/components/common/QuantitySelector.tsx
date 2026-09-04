import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  size?: "sm" | "md";
}

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  size = "md",
}: QuantitySelectorProps) {
  const btnSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-ink-200 bg-white px-1.5 py-1">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className={`flex ${btnSize} items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 disabled:opacity-30 cursor-pointer`}
      >
        <Minus size={size === "sm" ? 14 : 16} />
      </button>
      <span className="w-4 text-center text-sm font-semibold tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={`flex ${btnSize} items-center justify-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 cursor-pointer`}
      >
        <Plus size={size === "sm" ? 14 : 16} />
      </button>
    </div>
  );
}
