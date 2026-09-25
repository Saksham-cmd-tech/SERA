import { create } from 'zustand';
import { Account, AccountType } from '../types';
import { accountRepository } from '../database/repositories/accountRepository';
import { transactionRepository } from '../database/repositories/transactionRepository';
import { getCurrentTimeString, getTodayDateString } from '../utils/date';

interface AccountState {
  accounts: Account[];
  selectedAccountId: string | 'all';
  netWorth: { assets: number; liabilities: number; netWorth: number };
  isLoading: boolean;
  loadAccounts: () => Promise<void>;
  setSelectedAccountId: (id: string | 'all') => void;
  createAccount: (data: {
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    institution?: string;
  }) => Promise<Account>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  transferFunds: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    notes?: string
  ) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  selectedAccountId: 'all',
  netWorth: { assets: 0, liabilities: 0, netWorth: 0 },
  isLoading: true,

  loadAccounts: async () => {
    try {
      const accounts = await accountRepository.getAll();
      const netWorth = await accountRepository.getNetWorth();
      set({ accounts, netWorth, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedAccountId: (id: string | 'all') => {
    set({ selectedAccountId: id });
  },

  createAccount: async data => {
    const created = await accountRepository.create(data);
    await get().loadAccounts();
    return created;
  },

  updateAccount: async (id, updates) => {
    await accountRepository.update(id, updates);
    await get().loadAccounts();
  },

  deleteAccount: async id => {
    await accountRepository.delete(id);
    await get().loadAccounts();
  },

  transferFunds: async (fromAccountId, toAccountId, amount, notes) => {
    const fromAccount = get().accounts.find(a => a.id === fromAccountId);
    const toAccount = get().accounts.find(a => a.id === toAccountId);

    const merchant = `Transfer to ${toAccount ? toAccount.name : 'Account'}`;
    const desc = notes || `Internal transfer from ${fromAccount?.name} to ${toAccount?.name}`;

    await transactionRepository.create({
      type: 'transfer',
      amount,
      categoryId: 'cat-other',
      accountId: fromAccountId,
      toAccountId,
      merchant,
      description: desc,
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      currency: fromAccount?.currency || 'INR',
    });

    await get().loadAccounts();
  },
}));
