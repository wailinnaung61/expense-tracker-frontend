import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get locale for currency formatting - ensures proper symbols (¥, $, €, etc.)
 */
function getCurrencyLocale(currency: string): string {
  const currencyLocaleMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'JPY': 'ja-JP',
    'SGD': 'en-SG',
    'THB': 'th-TH',
    'MMK': 'my-MM',
  };
  return currencyLocaleMap[currency] || 'en-US';
}

/**
 * Format currency amount with proper symbols (¥, $, €, etc.)
 * @param amount - The amount to format
 * @param currency - Currency code (e.g., 'USD', 'JPY', 'EUR')
 * @param locale - Locale for formatting (optional, auto-detected)
 * @returns Formatted currency string with symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale?: string
): string {
  const finalLocale = locale || getCurrencyLocale(currency);
  const formatted = new Intl.NumberFormat(finalLocale, {
    style: "currency",
    currency: currency,
    currencyDisplay: 'narrowSymbol', // Display currency codes (JPY, USD, EUR, etc.)
  }).format(amount);
  
  // Replace full-width currency symbols with half-width
  return formatted
    .replace(/￥/g, '¥')   // JPY: full-width yen → half-width yen
    .replace(/＄/g, '$')   // USD/SGD: full-width dollar → half-width dollar
    .replace(/￡/g, '£')   // GBP: full-width pound → half-width pound
    .replace(/€/g, '€');  // EUR: ensure proper euro symbol
}

/**
 * Get currency symbol for a given currency code
 * @param currency - Currency code (e.g., 'USD', 'JPY', 'EUR')
 * @returns Currency symbol (e.g., '$', '¥', '€')
 */
export function getCurrencySymbol(currency: string = "USD"): string {
  const locale = getCurrencyLocale(currency);
  const formatter = new Intl.NumberFormat(locale, {
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
