import { create } from 'zustand';
import { TransactionRepository } from '../data/repositories/TransactionRepository';
import { WalletRepository } from '../data/repositories/WalletRepository';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  summary: {
    income: 0,
    expense: 0,
    balance: 0,
  },

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const transactions = await TransactionRepository.getAll();
      set({ transactions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchByDateRange: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const transactions = await TransactionRepository.getByDateRange(startDate, endDate);
      set({ transactions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSummary: async (startDate, endDate) => {
    try {
      const summary = await TransactionRepository.getSummary(startDate, endDate);
      set({ summary });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  },

  // ─── FIX BUG 1: Update wallet balance when adding transaction ───
  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      // 1. Insert the transaction
      await TransactionRepository.create(transaction);

      // 2. Update wallet balance
      //    income  → +amount  (saldo naik)
      //    expense → -amount  (saldo turun)
      const balanceDelta = transaction.type === 'income'
        ? transaction.amount
        : -transaction.amount;

      await WalletRepository.updateBalance(transaction.wallet_id, balanceDelta);

      // 3. Refresh transactions list
      await get().fetchTransactions();

      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // ─── FIX BUG 1: Reverse old balance then apply new on update ───
  updateTransaction: async (id, newTransaction, oldTransaction) => {
    set({ loading: true, error: null });
    try {
      // Reverse old transaction's effect on wallet
      if (oldTransaction) {
        const reverseDelta = oldTransaction.type === 'income'
          ? -oldTransaction.amount
          : oldTransaction.amount;
        await WalletRepository.updateBalance(oldTransaction.wallet_id, reverseDelta);
      }

      // Apply new transaction's effect
      const newDelta = newTransaction.type === 'income'
        ? newTransaction.amount
        : -newTransaction.amount;
      await WalletRepository.updateBalance(newTransaction.wallet_id, newDelta);

      // Update the record
      await TransactionRepository.update(id, newTransaction);
      await get().fetchTransactions();

      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // ─── FIX BUG 1: Reverse balance when deleting transaction ───
  deleteTransaction: async (id, transaction) => {
    set({ loading: true, error: null });
    try {
      // Reverse the transaction's effect on wallet
      if (transaction) {
        const reverseDelta = transaction.type === 'income'
          ? -transaction.amount
          : transaction.amount;
        await WalletRepository.updateBalance(transaction.wallet_id, reverseDelta);
      }

      await TransactionRepository.delete(id);
      await get().fetchTransactions();

      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchByCategory: async (startDate, endDate, type = 'expense') => {
    try {
      return await TransactionRepository.getByCategory(startDate, endDate, type);
    } catch (error) {
      console.error('Error fetching by category:', error);
      return [];
    }
  },
}));