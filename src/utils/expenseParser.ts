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
  const isSelfTransfer =
    lower.includes('self transfer') ||
    lower.includes('own account') ||
    lower.includes('transfer to self') ||
    lower.includes('round ups to') ||
    lower.includes('transferred from round ups') ||
    lower.includes('between your accounts') ||
    (lower.includes('transferred from a/c') && lower.includes('to a/c'));

  // Sanitize phrases containing 'credit' that are NOT credit transactions
  const sanitizedForCredit = lower
    .replace(/credit\s+card/g, 'cc_card')
    .replace(/credit\s+limit/g, 'limit_val')
    .replace(/credit\s+score/g, 'score_val')
    .replace(/line\s+of\s+credit/g, 'loc_val')
    .replace(/available\s+credit/g, 'avail_cr')
    .replace(/credit\s+balance/g, 'cr_bal');

  const hasExplicitCredit =
    sanitizedForCredit.includes('credited') ||
    sanitizedForCredit.includes('credit of') ||
    sanitizedForCredit.includes('credit to') ||
    sanitizedForCredit.includes('credited to') ||
    sanitizedForCredit.includes('credited with') ||
    sanitizedForCredit.includes('credited by') ||
    sanitizedForCredit.includes('is credited') ||
    sanitizedForCredit.includes('has been credited') ||
    sanitizedForCredit.includes('cr to a/c') ||
    sanitizedForCredit.includes('cr to account') ||
    sanitizedForCredit.includes('received') ||
    sanitizedForCredit.includes('receive of') ||
    sanitizedForCredit.includes('deposited') ||
    sanitizedForCredit.includes('deposit of') ||
    sanitizedForCredit.includes('deposit in') ||
    sanitizedForCredit.includes('deposited to') ||
    sanitizedForCredit.includes('refund') ||
    sanitizedForCredit.includes('cashback') ||
    sanitizedForCredit.includes('cash back') ||
    sanitizedForCredit.includes('reversal') ||
    sanitizedForCredit.includes('reversed') ||
    sanitizedForCredit.includes('sent you') ||
    sanitizedForCredit.includes('sent to you') ||
    sanitizedForCredit.includes('sent to your') ||
    sanitizedForCredit.includes('paid you') ||
    sanitizedForCredit.includes('paid to you') ||
    sanitizedForCredit.includes('paid to your') ||
    sanitizedForCredit.includes('added to your') ||
    sanitizedForCredit.includes('added to account') ||
    sanitizedForCredit.includes('added to wallet') ||
    sanitizedForCredit.includes('money added') ||
    sanitizedForCredit.includes('transfer from') ||
    sanitizedForCredit.includes('trf from') ||
    sanitizedForCredit.includes('transferred from') ||
    sanitizedForCredit.includes('salary') ||
    sanitizedForCredit.includes('inward');

  const hasExplicitDebit =
    lower.includes('debited') ||
    lower.includes('debit of') ||
    lower.includes('debited from') ||
    lower.includes('debited by') ||
    lower.includes('is debited') ||
    lower.includes('has been debited') ||
    lower.includes('dr from a/c') ||
    lower.includes('spent on') ||
    lower.includes('spent at') ||
    lower.includes('spent from') ||
    lower.includes('spent') ||
    lower.includes('withdrawn') ||
    lower.includes('withdrawal') ||
    lower.includes('sent from a/c') ||
    lower.includes('sent from your') ||
    lower.includes('sent from account') ||
    (lower.includes('sent to') && !lower.includes('sent to you') && !lower.includes('sent to your')) ||
    (lower.includes('paid to') && !lower.includes('paid to you') && !lower.includes('paid to your')) ||
    lower.includes('paid at') ||
    lower.includes('paid for') ||
    (lower.includes('paid') && !sanitizedForCredit.includes('paid you') && !sanitizedForCredit.includes('paid to you') && !sanitizedForCredit.includes('paid to your') && !sanitizedForCredit.includes('received') && !sanitizedForCredit.includes('refund') && !sanitizedForCredit.includes('cashback')) ||
    (lower.includes('transferred to') && !lower.includes('transferred to your') && !lower.includes('transferred to you')) ||
    (lower.includes('transfer to') && !lower.includes('transfer to your') && !lower.includes('transfer to you')) ||
    (lower.includes('trf to') && !lower.includes('trf to your') && !lower.includes('trf to you')) ||
    lower.includes('deducted from') ||
    lower.includes('deducted for') ||
    lower.includes('charged to') ||
    lower.includes('charged') ||
    lower.includes('purchase of') ||
    lower.includes('purchased at');

  let detectedType: TransactionType = 'expense';
  if (isSelfTransfer) {
    detectedType = 'transfer';
  } else if (hasExplicitCredit && !hasExplicitDebit) {
    detectedType = 'income';
  } else if (hasExplicitDebit && !hasExplicitCredit) {
    detectedType = 'expense';
  } else if (hasExplicitCredit && hasExplicitDebit) {
    if (
      lower.includes('refund') ||
      lower.includes('cashback') ||
      lower.includes('reversal') ||
      lower.includes('reversed') ||
      lower.includes('sent you') ||
      lower.includes('sent to you') ||
      lower.includes('sent to your') ||
      lower.includes('paid you') ||
      lower.includes('paid to you') ||
      lower.includes('paid to your') ||
      lower.includes('added to your') ||
      lower.includes('credited to') ||
      lower.includes('credited by') ||
      lower.includes('credited with') ||
      lower.includes('transfer from') ||
      lower.includes('trf from') ||
      lower.includes('received from')
    ) {
      detectedType = 'income';
    } else if (
      lower.includes('debited from') ||
      lower.includes('sent from a/c') ||
      lower.includes('sent from your') ||
      lower.includes('spent on your') ||
      lower.includes('withdrawn from')
    ) {
      detectedType = 'expense';
    } else if (lower.includes('debited')) {
      detectedType = 'expense';
    } else if (sanitizedForCredit.includes('credited') || sanitizedForCredit.includes('received')) {
      detectedType = 'income';
    } else {
      detectedType = 'expense';
    }
  } else if (sanitizedForCredit.includes('received') || sanitizedForCredit.includes('credited')) {
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
    /(?:to|towards|at|vpa)\s+([A-Za-z0-9&.\-_ ]{2,32}?)(?:\s+(?:UPI|Ref|via|on|from|to|Bal|dated|using|\.|\n|$))/i,
    /(?:paid to|transferred to|sent to)\s+([A-Za-z0-9&.\-_ ]{2,32}?)(?:\s+(?:on|from|to|via|Ref|Bal|using|\.|\n|$))/i,
    /([A-Za-z0-9&.\-_ ]{2,25})\s+sent you/i,
    /(?:credited by|received from|transfer from|from)\s+([A-Za-z0-9&.\-_ ]{2,32}?)(?:\s+(?:UPI|Ref|via|on|from|to|Bal|dated|using|\.|\n|$))/i,
    /(?:merchant|info|store):\s*([A-Za-z0-9&.\-_ ]{2,32})/i,
    /(?:charge at|purchase at)\s+([A-Za-z0-9&.\-_ ]{2,32}?)(?:\s+(?:on|from|to|via|Bal|\.|\n|$))/i,
  ];

  for (const pattern of smsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let candidate = match[1].trim().replace(/[.,;:]$/, '');
      candidate = candidate.replace(/\s+(?:from|to|by|on|at|via|using)$/i, '').trim();
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
      .replace(/\s+(?:from|to|by|on|at|via|using)$/i, '')
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
