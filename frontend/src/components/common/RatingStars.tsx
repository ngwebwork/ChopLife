import { Star } from "lucide-react";

export function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <Star size={size} className="fill-amber-400 text-amber-400" />
      <span className="text-xs font-semibold text-ink-800">{rating.toFixed(1)}</span>
    </div>
  );
}
