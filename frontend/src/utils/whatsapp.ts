import type { CartItem, Order } from "@/types";
import { formatNaira } from "@/utils/currency";

/** Strips everything but digits so numbers pasted with +, spaces or dashes still work. */
function sanitizeNumber(number: string): string {
  return number.replace(/\D/g, "");
}

/**
 * Builds a wa.me deep link with a pre-filled order summary message.
 * The WhatsApp number always comes from restaurant settings (backend-configured),
 * falling back to VITE_WHATSAPP_NUMBER only if settings haven't loaded yet.
 */
export function buildWhatsAppOrderLink(order: Order, whatsappNumber: string): string {
  const number = sanitizeNumber(whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || "");

  const itemLines = order.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join("\n");

  const message = [
    "Hello ChopLife Kitchen,",
    "",
    "I just placed an order.",
    "",
    `Order: #${order.orderNumber}`,
    "",
    "Items:",
    itemLines,
    "",
    `Total: ${formatNaira(order.total)}`,
    "",
    "Delivery Address:",
    `${order.deliveryAddress}, ${order.city}`,
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Same message shape, built from the live cart before an order exists yet. */
export function buildWhatsAppCartLink(
  items: CartItem[],
  total: number,
  whatsappNumber: string
): string {
  const number = sanitizeNumber(whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || "");

  const itemLines = items.map((item) => `${item.quantity}x ${item.name}`).join("\n");

  const message = [
    "Hello ChopLife Kitchen,",
    "",
    "I'd like to place an order:",
    "",
    itemLines,
    "",
    `Total: ${formatNaira(total)}`,
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
