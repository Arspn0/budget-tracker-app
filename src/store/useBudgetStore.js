import { create } from 'zustand';
import { BudgetRepository } from '../data/repositories/BudgetRepository';

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  loading: false,
  error: null,

  // Fetch budgets for current month
  fetchBudgets: async (month, year) => {
    set({ loading: true, error: null });
    try {
      const budgets = await BudgetRepository.getAll(month, year);
      
      // Get spent amount for each budget
      const budgetsWithSpent = await Promise.all(
        budgets.map(async (budget) => {
          const spent = await BudgetRepository.getSpentAmount(
            budget.category_id,
            month,
            year
          );
          return {
            ...budget,
            spent,
            percentage: (spent / budget.limit_amount) * 100,
          };
        })
      );
      
      set({ budgets: budgetsWithSpent, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Add budget
  addBudget: async (budget) => {
    set({ loading: true, error: null });
    try {
      await BudgetRepository.create(budget);
      await get().fetchBudgets(budget.month, budget.year);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update budget
  updateBudget: async (id, budget) => {
    set({ loading: true, error: null });
    try {
      await BudgetRepository.update(id, budget);
      const currentDate = new Date();
      await get().fetchBudgets(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete budget
  deleteBudget: async (id) => {
    set({ loading: true, error: null });
    try {
      await BudgetRepository.delete(id);
      const currentDate = new Date();
      await get().fetchBudgets(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));