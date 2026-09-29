import { create } from 'zustand';
import { PendingSmsItem, smsService } from '../services/smsService';
import { useTransactionStore } from './useTransactionStore';
import { useAccountStore } from './useAccountStore';
import { useCategoryStore } from './useCategoryStore';
import { useSettingsStore } from './useSettingsStore';
import { useBudgetStore } from './useBudgetStore';
import { useGoalStore } from './useGoalStore';
import { widgetService } from '../services/widgetService';
import { getTodayDateString, getCurrentTimeString } from '../utils/date';

interface PendingSmsState {
  items: PendingSmsItem[];
  isModalVisible: boolean;
  isLoading: boolean;
  currentIndex: number;

  loadPendingItems: (autoOpenIfPending?: boolean) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  setCurrentIndex: (index: number) => void;
  addTransactionFromSms: (
    item: PendingSmsItem,
    customAccountId?: string,
    customCategoryId?: string
  ) => Promise<boolean>;
  snoozeForLater: (itemId: string) => Promise<void>;
  dismissItem: (itemId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addIncomingItem: (item: PendingSmsItem) => void;
}

export const usePendingSmsStore = create<PendingSmsState>((set, get) => ({
  items: [],
  isModalVisible: false,
  isLoading: false,
  currentIndex: 0,

  loadPendingItems: async (autoOpenIfPending = false) => {
    try {
      set({ isLoading: true });
      const rawList = await smsService.getPendingSms();
      // Keep items that are pending or later
      const activeItems = rawList.filter(
        item => item.status === 'pending' || item.status === 'later'
      );
      const hasUnreviewed = activeItems.some(item => item.status === 'pending');

      set({
        items: activeItems,
        isLoading: false,
        currentIndex: 0,
        isModalVisible: autoOpenIfPending && hasUnreviewed ? true : get().isModalVisible,
      });
    } catch (e) {
      console.warn('Failed to load pending SMS items:', e);
      set({ isLoading: false });
    }
  },

  openModal: () => {
    const { items } = get();
    if (items.length > 0) {
      set({ isModalVisible: true, currentIndex: 0 });
    }
  },

  closeModal: () => {
    set({ isModalVisible: false });
  },

  setCurrentIndex: (index: number) => {
    set({ currentIndex: Math.max(0, Math.min(index, get().items.length - 1)) });
  },

  addTransactionFromSms: async (
    item: PendingSmsItem,
    customAccountId?: string,
    customCategoryId?: string
  ): Promise<boolean> => {
    try {
      const accounts = useAccountStore.getState().accounts;
      const categories = useCategoryStore.getState().categories;
      const settings = useSettingsStore.getState().settings;

      // 1. Determine Account
      let accountId = customAccountId;
      if (!accountId) {
        if (accounts.length > 0) {
          accountId = accounts[0].id;
        } else {
          accountId = 'acc-default';
        }
      }

      // 2. Determine Category
      let categoryId = customCategoryId || item.categoryId;
      if (!categoryId || !categories.some(c => c.id === categoryId)) {
        if (item.type === 'income') {
          const incCat = categories.find(c => c.type === 'income');
          categoryId = incCat ? incCat.id : 'cat-salary';
        } else {
          const expCat = categories.find(c => c.isDefault && c.type === 'expense');
          categoryId = expCat ? expCat.id : categories[0]?.id || 'cat-food';
        }
      }

      // 3. Create Transaction in Realm / Zustand
      await useTransactionStore.getState().createTransaction({
        type: item.type,
        amount: item.amount,
        categoryId,
        accountId,
        merchant: item.merchant || (item.type === 'income' ? 'Income' : 'Expense'),
        description: item.rawText ? `SMS: ${item.rawText.substring(0, 120)}` : undefined,
        date: getTodayDateString(),
        time: getCurrentTimeString(),
        currency: settings.currency || 'INR',
      });

      // 4. Mark SMS resolved as 'added' in persistent native store
      await smsService.markSmsResolved(item.id, 'added');

      // 5. Update local state
      const remaining = get().items.filter(i => i.id !== item.id);
      const nextIndex = Math.min(get().currentIndex, Math.max(0, remaining.length - 1));
      set({
        items: remaining,
        currentIndex: nextIndex,
        isModalVisible: remaining.length > 0,
      });

      // 6. Refresh Android Home Screen Widgets
      widgetService.syncWidgets({
        currencySymbol: settings.currencySymbol,
        accounts: useAccountStore.getState().accounts,
        transactions: useTransactionStore.getState().transactions,
        budgetSummary: useBudgetStore.getState().summary,
        goals: useGoalStore.getState().goals,
      });

      return true;
    } catch (e) {
      console.warn('Failed to add transaction from SMS:', e);
      return false;
    }
  },

  snoozeForLater: async (itemId: string) => {
    try {
      await smsService.markSmsResolved(itemId, 'later');
      const updated = get().items.map(i =>
        i.id === itemId ? { ...i, status: 'later' as const } : i
      );
      // Remove from current card stack view or advance
      const remainingUnreviewed = updated.filter(
        i => i.id !== itemId && i.status === 'pending'
      );

      if (remainingUnreviewed.length === 0) {
        set({ items: updated, isModalVisible: false, currentIndex: 0 });
      } else {
        const nextIndex = Math.min(get().currentIndex, Math.max(0, remainingUnreviewed.length - 1));
        set({ items: updated, currentIndex: nextIndex });
      }
    } catch (e) {
      console.warn('Failed to snooze SMS item:', e);
    }
  },

  dismissItem: async (itemId: string) => {
    try {
      await smsService.markSmsResolved(itemId, 'dismissed');
      const remaining = get().items.filter(i => i.id !== itemId);
      const nextIndex = Math.min(get().currentIndex, Math.max(0, remaining.length - 1));
      set({
        items: remaining,
        currentIndex: nextIndex,
        isModalVisible: remaining.length > 0,
      });
    } catch (e) {
      console.warn('Failed to dismiss SMS item:', e);
    }
  },

  clearAll: async () => {
    try {
      await smsService.clearAllPendingSms();
      set({ items: [], isModalVisible: false, currentIndex: 0 });
    } catch (e) {
      console.warn('Failed to clear pending SMS items:', e);
    }
  },

  addIncomingItem: (item: PendingSmsItem) => {
    const current = get().items;
    const exists = current.some(i => i.id === item.id || i.rawText === item.rawText);
    const updated = exists
      ? current.map(i => (i.id === item.id ? item : i))
      : [item, ...current];
    set({ items: updated, isModalVisible: true, currentIndex: 0 });
  },
}));
