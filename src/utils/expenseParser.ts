import { Category, Account, TransactionType } from '../types';

export interface ParsedExpenseResult {
  success: boolean;
  amount?: number;
  type: TransactionType;
  merchant?: string;
  categoryId?: string;
  categoryName?: string;
  accountId?: string;
  accountName?: string;
  notes?: string;
  detectedKeyword?: string;
  confidence: 'high' | 'medium' | 'low';
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'cat-food': [
    'food', 'lunch', 'dinner', 'breakfast', 'meal', 'cafe', 'coffee', 'starbucks',
    'swiggy', 'zomato', 'mcdonalds', 'mcd', 'burger', 'pizza', 'subway', 'kfc',
    'dominos', 'domino', 'biryani', 'snack', 'tea', 'chai', 'restaurant', 'bakery',
    'bar', 'pub', 'bistro', 'diner', 'eat',
  ],
  'cat-groceries': [
    'grocery', 'groceries', 'supermarket', 'mart', 'blinkit', 'zepto', 'instamart',
    'bigbasket', 'walmart', 'trader joe', 'vegetables', 'fruits', 'milk', 'dairy',
    'bread', 'provisions', 'kirana',
  ],
  'cat-transport': [
    'uber', 'ola', 'rapido', 'cab', 'taxi', 'metro', 'bus', 'train', 'irctc',
    'flight', 'airline', 'fuel', 'petrol', 'diesel', 'shell', 'hpcl', 'bpcl', 'ioc',
    'parking', 'fastag', 'toll', 'fare', 'commute',
  ],
  'cat-shopping': [
    'amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'clothes', 'clothing', 'shoes',
    'mall', 'shop', 'electronics', 'apple', 'nike', 'adidas', 'retail', 'purchase',
  ],
  'cat-bills': [
    'electricity', 'bescom', 'power', 'water', 'wifi', 'broadband', 'airtel', 'jio',
    'vi', 'recharge', 'gas', 'cylinder', 'bill', 'utility', 'utilities', 'insurance',
    'lic', 'tax',
  ],
  'cat-entertainment': [
    'netflix', 'spotify', 'prime', 'primevideo', 'movie', 'pvr', 'inox', 'bookmyshow',
    'cinema', 'theatre', 'concert', 'game', 'gaming', 'steam', 'hotstar', 'youtube',
    'playstation', 'xbox',
  ],
  'cat-health': [
    'pharmacy', 'medicine', 'medicines', 'hospital', 'clinic', 'doctor', 'lab',
    'apollo', '1mg', 'pharma', 'dental', 'medical', 'chemist', 'drugs', 'health',
  ],
  'cat-rent': [
    'rent', 'maintenance', 'flat', 'society', 'maid', 'cook', 'landlord', 'house',
    'apartment',
  ],
  'cat-subscriptions': [
    'subscription', 'recurring', 'renewal', 'icloud', 'gym', 'membership',
    'annual fee', 'monthly plan',
  ],
  'cat-investment': [
    'zerodha', 'groww', 'mutual fund', 'sip', 'stocks', 'shares', 'crypto',
    'coin', 'upstox', 'etf', 'invest',
  ],
  'cat-salary': [
    'salary', 'payroll', 'wages', 'stipend', 'bonus', 'client payment',
  ],
};

export function parseExpenseText(
  rawText: string,
  categories: Category[] = [],
  accounts: Account[] = []
): ParsedExpenseResult {
  if (!rawText || !rawText.trim()) {
    return {
      success: false,
      type: 'expense',
      confidence: 'low',
    };
  }

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Transaction Type
  const transferKeywords = [
    'transferred to', 'transfer to', 'transferred from', 'transfer from',
    'fund transfer', 'funds transfer', 'self transfer', 'a/c transfer',
    'ac transfer', 'trf to', 'account to account', 'imps', 'neft', 'rtgs',
    'transferred', 'transfer', 'moved to',
  ];
  const incomeKeywords = [
    'credited', 'credit', 'received', 'salary', 'deposited', 'deposit',
    'refund', 'cashback', 'bonus', 'incoming', 'added to',
  ];
  const expenseKeywords = [
    'debited', 'debit', 'spent', 'paid', 'sent', 'charge', 'deducted',
    'purchase', 'withdrawn', 'spent at',
  ];

  let detectedType: TransactionType = 'expense';
  const hasTransfer = transferKeywords.some(k => lower.includes(k));
  const hasIncome = incomeKeywords.some(k => lower.includes(k));
  const hasExpense = expenseKeywords.some(k => lower.includes(k));

  if (hasTransfer && !hasIncome) {
    detectedType = 'transfer';
  } else if (hasIncome && !hasExpense) {
    detectedType = 'income';
  } else {
    detectedType = 'expense';
  }

  // 2. Extract Amount
  let amount: number | undefined;

  // Pattern A: Currency Symbol + Number (e.g. INR 350.00, Rs. 1,499, ₹250, $45.20)
  const currencyAmountRegex = /(?:INR|Rs\.?|₹|\$|€|£)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/i;
  const matchA = text.match(currencyAmountRegex);
  if (matchA && matchA[1]) {
    amount = parseFloat(matchA[1].replace(/,/g, ''));
  }

  // Pattern B: Keyword + Amount (e.g. "debited for 450", "paid 250", "amount 1200.50")
  if (!amount) {
    const keywordAmountRegex = /(?:debited|credited|spent|paid|amount|amt|total|cost|price|bill|charge)(?:\s*(?:of|for|by|is|:))?\s*(?:INR|Rs\.?|₹|\$|€|£)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/i;
    const matchB = text.match(keywordAmountRegex);
    if (matchB && matchB[1]) {
      amount = parseFloat(matchB[1].replace(/,/g, ''));
    }
  }

  // Pattern C: Number + Currency Symbol (e.g. "450 INR", "1500 Rs")
  if (!amount) {
    const numCurrencyRegex = /([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)\s*(?:INR|Rs\.?|₹|\$|€|£)/i;
    const matchC = text.match(numCurrencyRegex);
    if (matchC && matchC[1]) {
      amount = parseFloat(matchC[1].replace(/,/g, ''));
    }
  }

  // Pattern D: Standalone Number in short natural text (e.g. "Coffee 45", "120 Uber")
  if (!amount) {
    const tokens = text.split(/\s+/);
    for (const token of tokens) {
      const cleaned = token.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      // Reasonable transaction range check and doesn't look like a date or time
      if (!isNaN(parsed) && parsed > 0 && parsed < 10000000 && !token.includes('-') && !token.includes(':') && !token.includes('/')) {
        amount = parsed;
        break;
      }
    }
  }

  // 3. Extract Merchant / Beneficiary
  let merchant: string | undefined;

  // Check SMS beneficiary patterns: "to <MERCHANT> UPI Ref", "at <MERCHANT> on", "info: <MERCHANT>"
  const smsPatterns = [
    /(?:to|towards|at|vpa)\s+([A-Za-z0-9&.\-_ ]{2,32}?)(?:\s+(?:UPI|Ref|via|on|Bal|dated|using|\.|\n|$))/i,
    /(?:paid to|transferred to|sent to)\s+([A-Za-z0-9&.\-_ ]{2,32}?)(?:\s+(?:on|via|Ref|Bal|using|\.|\n|$))/i,
    /(?:merchant|info|store):\s*([A-Za-z0-9&.\-_ ]{2,32})/i,
    /(?:charge at|purchase at)\s+([A-Za-z0-9&.\-_ ]{2,32}?)(?:\s+(?:on|via|Bal|\.|\n|$))/i,
  ];

  for (const pattern of smsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim().replace(/[.,;:]$/, '');
      if (candidate.length >= 2 && !candidate.toLowerCase().startsWith('your') && !candidate.toLowerCase().startsWith('acct')) {
        merchant = candidate;
        break;
      }
    }
  }

  // Short natural phrase merchant extraction
  if (!merchant) {
    // E.g. "Dinner at Subway 450" -> Subway
    const atMatch = text.match(/\bat\s+([A-Za-z0-9&'\- ]{2,25})/i);
    if (atMatch && atMatch[1]) {
      merchant = atMatch[1].replace(/\b[0-9]+.*$/, '').trim();
    }
  }

  if (!merchant) {
    // E.g. "Coffee 45" or "Uber 350" -> first word if it's not a number
    const words = text.split(/\s+/).filter(w => isNaN(Number(w.replace(/[^0-9.]/g, ''))));
    if (words.length > 0) {
      merchant = words.slice(0, 3).join(' ');
    }
  }

  // Clean merchant name
  if (merchant) {
    merchant = merchant
      .replace(/\b(ref|upi|bal|inr|rs|a\/c|acct|xx\d+|\*+\d+)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 4. Match Category
  let matchedCategoryId: string | undefined;
  let matchedCategoryName: string | undefined;
  let matchedKeyword: string | undefined;

  for (const [catSlug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      const kwRegex = new RegExp(`\\b${kw}\\b`, 'i');
      if (kwRegex.test(lower)) {
        matchedKeyword = kw;
        // Try finding category by id or name
        const found = categories.find(
          c => c.id === catSlug || c.name.toLowerCase().includes(kw)
        );
        if (found) {
          matchedCategoryId = found.id;
          matchedCategoryName = found.name;
        } else {
          // Fallback matching to category slug
          matchedCategoryId = catSlug;
        }
        break;
      }
    }
    if (matchedCategoryId) break;
  }

  // Fallback category if not found
  if (!matchedCategoryId && categories.length > 0) {
    if (detectedType === 'income') {
      const incomeCat = categories.find(c => c.type === 'income');
      if (incomeCat) {
        matchedCategoryId = incomeCat.id;
        matchedCategoryName = incomeCat.name;
      }
    } else {
      const defaultCat = categories.find(c => c.isDefault && c.type === 'expense') || categories[0];
      matchedCategoryId = defaultCat.id;
      matchedCategoryName = defaultCat.name;
    }
  }

  // 5. Match Account
  let matchedAccountId: string | undefined;
  let matchedAccountName: string | undefined;

  if (accounts.length > 0) {
    // Check for mask or bank mention
    const maskMatch = text.match(/(?:a\/c|acct|account|\*\*|xx)\s*([0-9]{3,4})/i);
    if (maskMatch && maskMatch[1]) {
      const digits = maskMatch[1];
      const acc = accounts.find(a => a.accountNumberMask?.includes(digits) || a.name.includes(digits));
      if (acc) {
        matchedAccountId = acc.id;
        matchedAccountName = acc.name;
      }
    }

    if (!matchedAccountId) {
      if (lower.includes('card') || lower.includes('pos')) {
        const cardAcc = accounts.find(a => a.type === 'credit' || a.type === 'debit');
        if (cardAcc) {
          matchedAccountId = cardAcc.id;
          matchedAccountName = cardAcc.name;
        }
      } else if (lower.includes('cash')) {
        const cashAcc = accounts.find(a => a.type === 'cash');
        if (cashAcc) {
          matchedAccountId = cashAcc.id;
          matchedAccountName = cashAcc.name;
        }
      } else if (lower.includes('upi') || lower.includes('bank') || lower.includes('neft') || lower.includes('imps')) {
        const bankAcc = accounts.find(a => a.type === 'bank');
        if (bankAcc) {
          matchedAccountId = bankAcc.id;
          matchedAccountName = bankAcc.name;
        }
      }
    }

    if (!matchedAccountId) {
      matchedAccountId = accounts[0].id;
      matchedAccountName = accounts[0].name;
    }
  }

  const confidence = amount && merchant ? 'high' : amount ? 'medium' : 'low';

  return {
    success: !!amount,
    amount,
    type: detectedType,
    merchant: merchant || (detectedType === 'income' ? 'Income' : 'Expense'),
    categoryId: matchedCategoryId,
    categoryName: matchedCategoryName,
    accountId: matchedAccountId,
    accountName: matchedAccountName,
    detectedKeyword: matchedKeyword,
    confidence,
    notes: text.length > 80 ? text.substring(0, 100) + '...' : undefined,
  };
}
