import { db } from '../database';
import {
  Transaction,
  TransactionFilterOptions,
  FinancialSummary,
} from '../../types';
import { accountRepository } from './accountRepository';
import { roundMoney } from '../../utils/currency';

class TransactionRepository {
  public async getAll(): Promise<Transaction[]> {
    const list = await db.getTransactions();
    // Sort descending by date, then time
    return list.sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return (b.time || '').localeCompare(a.time || '');
    });
  }

  public async getFiltered(options: TransactionFilterOptions): Promise<Transaction[]> {
    let list = await this.getAll();

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const query = options.searchQuery.toLowerCase().trim();
      list = list.filter(
        t =>
          t.merchant.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query)) ||
          t.amount.toString().includes(query)
      );
    }

    if (options.type && options.type !== 'all') {
      list = list.filter(t => t.type === options.type);
    }

    if (options.categoryIds && options.categoryIds.length > 0) {
      list = list.filter(t => options.categoryIds!.includes(t.categoryId));
    }

    if (options.accountIds && options.accountIds.length > 0) {
      list = list.filter(
        t =>
          options.accountIds!.includes(t.accountId) ||
          (t.toAccountId && options.accountIds!.includes(t.toAccountId))
      );
    }

    if (options.startDate) {
      list = list.filter(t => t.date >= options.startDate!);
    }

    if (options.endDate) {
      list = list.filter(t => t.date <= options.endDate!);
    }

    if (options.minAmount !== undefined) {
      list = list.filter(t => t.amount >= options.minAmount!);
    }

    if (options.maxAmount !== undefined) {
      list = list.filter(t => t.amount <= options.maxAmount!);
    }

    return list;
  }

  public async getById(id: string): Promise<Transaction | undefined> {
    const list = await db.getTransactions();
    return list.find(t => t.id === id);
  }

  public async getRecent(limit: number = 5): Promise<Transaction[]> {
    const list = await this.getAll();
    return list.slice(0, limit);
  }

  public async create(
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    const list = await db.getTransactions();
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.push(newTx);
    await db.saveTransactions(list);

    // Apply account balance impact
    if (newTx.type === 'expense') {
      await accountRepository.adjustBalance(newTx.accountId, -newTx.amount);
    } else if (newTx.type === 'income') {
      await accountRepository.adjustBalance(newTx.accountId, newTx.amount);
    } else if (newTx.type === 'transfer' && newTx.toAccountId) {
      await accountRepository.adjustBalance(newTx.accountId, -newTx.amount);
      await accountRepository.adjustBalance(newTx.toAccountId, newTx.amount);
    }

    return newTx;
  }

  public async update(
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Transaction | null> {
    const list = await db.getTransactions();
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return null;

    const oldTx = list[index];

    // Revert old transaction effect on account balance
    if (oldTx.type === 'expense') {
      await accountRepository.adjustBalance(oldTx.accountId, oldTx.amount);
    } else if (oldTx.type === 'income') {
      await accountRepository.adjustBalance(oldTx.accountId, -oldTx.amount);
    } else if (oldTx.type === 'transfer' && oldTx.toAccountId) {
      await accountRepository.adjustBalance(oldTx.accountId, oldTx.amount);
      await accountRepository.adjustBalance(oldTx.toAccountId, -oldTx.amount);
    }

    const updatedTx: Transaction = {
      ...oldTx,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Apply new transaction effect on account balance
    if (updatedTx.type === 'expense') {
      await accountRepository.adjustBalance(updatedTx.accountId, -updatedTx.amount);
    } else if (updatedTx.type === 'income') {
      await accountRepository.adjustBalance(updatedTx.accountId, updatedTx.amount);
    } else if (updatedTx.type === 'transfer' && updatedTx.toAccountId) {
      await accountRepository.adjustBalance(updatedTx.accountId, -updatedTx.amount);
      await accountRepository.adjustBalance(updatedTx.toAccountId, updatedTx.amount);
    }

    list[index] = updatedTx;
    await db.saveTransactions(list);
    return updatedTx;
  }

  public async delete(id: string): Promise<boolean> {
    const list = await db.getTransactions();
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return false;

    const tx = list[index];

    // Revert balance changes
    if (tx.type === 'expense') {
      await accountRepository.adjustBalance(tx.accountId, tx.amount);
    } else if (tx.type === 'income') {
      await accountRepository.adjustBalance(tx.accountId, -tx.amount);
    } else if (tx.type === 'transfer' && tx.toAccountId) {
      await accountRepository.adjustBalance(tx.accountId, tx.amount);
      await accountRepository.adjustBalance(tx.toAccountId, -tx.amount);
    }

    list.splice(index, 1);
    await db.saveTransactions(list);
    return true;
  }

  public async duplicate(id: string): Promise<Transaction | null> {
    const tx = await this.getById(id);
    if (!tx) return null;
    return this.create({
      type: tx.type,
      amount: tx.amount,
      categoryId: tx.categoryId,
      accountId: tx.accountId,
      toAccountId: tx.toAccountId,
      merchant: `${tx.merchant} (Copy)`,
      description: tx.description,
      date: tx.date,
      time: tx.time,
      currency: tx.currency,
      receiptUri: tx.receiptUri,
    });
  }

  public async getFinancialSummary(): Promise<FinancialSummary> {
    const transactions = await this.getAll();
    const accounts = await accountRepository.getAll();
    const budget = await db.getBudget();
    const budgetCategories = await db.getBudgetCategories();

    // Available balance = all active accounts
    const totalBalance = roundMoney(
      accounts.reduce((acc, a) => acc + (a.isArchived ? 0 : a.balance), 0)
    );

    // Calculate this month's stats
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthTxs = transactions.filter(t => t.date.startsWith(currentYearMonth));

    const totalIncome = roundMoney(
      thisMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    );

    const totalExpense = roundMoney(
      thisMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    );

    const totalSavings = roundMoney(totalIncome - totalExpense);
    const savingsRate = totalIncome > 0 ? roundMoney((totalSavings / totalIncome) * 100) : 0;

    const budgetTotal = budget ? budget.amount : 45000;
    const budgetSpent = totalExpense;
    const budgetRemaining = roundMoney(budgetTotal - budgetSpent);

    // Check category budget overruns
    let isOverrun = budgetSpent > budgetTotal;
    let overrunCategory: string | undefined;
    let overrunAmount: number | undefined;

    // Check specific categories from budgetCategories
    for (const bc of budgetCategories) {
      const catSpent = thisMonthTxs
        .filter(t => t.categoryId === bc.categoryId && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      if (catSpent > bc.limitAmount) {
        isOverrun = true;
        overrunAmount = roundMoney(catSpent - bc.limitAmount);
        const categories = await db.getCategories();
        const cat = categories.find(c => c.id === bc.categoryId);
        overrunCategory = cat ? cat.name.toUpperCase() : 'BUDGET';
        break;
      }
    }

    return {
      totalBalance,
      availableBalance: totalBalance,
      totalIncome,
      totalExpense,
      totalSavings,
      savingsRate,
      budgetTotal,
      budgetSpent,
      budgetRemaining,
      isOverrun,
      overrunCategory: overrunCategory || (isOverrun ? 'OVERALL' : undefined),
      overrunAmount: overrunAmount || (isOverrun ? Math.abs(budgetRemaining) : undefined),
    };
  }
}

export const transactionRepository = new TransactionRepository();
