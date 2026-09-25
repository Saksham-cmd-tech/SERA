import { db } from '../database';
import { Category } from '../../types';

class CategoryRepository {
  public async getAll(type?: 'expense' | 'income' | 'both'): Promise<Category[]> {
    const list = await db.getCategories();
    if (type) {
      return list.filter(c => c.type === type || c.type === 'both');
    }
    return list;
  }

  public async getById(id: string): Promise<Category | undefined> {
    const list = await db.getCategories();
    return list.find(c => c.id === id);
  }

  public async create(data: {
    name: string;
    icon: string;
    color: string;
    type: 'expense' | 'income' | 'both';
    budgetLimit?: number;
  }): Promise<Category> {
    const list = await db.getCategories();
    const newCategory: Category = {
      ...data,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    list.push(newCategory);
    await db.saveCategories(list);
    return newCategory;
  }

  public async update(
    id: string,
    updates: Partial<Omit<Category, 'id' | 'createdAt'>>
  ): Promise<Category | null> {
    const list = await db.getCategories();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated: Category = {
      ...list[index],
      ...updates,
    };
    list[index] = updated;
    await db.saveCategories(list);
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const list = await db.getCategories();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    await db.saveCategories(list);
    return true;
  }
}

export const categoryRepository = new CategoryRepository();
