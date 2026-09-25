import { db } from '../database';
import { Account, AccountType } from '../../types';
import { roundMoney } from '../../utils/currency';

class AccountRepository {
  public async getAll(includeArchived: boolean = false): Promise<Account[]> {
    const list = await db.getAccounts();
    if (!includeArchived) {
      return list.filter(a => !a.isArchived);
    }
    return list;
  }

  public async getById(id: string): Promise<Account | undefined> {
    const list = await db.getAccounts();
    return list.find(a => a.id === id);
  }

  public async create(data: {
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    institution?: string;
    accountNumberMask?: string;
  }): Promise<Account> {
    const list = await db.getAccounts();
    const newAccount: Account = {
      ...data,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newAccount);
    await db.saveAccounts(list);
    return newAccount;
  }

  public async update(
    id: string,
    updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Account | null> {
    const list = await db.getAccounts();
    const index = list.findIndex(a => a.id === id);
    if (index === -1) return null;

    const updated: Account = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    await db.saveAccounts(list);
    return updated;
  }

  public async adjustBalance(id: string, delta: number): Promise<void> {
    const list = await db.getAccounts();
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index].balance = roundMoney(list[index].balance + delta);
      list[index].updatedAt = new Date().toISOString();
      await db.saveAccounts(list);
    }
  }

  public async delete(id: string): Promise<boolean> {
    const list = await db.getAccounts();
    const index = list.findIndex(a => a.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    await db.saveAccounts(list);
    return true;
  }

  public async getNetWorth(): Promise<{ assets: number; liabilities: number; netWorth: number }> {
    const list = await this.getAll(false);
    let assets = 0;
    let liabilities = 0;

    for (const acc of list) {
      if (acc.balance >= 0) {
        assets += acc.balance;
      } else {
        liabilities += Math.abs(acc.balance);
      }
    }

    return {
      assets: roundMoney(assets),
      liabilities: roundMoney(liabilities),
      netWorth: roundMoney(assets - liabilities),
    };
  }
}

export const accountRepository = new AccountRepository();
