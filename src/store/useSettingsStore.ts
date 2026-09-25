import { create } from 'zustand';
import { AppSettings } from '../types';
import { db } from '../database/database';
import { SEED_SETTINGS } from '../database/migrations/initialSeed';

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
    initialBalance: number,
    accountName: string,
    monthlyBudget: number
  ) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: SEED_SETTINGS,
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
    _initialBalance: number,
    _accountName: string,
    monthlyBudget: number
  ) => {
    const current = get().settings;
    const updated: AppSettings = {
      ...current,
      currency,
      currencySymbol,
      monthlyBudgetGoal: monthlyBudget,
      hasCompletedOnboarding: true,
    };
    set({ settings: updated });
    await db.saveSettings(updated);
  },
}));
