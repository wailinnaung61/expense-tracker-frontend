import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency amount based on user's currency setting
 * @param amount - The amount to format
 * @param currency - Currency code (e.g., 'USD', 'JPY', 'EUR')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Get currency symbol for a given currency code
 * @param currency - Currency code (e.g., 'USD', 'JPY', 'EUR')
 * @returns Currency symbol (e.g., '$', '¥', '€')
 */
export function getCurrencySymbol(currency: string = "USD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Format 0 and extract symbol
  const parts = formatter.formatToParts(0);
  const symbolPart = parts.find(part => part.type === "currency");
  return symbolPart?.value || "$";
}
