import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft, ShieldCheck, Flame } from "lucide-react";
import { menuService } from "@/services/menuService";
import type { Extra, MenuItem } from "@/types";
import { formatNaira } from "@/utils/currency";
import { RatingStars } from "@/components/common/RatingStars";
import { QuantitySelector } from "@/components/common/QuantitySelector";
import { Textarea } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function FoodDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const [item, setItem] = useState<MenuItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (!id) return;
    setItem(null);
    setNotFound(false);
    setQuantity(1);
    setSelectedExtras([]);
    setInstructions("");
    menuService
      .getById(id)
      .then(setItem)
      .catch((err) => {
        setNotFound(true);
        toast.error(getErrorMessage(err));
      });
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-ink-900">Food item not found</h1>
        <p className="mt-2 text-sm text-ink-400">It may have been removed from the menu.</p>
        <Link to="/menu" className="mt-6 inline-block">
          <Button>Back to Menu</Button>
        </Link>
      </div>
    );
  }

  useDocumentTitle(item ? item.name : "Menu Item");

  if (!item) {
    return <LoadingSpinner fullPage label="Loading dish..." />;
  }

  const toggleExtra = (extra: Extra) => {
    setSelectedExtras((prev) =>
      prev.some((e) => e.name === extra.name)
        ? prev.filter((e) => e.name !== extra.name)
        : [...prev, extra]
    );
  };

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const total = (item.price + extrasTotal) * quantity;

  const handleAddToCart = () => {
    addItem({ menuItem: item, quantity, extras: selectedExtras, specialInstructions: instructions.trim() });
    toast.success(`${item.name} added to cart`);
    navigate("/cart");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-ink-600 hover:text-ink-900 cursor-pointer"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-ink-100">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
              {item.name}
            </h1>
            <RatingStars rating={item.rating} size={16} />
          </div>
          <p className="mt-2 text-sm text-ink-600">{item.description}</p>
          <p className="mt-4 text-2xl font-extrabold text-brand-700">{formatNaira(item.price)}</p>

          <div className="mt-2">
            {item.available ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                <ShieldCheck size={16} /> Available now
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                <Flame size={16} /> Currently unavailable
              </span>
            )}
          </div>

          {item.ingredients.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-ink-900">Ingredients</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.extras.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-ink-900">Extras</h3>
              <div className="mt-2 space-y-2">
                {item.extras.map((extra) => {
                  const checked = selectedExtras.some((e) => e.name === extra.name);
                  return (
                    <label
                      key={extra.name}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExtra(extra)}
                          className="h-4 w-4 rounded accent-brand-600"
                        />
                        {extra.name}
                      </span>
                      <span className="font-semibold text-ink-700">
                        +{formatNaira(extra.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Textarea
              label="Special Instructions"
              placeholder="E.g. less spicy, no onions..."
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-700">Quantity</span>
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity((q) => q + 1)}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            />
          </div>

          <Button
            size="lg"
            fullWidth
            className="mt-6"
            disabled={!item.available}
            onClick={handleAddToCart}
          >
            {item.available ? `Add to Cart — ${formatNaira(total)}` : "Currently Unavailable"}
          </Button>
        </div>
      </div>
    </div>
  );
}
