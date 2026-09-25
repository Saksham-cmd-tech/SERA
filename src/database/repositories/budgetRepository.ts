import { db } from '../database';
import { Budget, BudgetCategory } from '../../types';
import { roundMoney } from '../../utils/currency';

export interface CategoryBudgetAnalysis {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  isOverrun: boolean;
  overrunAmount: number;
}

export interface MonthBudgetSummary {
  monthName: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  percentageUsed: number;
  isOverrun: boolean;
  overrunAmount: number;
  overrunCategoryName?: string;
  categoryAnalysis: CategoryBudgetAnalysis[];
}

class BudgetRepository {
  public async getBudget(): Promise<Budget | null> {
    return db.getBudget();
  }

  public async setTotalBudget(amount: number): Promise<Budget> {
    const existing = await db.getBudget();
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

    const updated: Budget = {
      id: existing ? existing.id : `bgt-${now.getFullYear()}-${now.getMonth() + 1}`,
      name: `${now.toLocaleString('default', { month: 'long' })} Budget`,
      amount: roundMoney(amount),
      period: 'monthly',
      startDate: start,
      endDate: end,
      alertThresholds: [50, 75, 90, 100],
      rollover: existing ? existing.rollover : true,
    };
    await db.saveBudget(updated);
    return updated;
  }

  public async getBudgetCategories(): Promise<BudgetCategory[]> {
    return db.getBudgetCategories();
  }

  public async setCategoryBudget(categoryId: string, limitAmount: number): Promise<BudgetCategory> {
    const list = await db.getBudgetCategories();
    const budget = await db.getBudget();
    const budgetId = budget ? budget.id : 'bgt-default';

    const index = list.findIndex(bc => bc.categoryId === categoryId);
    let record: BudgetCategory;

    if (index !== -1) {
      record = {
        ...list[index],
        limitAmount: roundMoney(limitAmount),
      };
      list[index] = record;
    } else {
      record = {
        id: `bc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        budgetId,
        categoryId,
        limitAmount: roundMoney(limitAmount),
        spentAmount: 0,
      };
      list.push(record);
    }

    await db.saveBudgetCategories(list);
    return record;
  }

  public async deleteCategoryBudget(categoryId: string): Promise<boolean> {
    const list = await db.getBudgetCategories();
    const filtered = list.filter(bc => bc.categoryId !== categoryId);
    await db.saveBudgetCategories(filtered);
    return true;
  }

  public async getBudgetSummary(): Promise<MonthBudgetSummary> {
    const budget = await db.getBudget();
    const budgetCategories = await db.getBudgetCategories();
    const categories = await db.getCategories();
    const transactions = await db.getTransactions();

    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthExpenses = transactions.filter(
      t => t.type === 'expense' && t.date.startsWith(currentYearMonth)
    );

    const totalBudget = budget ? budget.amount : 45000;
    const totalSpent = roundMoney(
      thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
    );
    const totalRemaining = roundMoney(totalBudget - totalSpent);
    const percentageUsed = totalBudget > 0 ? roundMoney((totalSpent / totalBudget) * 100) : 0;
    const isTotalOverrun = totalSpent > totalBudget;

    let maxOverrunAmount = 0;
    let worstOverrunCategory: string | undefined;

    // Build analysis for each category budget
    const categoryAnalysis: CategoryBudgetAnalysis[] = [];

    // First include all configured budget categories
    for (const bc of budgetCategories) {
      const cat = categories.find(c => c.id === bc.categoryId);
      const spent = roundMoney(
        thisMonthExpenses
          .filter(t => t.categoryId === bc.categoryId)
          .reduce((sum, t) => sum + t.amount, 0)
      );

      const remaining = roundMoney(bc.limitAmount - spent);
      const isOver = spent > bc.limitAmount;
      const overrunAmt = isOver ? roundMoney(spent - bc.limitAmount) : 0;
      const pct = bc.limitAmount > 0 ? roundMoney((spent / bc.limitAmount) * 100) : 0;

      if (isOver && overrunAmt > maxOverrunAmount) {
        maxOverrunAmount = overrunAmt;
        worstOverrunCategory = cat ? cat.name.toUpperCase() : 'BUDGET';
      }

      categoryAnalysis.push({
        categoryId: bc.categoryId,
        categoryName: cat ? cat.name : 'Unknown',
        categoryIcon: cat ? cat.icon : 'Tag',
        categoryColor: cat ? cat.color : '#CACDBB',
        limitAmount: bc.limitAmount,
        spentAmount: spent,
        remainingAmount: remaining,
        percentage: pct,
        isOverrun: isOver,
        overrunAmount: overrunAmt,
      });
    }

    return {
      monthName: now.toLocaleString('default', { month: 'long' }),
      totalBudget,
      totalSpent,
      totalRemaining,
      percentageUsed,
      isOverrun: isTotalOverrun || maxOverrunAmount > 0,
      overrunAmount: isTotalOverrun ? Math.abs(totalRemaining) : maxOverrunAmount,
      overrunCategoryName: worstOverrunCategory,
      categoryAnalysis,
    };
  }
}

export const budgetRepository = new BudgetRepository();
