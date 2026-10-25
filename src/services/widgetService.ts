import { NativeModules, Platform } from 'react-native';
import { Account, Transaction, Goal, Subscription } from '../types';
import { MonthBudgetSummary } from '../database/repositories/budgetRepository';

const { WidgetModule } = NativeModules;

export interface WidgetSyncData {
  currencySymbol: string;
  todaySpent: string;
  todaySpentVal: string;
  netWorth: string;
  budgetRemaining: string;
  budgetTotal: string;
  budgetProgress: number;
  dailySafeSpend: string;
  dailySafeVal: string;
  monthSpent: string;
  acc1Name: string;
  acc1Bal: string;
  acc2Name: string;
  acc2Bal: string;
  goalTitle: string;
  goalAmounts: string;
  goalPercent: number;
  goalRemaining: string;
  tx1Name: string;
  tx1Amt: string;
  tx2Name: string;
  tx2Amt: string;
  subMonthlyTotal: string;
  subCount: string;
  subNextName: string;
  subNextDate: string;
  subNextAmt: string;
}

class WidgetService {
  /**
   * Pushes latest financial data to Android Home Screen widgets
   */
  async syncWidgets({
    currencySymbol = '₹',
    accounts = [],
    transactions = [],
    budgetSummary,
    goals = [],
    subscriptions = [],
    subMonthlyTotal = 0,
  }: {
    currencySymbol?: string;
    accounts?: Account[];
    transactions?: Transaction[];
    budgetSummary?: MonthBudgetSummary | null;
    goals?: Goal[];
    subscriptions?: Subscription[];
    subMonthlyTotal?: number;
  }): Promise<boolean> {
    if (Platform.OS !== 'android' || !WidgetModule) {
      return false;
    }

    try {
      // 1. Calculate Net Worth
      const totalNetWorth = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

      // 2. Today's expenses
      const today = new Date().toISOString().split('T')[0];
      const todayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(today))
        .reduce((sum, t) => sum + t.amount, 0);

      // 3. Budget & Burn Rate
      const monthlyBudget = budgetSummary?.totalBudget || 0;
      const spent = budgetSummary?.totalSpent || 0;
      const remaining = Math.max(0, monthlyBudget - spent);
      const progress = monthlyBudget > 0 ? Math.min(100, Math.round((spent / monthlyBudget) * 100)) : 0;

      // Days remaining in month
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysLeft = Math.max(1, lastDay - now.getDate() + 1);
      const dailySafe = Math.round(remaining / daysLeft);

      // 4. Accounts snapshot
      const acc1 = accounts[0];
      const acc2 = accounts[1];

      // 5. Active Goal
      const activeGoal = goals.find(g => (g.currentAmount || 0) < g.targetAmount) || goals[0];
      const goalPercent = activeGoal && activeGoal.targetAmount > 0
        ? Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100))
        : 0;
      const goalRemainingVal = activeGoal
        ? Math.max(0, (activeGoal.targetAmount || 0) - (activeGoal.currentAmount || 0))
        : 0;

      // 6. Recent 2 Transactions
      const tx1 = transactions[0];
      const tx2 = transactions[1];

      // 7. Subscriptions
      const sortedSubs = (subscriptions || []).slice().sort((a, b) =>
        (a.nextBillingDate || '').localeCompare(b.nextBillingDate || '')
      );
      const nextSub = sortedSubs[0];
      let subNextDateStr = 'No bills due';
      if (nextSub?.nextBillingDate) {
        try {
          const parts = nextSub.nextBillingDate.split('-');
          if (parts.length === 3) {
            const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            subNextDateStr = `Due ${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
          } else {
            subNextDateStr = `Due ${nextSub.nextBillingDate}`;
          }
        } catch {
          subNextDateStr = `Due ${nextSub.nextBillingDate}`;
        }
      }

      const totalMonthlySub = subMonthlyTotal || (subscriptions || []).reduce((sum, s) => {
        return sum + (s.frequency === 'yearly' ? Math.round(s.amount / 12) : s.amount);
      }, 0);

      const payload: WidgetSyncData = {
        currencySymbol,
        todaySpent: `${currencySymbol}${todayExpenses.toLocaleString()} Today`,
        todaySpentVal: `${currencySymbol}${todayExpenses.toLocaleString()}`,
        netWorth: `${currencySymbol}${totalNetWorth.toLocaleString()}`,
        budgetRemaining: `${currencySymbol}${remaining.toLocaleString()}`,
        budgetTotal: monthlyBudget > 0 ? `LEFT OF ${currencySymbol}${monthlyBudget.toLocaleString()}` : 'NO BUDGET SET',
        budgetProgress: progress,
        dailySafeSpend: monthlyBudget > 0 ? `Safe spend: ${currencySymbol}${dailySafe.toLocaleString()} / day` : 'No budget set',
        dailySafeVal: `${currencySymbol}${dailySafe.toLocaleString()}`,
        monthSpent: `Spent: ${currencySymbol}${spent.toLocaleString()}`,

        acc1Name: acc1 ? acc1.name : (accounts.length > 0 ? 'Account' : 'No Accounts'),
        acc1Bal: acc1 ? `${currencySymbol}${acc1.balance.toLocaleString()}` : `${currencySymbol}0`,
        acc2Name: acc2 ? acc2.name : '',
        acc2Bal: acc2 ? `${currencySymbol}${acc2.balance.toLocaleString()}` : '',

        goalTitle: activeGoal ? activeGoal.name : 'No Active Goals',
        goalAmounts: activeGoal
          ? `${currencySymbol}${activeGoal.currentAmount.toLocaleString()} of ${currencySymbol}${activeGoal.targetAmount.toLocaleString()}`
          : `${currencySymbol}0 of ${currencySymbol}0`,
        goalPercent,
        goalRemaining: activeGoal ? `${currencySymbol}${goalRemainingVal.toLocaleString()} left to save` : 'Tap to create goal',

        tx1Name: tx1 ? (tx1.merchant || tx1.description || 'Transaction') : 'No recent transactions',
        tx1Amt: tx1 ? `${tx1.type === 'income' ? '+' : '-'}${currencySymbol}${tx1.amount.toLocaleString()}` : '',
        tx2Name: tx2 ? (tx2.merchant || tx2.description || 'Transaction') : '',
        tx2Amt: tx2 ? `${tx2.type === 'income' ? '+' : '-'}${currencySymbol}${tx2.amount.toLocaleString()}` : '',

        subMonthlyTotal: `${currencySymbol}${totalMonthlySub.toLocaleString()}`,
        subCount: `${subscriptions.length} Active`,
        subNextName: nextSub ? nextSub.name : 'No active bills',
        subNextDate: subNextDateStr,
        subNextAmt: nextSub ? `${currencySymbol}${nextSub.amount.toLocaleString()}` : '',
      };

      await WidgetModule.updateAllWidgets(payload);
      return true;
    } catch (e) {
      console.warn('Failed to sync Android widgets:', e);
      return false;
    }
  }

  /**
   * Automatically pulls the latest state from stores and pushes to widgets
   */
  async syncCurrentState(): Promise<boolean> {
    try {
      const { useAccountStore } = require('../store/useAccountStore');
      const { useTransactionStore } = require('../store/useTransactionStore');
      const { useBudgetStore } = require('../store/useBudgetStore');
      const { useGoalStore } = require('../store/useGoalStore');
      const { useSettingsStore } = require('../store/useSettingsStore');
      const { useSubscriptionStore } = require('../store/useSubscriptionStore');

      const accounts = useAccountStore.getState().accounts || [];
      const transactions = useTransactionStore.getState().transactions || [];
      const budgetSummary = useBudgetStore.getState().summary;
      const goals = useGoalStore.getState().goals || [];
      const currencySymbol = useSettingsStore.getState().settings?.currencySymbol || '₹';
      const subSummary = useSubscriptionStore.getState().summary;

      return await this.syncWidgets({
        currencySymbol,
        accounts,
        transactions,
        budgetSummary,
        goals,
        subscriptions: subSummary?.subscriptions || [],
        subMonthlyTotal: subSummary?.monthlyTotal || 0,
      });
    } catch (e) {
      console.warn('Error in syncCurrentState:', e);
      return false;
    }
  }
}

export const widgetService = new WidgetService();
export default widgetService;
