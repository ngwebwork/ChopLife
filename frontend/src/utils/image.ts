import type { SyntheticEvent } from "react";

/** Neutral "image unavailable" placeholder - a plate/utensils icon, never text. */
export const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F1EDE8'/%3E%3Cg fill='none' stroke='%23C9C0B4' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='200' cy='140' r='55'/%3E%3Cpath d='M170 140a30 30 0 0 1 60 0'/%3E%3Cpath d='M140 230h120'/%3E%3C/g%3E%3C/svg%3E";

/** Swaps a broken image to a neutral fallback instead of leaving a broken-image icon. */
export function handleImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = FALLBACK_IMAGE;
}
