import { db } from '../database';
import { Goal, GoalContribution } from '../../types';
import { roundMoney } from '../../utils/currency';

export interface GoalStatus extends Goal {
  percentage: number;
  remainingAmount: number;
  monthsRemaining: number;
  calculatedRequiredMonthly: number;
  isOnTrack: boolean;
}

class GoalRepository {
  public async getAll(): Promise<Goal[]> {
    return db.getGoals();
  }

  public async getById(id: string): Promise<Goal | undefined> {
    const list = await db.getGoals();
    return list.find(g => g.id === id);
  }

  public async create(data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    monthlyContribution: number;
    accountId?: string;
    icon: string;
    color: string;
  }): Promise<Goal> {
    const list = await db.getGoals();
    const newGoal: Goal = {
      ...data,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newGoal);
    await db.saveGoals(list);
    return newGoal;
  }

  public async update(
    id: string,
    updates: Partial<Omit<Goal, 'id' | 'createdAt'>>
  ): Promise<Goal | null> {
    const list = await db.getGoals();
    const index = list.findIndex(g => g.id === id);
    if (index === -1) return null;

    const updated: Goal = {
      ...list[index],
      ...updates,
    };
    list[index] = updated;
    await db.saveGoals(list);
    return updated;
  }

  public async addContribution(goalId: string, amount: number, notes?: string): Promise<void> {
    const list = await db.getGoals();
    const index = list.findIndex(g => g.id === goalId);
    if (index !== -1) {
      list[index].currentAmount = roundMoney(list[index].currentAmount + amount);
      await db.saveGoals(list);

      const contributions = await db.getGoalContributions();
      const newContribution: GoalContribution = {
        id: `gc-${Date.now()}`,
        goalId,
        amount: roundMoney(amount),
        date: new Date().toISOString().split('T')[0],
        notes,
      };
      contributions.push(newContribution);
      await db.saveGoalContributions(contributions);
    }
  }

  public async delete(id: string): Promise<boolean> {
    const list = await db.getGoals();
    const index = list.findIndex(g => g.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    await db.saveGoals(list);
    return true;
  }

  public async getGoalsWithStatus(): Promise<GoalStatus[]> {
    const goals = await this.getAll();
    const now = new Date();

    return goals.map(goal => {
      const remainingAmount = Math.max(0, roundMoney(goal.targetAmount - goal.currentAmount));
      const percentage =
        goal.targetAmount > 0
          ? Math.min(100, roundMoney((goal.currentAmount / goal.targetAmount) * 100))
          : 0;

      const target = new Date(goal.targetDate);
      const diffMonths =
        (target.getFullYear() - now.getFullYear()) * 12 +
        (target.getMonth() - now.getMonth());
      const monthsRemaining = Math.max(1, diffMonths);

      const calculatedRequiredMonthly = roundMoney(remainingAmount / monthsRemaining);
      // Considered on track if user's planned monthly contribution is >= required monthly contribution
      const isOnTrack =
        goal.currentAmount >= goal.targetAmount ||
        goal.monthlyContribution >= calculatedRequiredMonthly * 0.95;

      return {
        ...goal,
        percentage,
        remainingAmount,
        monthsRemaining,
        calculatedRequiredMonthly,
        isOnTrack,
      };
    });
  }
}

export const goalRepository = new GoalRepository();
