import { create } from 'zustand';
import {
  subscriptionRepository,
  SubscriptionSummary,
} from '../database/repositories/subscriptionRepository';
import { Subscription, Transaction } from '../types';

interface SubscriptionState {
  summary: SubscriptionSummary;
  isLoading: boolean;
  dismissedPromptIds: string[];
  loadSubscriptions: () => Promise<void>;
  createSubscription: (data: Omit<Subscription, 'id'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Omit<Subscription, 'id'>>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  dismissPrompt: (id: string) => void;
  resetDismissedPrompts: () => void;
  logSubscriptionExpense: (sub: Subscription) => Promise<Transaction>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  summary: { subscriptions: [], monthlyTotal: 0, yearlyTotal: 0 },
  isLoading: true,
  dismissedPromptIds: [],

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

  dismissPrompt: id => {
    set(state => ({
      dismissedPromptIds: state.dismissedPromptIds.includes(id)
        ? state.dismissedPromptIds
        : [...state.dismissedPromptIds, id],
    }));
  },

  resetDismissedPrompts: () => {
    set({ dismissedPromptIds: [] });
  },

  logSubscriptionExpense: async sub => {
    // Dynamic requires to prevent circular dependencies between zustand stores
    const { useAccountStore } = require('./useAccountStore');
    const { useTransactionStore } = require('./useTransactionStore');
    const { widgetService } = require('../services/widgetService');
    const {
      advanceNextBillingDate,
      getTodayDateString,
      getCurrentTimeString,
    } = require('../utils/date');

    const accounts = useAccountStore.getState().accounts || [];
    const effectiveAccountId = accounts.some((a: any) => a.id === sub.accountId)
      ? sub.accountId
      : accounts[0]?.id || 'acc-primary';

    const account = accounts.find((a: any) => a.id === effectiveAccountId);
    const currency = account?.currency || 'INR';

    const newTx = await useTransactionStore.getState().createTransaction({
      type: 'expense',
      amount: sub.amount,
      categoryId: sub.categoryId || 'cat-subscriptions',
      accountId: effectiveAccountId,
      merchant: sub.name,
      description: `Recurring ${sub.frequency} subscription`,
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      currency,
    });

    const nextDate = advanceNextBillingDate(sub.nextBillingDate, sub.frequency);
    await get().updateSubscription(sub.id, { nextBillingDate: nextDate });

    // Mark as dismissed for this session so it won't prompt again immediately
    get().dismissPrompt(sub.id);

    try {
      await widgetService.syncCurrentState();
    } catch (e) {
      console.warn('Widget sync error:', e);
    }

    return newTx;
  },
}));
