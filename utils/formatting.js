// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format currency value
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  // Handle very small amounts with more precision
  const minimumFractionDigits = 2;
  const maximumFractionDigits = amount < 0.01 ? 4 : amount < 0.1 ? 3 : 2;
  
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });
    return formatter.format(amount);
  } catch {
    // Fallback for unsupported currencies
    return `${amount.toFixed(maximumFractionDigits)} ${currency}`;
  }
}

/**
 * Format unit display
 * @param {number} quantity - The quantity
 * @param {string} unit - The unit
 * @returns {string} - Formatted string
 */
export function formatUnit(quantity, unit) {
  // Handle decimal places based on the value
  const decimals = quantity >= 100 ? 0 : quantity >= 10 ? 1 : 2;
  return `${quantity.toFixed(decimals)} ${unit}`;
}

/**
 * Format percentage
 * @param {number} percentage - The percentage value
 * @returns {string} - Formatted percentage string
 */
export function formatPercentage(percentage) {
  return `${percentage.toFixed(1)}%`;
}

/**
 * Format per-unit price for display
 * @param {number} perUnitPrice - Price per unit
 * @param {string} currency - Currency code
 * @param {string} unit - Unit name
 * @returns {string} - Formatted string like "$0.166/ml"
 */
export function formatPerUnitPrice(perUnitPrice, currency, unit) {
  return `${formatCurrency(perUnitPrice, currency)}/${unit}`;
}

/**
 * Get short currency symbol
 * @param {string} currencyCode - Currency code
 * @returns {string} - Currency symbol
 */
export function getCurrencySymbol(currencyCode) {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CNY: '¥',
    AUD: 'A$',
    CAD: 'C$',
  };
  return symbols[currencyCode] || currencyCode;
}
