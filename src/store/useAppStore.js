import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // UI State
  isDarkMode: true,
  isLoading: false,
  
  // Set dark mode
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  
  // Set loading
  setLoading: (loading) => set({ isLoading: loading }),
  
  // Date filters
  selectedDateRange: 'month', // 'day', 'week', 'month', 'year'
  setDateRange: (range) => set({ selectedDateRange: range }),
  
  // Active wallet
  activeWalletId: 1,
  setActiveWallet: (id) => set({ activeWalletId: id }),
}));