import { create } from 'zustand';
import { Category } from '../types';
import { categoryRepository } from '../database/repositories/categoryRepository';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  loadCategories: () => Promise<void>;
  createCategory: (data: {
    name: string;
    icon: string;
    color: string;
    type: 'expense' | 'income' | 'both';
    budgetLimit?: number;
  }) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: true,

  loadCategories: async () => {
    try {
      const categories = await categoryRepository.getAll();
      set({ categories, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createCategory: async data => {
    const created = await categoryRepository.create(data);
    await get().loadCategories();
    return created;
  },

  updateCategory: async (id, updates) => {
    await categoryRepository.update(id, updates);
    await get().loadCategories();
  },

  deleteCategory: async id => {
    await categoryRepository.delete(id);
    await get().loadCategories();
  },

  getCategoryById: (id: string) => {
    return get().categories.find(c => c.id === id);
  },
}));
