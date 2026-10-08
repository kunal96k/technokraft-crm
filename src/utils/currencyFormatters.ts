/**
 * Formats an amount into Indian Rupee currency string representation (en-IN).
 * Supports prefix customisation (e.g. '₹' for HTML/browser or 'INR' for jsPDF standard fonts).
 */
export function formatCurrencyINR(
  amount: number,
  options?: { showSymbol?: boolean; prefix?: string }
): string {
  const numericAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
  const formatted = Math.round(numericAmount).toLocaleString('en-IN');

  if (options?.prefix !== undefined) {
    return options.prefix ? `${options.prefix} ${formatted}` : formatted;
  }
  if (options?.showSymbol === false) {
    return formatted;
  }
  return `₹${formatted}`;
}

export function formatNumberINR(amount: number): string {
  const numericAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
  return Math.round(numericAmount).toLocaleString('en-IN');
}

export const formatLakhsINR = (amount: number): string => {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 1)} Cr`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${l.toFixed(l % 1 === 0 ? 0 : 1)} L`;
  }
  return formatCurrencyINR(amount);
};
