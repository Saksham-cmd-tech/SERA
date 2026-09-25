import { create } from 'zustand';
import { GoalStatus, goalRepository } from '../database/repositories/goalRepository';

interface GoalState {
  goals: GoalStatus[];
  isLoading: boolean;
  loadGoals: () => Promise<void>;
  createGoal: (data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    monthlyContribution: number;
    accountId?: string;
    icon: string;
    color: string;
  }) => Promise<void>;
  updateGoal: (id: string, updates: Partial<GoalStatus>) => Promise<void>;
  addContribution: (goalId: string, amount: number, notes?: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: true,

  loadGoals: async () => {
    try {
      const goals = await goalRepository.getGoalsWithStatus();
      set({ goals, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createGoal: async data => {
    await goalRepository.create(data);
    await get().loadGoals();
  },

  updateGoal: async (id, updates) => {
    await goalRepository.update(id, updates);
    await get().loadGoals();
  },

  addContribution: async (goalId, amount, notes) => {
    await goalRepository.addContribution(goalId, amount, notes);
    await get().loadGoals();
  },

  deleteGoal: async id => {
    await goalRepository.delete(id);
    await get().loadGoals();
  },
}));
