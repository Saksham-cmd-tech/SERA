import { create } from 'zustand';
import {
  budgetRepository,
  MonthBudgetSummary,
} from '../database/repositories/budgetRepository';

interface BudgetState {
  summary: MonthBudgetSummary | null;
  isLoading: boolean;
  loadBudgetSummary: () => Promise<void>;
  setTotalBudget: (amount: number) => Promise<void>;
  setCategoryBudget: (categoryId: string, limitAmount: number) => Promise<void>;
  deleteCategoryBudget: (categoryId: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  summary: null,
  isLoading: true,

  loadBudgetSummary: async () => {
    try {
      const summary = await budgetRepository.getBudgetSummary();
      set({ summary, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setTotalBudget: async (amount: number) => {
    await budgetRepository.setTotalBudget(amount);
    await get().loadBudgetSummary();
  },

  setCategoryBudget: async (categoryId: string, limitAmount: number) => {
    await budgetRepository.setCategoryBudget(categoryId, limitAmount);
    await get().loadBudgetSummary();
  },

  deleteCategoryBudget: async (categoryId: string) => {
    await budgetRepository.deleteCategoryBudget(categoryId);
    await get().loadBudgetSummary();
  },
}));
