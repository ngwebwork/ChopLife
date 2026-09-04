import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import { menuService } from "@/services/menuService";
import { categoryService } from "@/services/categoryService";
import type { Category, MenuItem } from "@/types";
import { FoodCard } from "@/components/menu/FoodCard";
import { MenuGridSkeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import clsx from "clsx";

type SortOption = "default" | "price-asc" | "price-desc" | "rating";

export function Menu() {
  useDocumentTitle("Menu");
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState<SortOption>("default");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const activeCategory = searchParams.get("category") || "";
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    categoryService.list(true).then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setItems(null);
    menuService
      .list({ category: activeCategory || undefined, search: debouncedSearch || undefined })
      .then(setItems)
      .catch(() => setItems([]));
  }, [activeCategory, debouncedSearch]);

  const displayedItems = useMemo(() => {
    if (!items) return null;
    let result = [...items];
    if (showAvailableOnly) result = result.filter((i) => i.available);

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }
    return result;
  }, [items, sort, showAvailableOnly]);

  const setCategory = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("category", id);
    else next.delete("category");
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink-900">Our Menu</h1>
        <p className="mt-1 text-sm text-ink-400">
          Explore everything ChopLife Kitchen has to offer, freshly made and ready to order.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for jollof rice, suya, shawarma..."
            aria-label="Search menu"
            className="w-full rounded-full border border-ink-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-ink-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Sort menu items"
            className="rounded-full border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700"
          >
            <option value="default">Sort: Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        <label className="flex items-center gap-2 whitespace-nowrap rounded-full border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="h-4 w-4 rounded accent-brand-600"
          />
          Available only
        </label>
      </div>

      {/* Category chips */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setCategory("")}
          className={clsx(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            !activeCategory ? "bg-brand-600 text-white" : "bg-white text-ink-600 border border-ink-200"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={clsx(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeCategory === cat.id
                ? "bg-brand-600 text-white"
                : "bg-white text-ink-600 border border-ink-200"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8">
        {displayedItems === null ? (
          <MenuGridSkeleton />
        ) : displayedItems.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No dishes found"
            description="Try a different search term or category."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {displayedItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
