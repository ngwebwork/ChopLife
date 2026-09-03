import { Link } from "react-router-dom";
import type { Category } from "@/types";
import { handleImageError } from "@/utils/image";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/menu?category=${category.id}`}
      className="group relative flex h-28 shrink-0 w-36 items-end overflow-hidden rounded-2xl sm:h-32 sm:w-44"
    >
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        onError={handleImageError}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent" />
      <span className="relative z-10 p-3 text-sm font-bold text-white">{category.name}</span>
    </Link>
  );
}
