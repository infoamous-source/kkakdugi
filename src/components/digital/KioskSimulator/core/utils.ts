import type { OrderMenuItem, OrderOptionItem, OrderCartItem } from './types';

/**
 * Format a price number using Korean locale (e.g. 4500 → "4,500")
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

/**
 * Calculate the total price of a single menu item including selected options.
 */
export function calculateItemPrice(
  item: OrderMenuItem,
  options: OrderOptionItem[],
): number {
  return item.price + options.reduce((sum, opt) => sum + opt.priceAdd, 0);
}

/**
 * Sum all cart items (quantity × unitPrice).
 */
export function calculateCartTotal(cart: OrderCartItem[]): number {
  return cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
}

/**
 * Split a total into pre-tax amount and VAT (1/11 rule used in Korea).
 */
export function calculateTax(total: number): { amount: number; tax: number } {
  const tax = Math.round(total / 11);
  return { amount: total - tax, tax };
}
