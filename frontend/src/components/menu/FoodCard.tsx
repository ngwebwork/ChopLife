import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import type { MenuItem } from "@/types";
import { formatNaira } from "@/utils/currency";
import { RatingStars } from "@/components/common/RatingStars";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";

export function FoodCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!item.available) return;
    addItem({ menuItem: item, quantity: 1, extras: [], specialInstructions: "" });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <Link
      to={`/menu/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-shadow hover:shadow-lg hover:shadow-ink-900/5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.popular && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            Popular
          </span>
        )}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900/60">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-900">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-ink-900 sm:text-base">{item.name}</h3>
          <RatingStars rating={item.rating} />
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-xs text-ink-400 sm:text-sm">
          {item.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-extrabold text-ink-900 sm:text-lg">
            {formatNaira(item.price)}
          </span>
          <button
            onClick={handleQuickAdd}
            disabled={!item.available}
            aria-label={`Add ${item.name} to cart`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-ink-200 cursor-pointer"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}
