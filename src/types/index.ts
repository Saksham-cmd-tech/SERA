export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType =
  | 'bank'
  | 'cash'
  | 'credit'
  | 'debit'
  | 'wallet'
  | 'investment'
  | 'savings'
  | 'other';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // Stored in major currency unit with decimal precision
  currency: string;
  isArchived: boolean;
  institution?: string;
  accountNumberMask?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string;
  type: 'expense' | 'income' | 'both';
  isDefault: boolean;
  budgetLimit?: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // Only present for transfers
  merchant: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  currency: string;
  receiptUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'custom';
  startDate: string;
  endDate: string;
  alertThresholds: number[]; // e.g. [50, 75, 90, 100]
  rollover: boolean;
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  categoryId: string;
  limitAmount: number;
  spentAmount: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  accountId?: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  nextBillingDate: string; // YYYY-MM-DD
  categoryId: string;
  accountId: string;
  reminderEnabled: boolean;
}

export interface RecurringTransaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  categoryId: string;
  accountId: string;
  merchant: string;
  recurrence: RecurrenceFrequency;
  startDate: string;
  nextExecutionDate: string;
  active: boolean;
}

export interface FinancialSummary {
  totalBalance: number;
  availableBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  savingsRate: number; // percentage 0-100
  budgetTotal: number;
  budgetSpent: number;
  budgetRemaining: number;
  isOverrun: boolean;
  overrunCategory?: string;
  overrunAmount?: number;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  isPrivacyMode: boolean;
  isDarkMode: boolean;
  pinLockEnabled: boolean;
  pinCode?: string;
  autoLock: boolean;
  biometricEnabled: boolean;
  defaultAccountId: string;
  defaultCategoryId: string;
  monthlyBudgetGoal: number;
  hasCompletedOnboarding: boolean;
  userName: string;
  userAvatarUri?: string;
  notificationsEnabled?: boolean;
  dailyReminderEnabled?: boolean;
  budgetAlertsEnabled?: boolean;
}

export interface TransactionFilterOptions {
  dateRangePreset?: 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'custom';
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  accountIds?: string[];
  type?: TransactionType | 'all';
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface SpendingInsight {
  id: string;
  type: 'info' | 'warning' | 'positive';
  title: string;
  description: string;
  metric?: string;
}
