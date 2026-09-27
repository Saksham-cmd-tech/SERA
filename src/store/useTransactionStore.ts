import { create } from 'zustand';
import {
  Transaction,
  TransactionFilterOptions,
  FinancialSummary,
  SpendingInsight,
} from '../types';
import { transactionRepository } from '../database/repositories/transactionRepository';
import { formatCurrency } from '../utils/currency';
import { useBudgetStore } from './useBudgetStore';
import { useAccountStore } from './useAccountStore';
import { useSettingsStore } from './useSettingsStore';
import { useCategoryStore } from './useCategoryStore';

interface TransactionState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  recentTransactions: Transaction[];
  financialSummary: FinancialSummary | null;
  filters: TransactionFilterOptions;
  insights: SpendingInsight[];
  isLoading: boolean;
  loadTransactions: () => Promise<void>;
  setFilters: (filters: Partial<TransactionFilterOptions>) => void;
  resetFilters: () => void;
  createTransaction: (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  duplicateTransaction: (id: string) => Promise<Transaction | null>;
}

const DEFAULT_FILTERS: TransactionFilterOptions = {
  dateRangePreset: 'all',
  type: 'all',
  categoryIds: [],
  accountIds: [],
  searchQuery: '',
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  filteredTransactions: [],
  recentTransactions: [],
  financialSummary: null,
  filters: DEFAULT_FILTERS,
  insights: [],
  isLoading: true,

  loadTransactions: async () => {
    try {
      const transactions = await transactionRepository.getAll();
      const recentTransactions = await transactionRepository.getRecent(5);
      const financialSummary = await transactionRepository.getFinancialSummary();

      // Apply current filters
      const filteredTransactions = await transactionRepository.getFiltered(get().filters);

      // Generate accurate calculated financial insights
      const insights = generateInsights(transactions, financialSummary);

      set({
        transactions,
        filteredTransactions,
        recentTransactions,
        financialSummary,
        insights,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setFilters: async partial => {
    const updatedFilters = { ...get().filters, ...partial };
    set({ filters: updatedFilters });
    const filtered = await transactionRepository.getFiltered(updatedFilters);
    set({ filteredTransactions: filtered });
  },

  resetFilters: async () => {
    set({ filters: DEFAULT_FILTERS });
    const filtered = await transactionRepository.getFiltered(DEFAULT_FILTERS);
    set({ filteredTransactions: filtered });
  },

  createTransaction: async data => {
    const newTx = await transactionRepository.create(data);
    await get().loadTransactions();
    await useBudgetStore.getState().loadBudgetSummary();
    await useAccountStore.getState().loadAccounts();
    return newTx;
  },

  updateTransaction: async (id, updates) => {
    const updated = await transactionRepository.update(id, updates);
    await get().loadTransactions();
    await useBudgetStore.getState().loadBudgetSummary();
    await useAccountStore.getState().loadAccounts();
    return updated;
  },

  deleteTransaction: async id => {
    const ok = await transactionRepository.delete(id);
    await get().loadTransactions();
    await useBudgetStore.getState().loadBudgetSummary();
    await useAccountStore.getState().loadAccounts();
    return ok;
  },

  duplicateTransaction: async id => {
    const copy = await transactionRepository.duplicate(id);
    await get().loadTransactions();
    await useBudgetStore.getState().loadBudgetSummary();
    await useAccountStore.getState().loadAccounts();
    return copy;
  },
}));

function generateInsights(
  transactions: Transaction[],
  summary: FinancialSummary | null
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = transactions.filter(
    t => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)
  );

  // Group by category to find largest expense category
  const categoryTotals: Record<string, number> = {};
  for (const tx of thisMonthExpenses) {
    categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + tx.amount;
  }

  let largestCatId = '';
  let largestAmount = 0;
  for (const [catId, amount] of Object.entries(categoryTotals)) {
    if (amount > largestAmount) {
      largestAmount = amount;
      largestCatId = catId;
    }
  }

  const currency = useSettingsStore.getState().settings.currencySymbol || '₹';
  const categories = useCategoryStore.getState().categories;

  if (largestCatId) {
    const matchedCategory = categories.find(c => c.id === largestCatId);
    const catName = (matchedCategory ? matchedCategory.name : largestCatId.replace('cat-', '')).toUpperCase();
    insights.push({
      id: 'ins-largest',
      type: 'info',
      title: 'PRIMARY OUTFLOW',
      description: `Your highest expense this month is ${catName}.`,
      metric: formatCurrency(largestAmount, currency),
    });
  }

  // Savings rate insight
  if (summary && summary.savingsRate > 0) {
    insights.push({
      id: 'ins-savings',
      type: 'positive',
      title: 'SAVINGS DISCIPLINE',
      description: `You are saving ${summary.savingsRate}% of your total earnings this month.`,
      metric: `${summary.savingsRate}%`,
    });
  }

  // Budget status insight
  if (summary && summary.isOverrun) {
    insights.push({
      id: 'ins-overrun',
      type: 'warning',
      title: 'BUDGET LIMIT EXCEEDED',
      description: `Spending in ${summary.overrunCategory || 'Budget'} exceeded the allocation by ${formatCurrency(summary.overrunAmount || 0, currency)}.`,
      metric: formatCurrency(summary.overrunAmount || 0, currency),
    });
  } else if (summary && summary.budgetRemaining > 0) {
    insights.push({
      id: 'ins-under',
      type: 'positive',
      title: 'WITHIN ALLOCATION',
      description: `You have ${formatCurrency(summary.budgetRemaining, currency)} remaining in your monthly budget.`,
      metric: formatCurrency(summary.budgetRemaining, currency),
    });
  }

  return insights;
}
