import { create } from 'zustand';
import {
  subscriptionRepository,
  SubscriptionSummary,
} from '../database/repositories/subscriptionRepository';
import { Subscription } from '../types';

interface SubscriptionState {
  summary: SubscriptionSummary;
  isLoading: boolean;
  loadSubscriptions: () => Promise<void>;
  createSubscription: (data: Omit<Subscription, 'id'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Omit<Subscription, 'id'>>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  summary: { subscriptions: [], monthlyTotal: 0, yearlyTotal: 0 },
  isLoading: true,

  loadSubscriptions: async () => {
    try {
      const summary = await subscriptionRepository.getSummary();
      set({ summary, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createSubscription: async data => {
    await subscriptionRepository.create(data);
    await get().loadSubscriptions();
  },

  updateSubscription: async (id, updates) => {
    await subscriptionRepository.update(id, updates);
    await get().loadSubscriptions();
  },

  deleteSubscription: async id => {
    await subscriptionRepository.delete(id);
    await get().loadSubscriptions();
  },
}));
