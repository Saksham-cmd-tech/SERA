import {
  Account,
  Category,
  Transaction,
  Budget,
  BudgetCategory,
  Goal,
  Subscription,
  AppSettings,
} from '../../types';

export const SEED_ACCOUNTS: Account[] = [
  {
    id: 'acc-primary',
    name: 'Primary Bank',
    type: 'bank',
    balance: 0,
    currency: 'INR',
    isArchived: false,
    institution: 'Bank Account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-cash',
    name: 'Cash Wallet',
    type: 'cash',
    balance: 0,
    currency: 'INR',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', icon: 'Utensils', color: '#E4CF55', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#C5C8B5', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#C5C8B5', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-transport', name: 'Transport', icon: 'Car', color: '#B8BBA8', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-bills', name: 'Bills & Utilities', icon: 'Receipt', color: '#9AA696', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Film', color: '#D4C14D', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-health', name: 'Health & Medical', icon: 'Heart', color: '#A4ACA0', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-education', name: 'Education', icon: 'GraduationCap', color: '#7D8678', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-travel', name: 'Travel', icon: 'Plane', color: '#B8BBA8', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-rent', name: 'Rent & Housing', icon: 'Home', color: '#434E40', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-subscriptions', name: 'Subscriptions', icon: 'Repeat', color: '#E4CF55', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-investment', name: 'Investment', icon: 'TrendingUp', color: '#346A3E', type: 'both', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-salary', name: 'Salary & Income', icon: 'Wallet', color: '#346A3E', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-freelance', name: 'Freelance & Side Hustle', icon: 'Briefcase', color: '#5EA36B', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat-other', name: 'Other', icon: 'MoreHorizontal', color: '#7D8678', type: 'both', isDefault: true, createdAt: new Date().toISOString() },
];

// Clean state: No mock transactions
export const SEED_TRANSACTIONS: Transaction[] = [];

export const SEED_BUDGET: Budget = {
  id: 'budget-current',
  name: 'Monthly Budget',
  amount: 0,
  period: 'monthly',
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  alertThresholds: [50, 75, 90, 100],
  rollover: false,
};

// Clean state: No mock budget categories
export const SEED_BUDGET_CATEGORIES: BudgetCategory[] = [];

// Clean state: No mock goals
export const SEED_GOALS: Goal[] = [];

// Clean state: No mock subscriptions
export const SEED_SUBSCRIPTIONS: Subscription[] = [];

export const SEED_SETTINGS: AppSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  isPrivacyMode: false,
  isDarkMode: false,
  pinLockEnabled: false,
  pinCode: undefined,
  autoLock: true,
  biometricEnabled: false,
  defaultAccountId: 'acc-primary',
  defaultCategoryId: 'cat-food',
  monthlyBudgetGoal: 0,
  hasCompletedOnboarding: false,
  userName: '',
  userAvatarUri: undefined,
  notificationsEnabled: true,
  dailyReminderEnabled: true,
  budgetAlertsEnabled: true,
};
