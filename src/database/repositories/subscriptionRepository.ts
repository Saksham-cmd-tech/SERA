import { db } from '../database';
import { Subscription } from '../../types';
import { roundMoney } from '../../utils/currency';

export interface SubscriptionSummary {
  subscriptions: Subscription[];
  monthlyTotal: number;
  yearlyTotal: number;
}

class SubscriptionRepository {
  public async getAll(): Promise<Subscription[]> {
    const list = await db.getSubscriptions();
    return list.sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate));
  }

  public async getById(id: string): Promise<Subscription | undefined> {
    const list = await db.getSubscriptions();
    return list.find(s => s.id === id);
  }

  public async create(data: Omit<Subscription, 'id'>): Promise<Subscription> {
    const list = await db.getSubscriptions();
    const newSub: Subscription = {
      ...data,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    list.push(newSub);
    await db.saveSubscriptions(list);
    return newSub;
  }

  public async update(
    id: string,
    updates: Partial<Omit<Subscription, 'id'>>
  ): Promise<Subscription | null> {
    const list = await db.getSubscriptions();
    const index = list.findIndex(s => s.id === id);
    if (index === -1) return null;

    const updated: Subscription = {
      ...list[index],
      ...updates,
    };
    list[index] = updated;
    await db.saveSubscriptions(list);
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const list = await db.getSubscriptions();
    const index = list.findIndex(s => s.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    await db.saveSubscriptions(list);
    return true;
  }

  public async getSummary(): Promise<SubscriptionSummary> {
    const subs = await this.getAll();
    let monthlyTotal = 0;

    for (const sub of subs) {
      if (sub.frequency === 'monthly') {
        monthlyTotal += sub.amount;
      } else if (sub.frequency === 'yearly') {
        monthlyTotal += sub.amount / 12;
      }
    }

    monthlyTotal = roundMoney(monthlyTotal);
    const yearlyTotal = roundMoney(monthlyTotal * 12);

    return {
      subscriptions: subs,
      monthlyTotal,
      yearlyTotal,
    };
  }
}

export const subscriptionRepository = new SubscriptionRepository();
