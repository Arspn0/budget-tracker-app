import { create } from 'zustand';
import { TransactionRepository } from '../data/repositories/TransactionRepository';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  summary: {
    income: 0,
    expense: 0,
    balance: 0,
  },

  // Fetch all transactions
  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const transactions = await TransactionRepository.getAll();
      set({ transactions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch transactions by date range
  fetchByDateRange: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const transactions = await TransactionRepository.getByDateRange(startDate, endDate);
      set({ transactions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch summary
  fetchSummary: async (startDate, endDate) => {
    try {
      const summary = await TransactionRepository.getSummary(startDate, endDate);
      set({ summary });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  },

  // Add transaction
  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      await TransactionRepository.create(transaction);
      await get().fetchTransactions();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update transaction
  updateTransaction: async (id, transaction) => {
    set({ loading: true, error: null });
    try {
      await TransactionRepository.update(id, transaction);
      await get().fetchTransactions();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      await TransactionRepository.delete(id);
      await get().fetchTransactions();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get transactions by category
  fetchByCategory: async (startDate, endDate, type = 'expense') => {
    try {
      return await TransactionRepository.getByCategory(startDate, endDate, type);
    } catch (error) {
      console.error('Error fetching by category:', error);
      return [];
    }
  },
}));