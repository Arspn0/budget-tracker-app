import { create } from 'zustand';
import { WalletRepository } from '../data/repositories/WalletRepository';

export const useWalletStore = create((set, get) => ({
  wallets: [],
  totalBalance: 0,
  loading: false,
  error: null,

  // Fetch all wallets
  fetchWallets: async () => {
    set({ loading: true, error: null });
    try {
      const wallets = await WalletRepository.getAll();
      const totalBalance = await WalletRepository.getTotalBalance();
      set({ wallets, totalBalance, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Add wallet
  addWallet: async (wallet) => {
    set({ loading: true, error: null });
    try {
      await WalletRepository.create(wallet);
      await get().fetchWallets();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update wallet
  updateWallet: async (id, wallet) => {
    set({ loading: true, error: null });
    try {
      await WalletRepository.update(id, wallet);
      await get().fetchWallets();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete wallet
  deleteWallet: async (id) => {
    set({ loading: true, error: null });
    try {
      await WalletRepository.delete(id);
      await get().fetchWallets();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update balance
  updateBalance: async (id, amount) => {
    try {
      await WalletRepository.updateBalance(id, amount);
      await get().fetchWallets();
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  },
}));