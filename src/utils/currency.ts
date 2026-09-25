/**
 * Financial currency formatting and safe money arithmetic utilities.
 */

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(
  amount: number,
  currencySymbol: string = '₹',
  isPrivacyMode: boolean = false,
  showDecimals: boolean = false
): string {
  if (isPrivacyMode) {
    return `${currencySymbol}••••••`;
  }

  const rounded = roundMoney(amount);
  const isNegative = rounded < 0;
  const absAmount = Math.abs(rounded);

  // Indian Rupee formatting supports 2-2-3 grouping (e.g. 1,89,450), international uses 3-3-3
  let formattedNumber: string;

  if (currencySymbol === '₹') {
    formattedNumber = formatIndianNumber(absAmount, showDecimals);
  } else {
    formattedNumber = formatStandardNumber(absAmount, showDecimals);
  }

  return `${isNegative ? '-' : ''}${currencySymbol}${formattedNumber}`;
}

function formatIndianNumber(val: number, showDecimals: boolean): string {
  const parts = val.toFixed(showDecimals ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const result =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return showDecimals && decimalPart ? `${result}.${decimalPart}` : result;
}

function formatStandardNumber(val: number, showDecimals: boolean): string {
  const parts = val.toFixed(showDecimals ? 2 : 0).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1];
  return showDecimals && decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

/**
 * Format signed transaction amount (+₹75,000 or -₹1,240 or ₹10,000)
 */
export function formatSignedAmount(
  amount: number,
  type: 'expense' | 'income' | 'transfer',
  currencySymbol: string = '₹',
  isPrivacyMode: boolean = false
): string {
  if (isPrivacyMode) {
    return `${currencySymbol}••••••`;
  }

  const formatted = formatCurrency(Math.abs(amount), currencySymbol, false, false);
  if (type === 'income') {
    return `+${formatted}`;
  }
  if (type === 'expense') {
    return `-${formatted}`;
  }
  return formatted;
}
