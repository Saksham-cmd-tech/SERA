import { create } from 'zustand';
import { AppSettings } from '../types';
import { db } from '../database/database';
import { DEFAULT_SETTINGS } from '../database/migrations/initialSeed';
import { accountRepository } from '../database/repositories/accountRepository';
import { budgetRepository } from '../database/repositories/budgetRepository';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  togglePrivacyMode: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  setCurrency: (currency: string, currencySymbol: string) => Promise<void>;
  setPinCode: (pin?: string) => Promise<void>;
  completeOnboarding: (
    currency: string,
    currencySymbol: string,
    userName: string,
    initialBalance: number,
    accountName: string,
    monthlyBudget: number
  ) => Promise<void>;
  resetToNewUser: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  loadSettings: async () => {
    try {
      const settings = await db.getSettings();
      set({ settings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateSettings: async (partial: Partial<AppSettings>) => {
    const current = get().settings;
    const updated = { ...current, ...partial };
    set({ settings: updated });
    await db.saveSettings(updated);
  },

  togglePrivacyMode: async () => {
    const current = get().settings;
    const updated = { ...current, isPrivacyMode: !current.isPrivacyMode };
    set({ settings: updated });
    await db.saveSettings(updated);
  },

  toggleDarkMode: async () => {
    const current = get().settings;
    const updated = { ...current, isDarkMode: !current.isDarkMode };
    set({ settings: updated });
    await db.saveSettings(updated);
  },

  setCurrency: async (currency: string, currencySymbol: string) => {
    const current = get().settings;
    const updated = { ...current, currency, currencySymbol };
    set({ settings: updated });
    await db.saveSettings(updated);
  },

  setPinCode: async (pin?: string) => {
    const current = get().settings;
    const updated = {
      ...current,
      pinLockEnabled: !!pin,
      pinCode: pin,
    };
    set({ settings: updated });
    await db.saveSettings(updated);
  },

  completeOnboarding: async (
    currency: string,
    currencySymbol: string,
    userName: string,
    initialBalance: number,
    accountName: string,
    monthlyBudget: number
  ) => {
    const current = get().settings;
    const updated: AppSettings = {
      ...current,
      currency,
      currencySymbol,
      userName: userName.trim() || 'You',
      monthlyBudgetGoal: monthlyBudget,
      hasCompletedOnboarding: true,
    };
    set({ settings: updated });
    await db.saveSettings(updated);

    // Save starting account
    const accounts = await accountRepository.getAll();
    const primaryAccountName = accountName.trim() || 'Primary Bank';
    let defaultAccId = '';
    if (accounts.length > 0) {
      accounts[0].name = primaryAccountName;
      accounts[0].balance = initialBalance;
      accounts[0].currency = currency;
      defaultAccId = accounts[0].id;
      await db.saveAccounts(accounts);
    } else {
      const created = await accountRepository.create({
        name: primaryAccountName,
        type: 'bank',
        balance: initialBalance,
        currency,
        institution: 'Primary Bank',
      });
      defaultAccId = created.id;
    }

    updated.defaultAccountId = defaultAccId;
    await db.saveSettings(updated);

    // Set starting monthly budget
    if (monthlyBudget > 0) {
      await budgetRepository.setTotalBudget(monthlyBudget);
    }
  },

  resetToNewUser: async () => {
    await db.resetDatabase();
    set({ settings: DEFAULT_SETTINGS });

    // Reset all in-memory store states
    try {
      const { useAccountStore } = require('./useAccountStore');
      const { useTransactionStore } = require('./useTransactionStore');
      const { useBudgetStore } = require('./useBudgetStore');
      const { useGoalStore } = require('./useGoalStore');
      const { useSubscriptionStore } = require('./useSubscriptionStore');
      const { widgetService } = require('../services/widgetService');

      useAccountStore.setState({ accounts: [], selectedAccountId: 'all', isLoading: false });
      useTransactionStore.setState({
        transactions: [],
        filteredTransactions: [],
        recentTransactions: [],
        financialSummary: null,
        insights: [],
        isLoading: false,
      });
      useBudgetStore.setState({ summary: null, categories: [], isLoading: false });
      useGoalStore.setState({ goals: [], isLoading: false });
      useSubscriptionStore.setState({
        summary: {
          subscriptions: [],
          monthlyTotal: 0,
          yearlyTotal: 0,
          nextDueSubscription: null,
        },
        isLoading: false,
      });

      widgetService.syncWidgets({
        currencySymbol: DEFAULT_SETTINGS.currencySymbol,
        accounts: [],
        transactions: [],
        budgetSummary: null,
        goals: [],
        subscriptions: [],
        subMonthlyTotal: 0,
      });
    } catch (e) {
      console.warn('Error resetting in-memory store state:', e);
    }
  },
}));
