const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formats a number as Nigerian Naira, e.g. formatNaira(5500) -> "₦5,500" */
export function formatNaira(amount: number): string {
  return formatter.format(amount);
}
