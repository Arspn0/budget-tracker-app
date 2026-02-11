import { create } from 'zustand';
import { CategoryRepository } from '../data/repositories/CategoryRepository';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  // Fetch all categories
  fetchCategories: async (type = null) => {
    set({ loading: true, error: null });
    try {
      const categories = await CategoryRepository.getAll(type);
      set({ categories, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Add category
  addCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      await CategoryRepository.create(category);
      await get().fetchCategories();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, category) => {
    set({ loading: true, error: null });
    try {
      await CategoryRepository.update(id, category);
      await get().fetchCategories();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await CategoryRepository.delete(id);
      await get().fetchCategories();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get categories by type
  getCategoriesByType: (type) => {
    const { categories } = get();
    return categories.filter(cat => cat.type === type);
  },
}));