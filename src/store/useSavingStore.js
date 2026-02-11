import { create } from 'zustand';
import { SavingRepository } from '../data/repositories/SavingRepository';

export const useSavingStore = create((set, get) => ({
  savings: [],
  loading: false,
  error: null,

  // Fetch all savings
  fetchSavings: async () => {
    set({ loading: true, error: null });
    try {
      const savings = await SavingRepository.getAll();
      set({ savings, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Add saving
  addSaving: async (saving) => {
    set({ loading: true, error: null });
    try {
      await SavingRepository.create(saving);
      await get().fetchSavings();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update saving
  updateSaving: async (id, saving) => {
    set({ loading: true, error: null });
    try {
      await SavingRepository.update(id, saving);
      await get().fetchSavings();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete saving
  deleteSaving: async (id) => {
    set({ loading: true, error: null });
    try {
      await SavingRepository.delete(id);
      await get().fetchSavings();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Add saving transaction (deposit/withdraw)
  addSavingTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      await SavingRepository.addSavingTransaction(transaction);
      await get().fetchSavings();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get saving transactions
  getSavingTransactions: async (savingId) => {
    try {
      return await SavingRepository.getSavingTransactions(savingId);
    } catch (error) {
      console.error('Error fetching saving transactions:', error);
      return [];
    }
  },
}));