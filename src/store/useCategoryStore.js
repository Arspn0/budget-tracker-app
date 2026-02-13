import { create } from 'zustand';
import { CategoryRepository } from '../data/repositories/CategoryRepository';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  // ─── FIX BUG 2: Always replace state, never append ───
  fetchCategories: async (type = null) => {
    // Skip if already loading to prevent duplicate concurrent fetches
    if (get().loading) return;

    set({ loading: true, error: null });
    try {
      const categories = await CategoryRepository.getAll(type);
      // Explicitly REPLACE the array — never append
      set({ categories: categories ?? [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      await CategoryRepository.create(category);
      // Re-fetch ALL categories to get fresh list
      const categories = await CategoryRepository.getAll();
      set({ categories: categories ?? [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateCategory: async (id, category) => {
    set({ loading: true, error: null });
    try {
      await CategoryRepository.update(id, category);
      const categories = await CategoryRepository.getAll();
      set({ categories: categories ?? [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await CategoryRepository.delete(id);
      const categories = await CategoryRepository.getAll();
      set({ categories: categories ?? [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getCategoriesByType: (type) => {
    return get().categories.filter(cat => cat.type === type);
  },
}));