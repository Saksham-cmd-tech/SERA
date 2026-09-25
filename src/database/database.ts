import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Account,
  Category,
  Transaction,
  Budget,
  BudgetCategory,
  Goal,
  GoalContribution,
  Subscription,
  RecurringTransaction,
  AppSettings,
} from '../types';
import {
  SEED_ACCOUNTS,
  SEED_CATEGORIES,
  SEED_TRANSACTIONS,
  SEED_BUDGET,
  SEED_BUDGET_CATEGORIES,
  SEED_GOALS,
  SEED_SUBSCRIPTIONS,
  SEED_SETTINGS,
} from './migrations/initialSeed';

const STORAGE_KEYS = {
  ACCOUNTS: '@money_tracker_accounts_v1',
  CATEGORIES: '@money_tracker_categories_v1',
  TRANSACTIONS: '@money_tracker_transactions_v1',
  BUDGET: '@money_tracker_budget_v1',
  BUDGET_CATEGORIES: '@money_tracker_budget_categories_v1',
  GOALS: '@money_tracker_goals_v1',
  GOAL_CONTRIBUTIONS: '@money_tracker_goal_contributions_v1',
  SUBSCRIPTIONS: '@money_tracker_subscriptions_v1',
  RECURRING_TRANSACTIONS: '@money_tracker_recurring_transactions_v1',
  SETTINGS: '@money_tracker_settings_v1',
  INITIALIZED: '@money_tracker_initialized_v2',
};

type Listener = () => void;

class Database {
  private listeners: Set<Listener> = new Set();
  private isInitialized: boolean = false;

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public async initDatabase(forceReset: boolean = false): Promise<void> {
    if (this.isInitialized && !forceReset) {
      return;
    }

    try {
      const isAlreadyInit = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isAlreadyInit || forceReset) {
        await this.seedInitialData();
        await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
      this.isInitialized = true;
      this.notify();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  public async seedInitialData(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(SEED_ACCOUNTS));
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(SEED_BUDGET));
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGET_CATEGORIES, JSON.stringify(SEED_BUDGET_CATEGORIES));
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(SEED_GOALS));
    await AsyncStorage.setItem(STORAGE_KEYS.GOAL_CONTRIBUTIONS, JSON.stringify([]));
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(SEED_SUBSCRIPTIONS));
    await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_TRANSACTIONS, JSON.stringify([]));
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SEED_SETTINGS));
    this.notify();
  }

  // --- ACCOUNTS ---
  public async getAccounts(): Promise<Account[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  }

  public async saveAccounts(accounts: Account[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    this.notify();
  }

  // --- CATEGORIES ---
  public async getCategories(): Promise<Category[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  public async saveCategories(categories: Category[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify();
  }

  // --- TRANSACTIONS ---
  public async getTransactions(): Promise<Transaction[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  public async saveTransactions(transactions: Transaction[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    this.notify();
  }

  // --- BUDGETS ---
  public async getBudget(): Promise<Budget | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGET);
    return data ? JSON.parse(data) : null;
  }

  public async saveBudget(budget: Budget): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
    this.notify();
  }

  public async getBudgetCategories(): Promise<BudgetCategory[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGET_CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  public async saveBudgetCategories(categories: BudgetCategory[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGET_CATEGORIES, JSON.stringify(categories));
    this.notify();
  }

  // --- GOALS ---
  public async getGoals(): Promise<Goal[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  }

  public async saveGoals(goals: Goal[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    this.notify();
  }

  public async getGoalContributions(goalId?: string): Promise<GoalContribution[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GOAL_CONTRIBUTIONS);
    const contributions: GoalContribution[] = data ? JSON.parse(data) : [];
    if (goalId) {
      return contributions.filter(c => c.goalId === goalId);
    }
    return contributions;
  }

  public async saveGoalContributions(contributions: GoalContribution[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.GOAL_CONTRIBUTIONS, JSON.stringify(contributions));
    this.notify();
  }

  // --- SUBSCRIPTIONS ---
  public async getSubscriptions(): Promise<Subscription[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return data ? JSON.parse(data) : [];
  }

  public async saveSubscriptions(subs: Subscription[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    this.notify();
  }

  // --- RECURRING TRANSACTIONS ---
  public async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECURRING_TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  public async saveRecurringTransactions(recurring: RecurringTransaction[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_TRANSACTIONS, JSON.stringify(recurring));
    this.notify();
  }

  // --- SETTINGS ---
  public async getSettings(): Promise<AppSettings> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : SEED_SETTINGS;
  }

  public async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();
  }

  // --- EXPORT & BACKUP ---
  public async exportAllData(): Promise<string> {
    const accounts = await this.getAccounts();
    const categories = await this.getCategories();
    const transactions = await this.getTransactions();
    const budget = await this.getBudget();
    const budgetCategories = await this.getBudgetCategories();
    const goals = await this.getGoals();
    const subscriptions = await this.getSubscriptions();
    const settings = await this.getSettings();

    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        accounts,
        categories,
        transactions,
        budget,
        budgetCategories,
        goals,
        subscriptions,
        settings,
      },
    };

    return JSON.stringify(backup, null, 2);
  }

  public async importBackupData(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) {
        return false;
      }
      const { data } = parsed;
      if (data.accounts) await this.saveAccounts(data.accounts);
      if (data.categories) await this.saveCategories(data.categories);
      if (data.transactions) await this.saveTransactions(data.transactions);
      if (data.budget) await this.saveBudget(data.budget);
      if (data.budgetCategories) await this.saveBudgetCategories(data.budgetCategories);
      if (data.goals) await this.saveGoals(data.goals);
      if (data.subscriptions) await this.saveSubscriptions(data.subscriptions);
      if (data.settings) await this.saveSettings(data.settings);
      this.notify();
      return true;
    } catch {
      return false;
    }
  }

  public async clearAllData(): Promise<void> {
    await AsyncStorage.clear();
    this.isInitialized = false;
    await this.initDatabase(true);
  }
}

export const db = new Database();
