import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme_mode';

export const useAppStore = create((set, get) => ({
  // Default Theme
  isDarkMode: true,
  
  // Init: load saved theme preference
  initTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved !== null) {
        set({ isDarkMode: saved === 'dark' });
      }
    } catch (e) {
      console.error('Error loading theme:', e);
    }
  },

  // Toggle theme
  setDarkMode: async (isDark) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
      set({ isDarkMode: isDark });
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  },

  // Date range filter (for reports)
  dateRange: 'month',
  setDateRange: (range) => set({ dateRange: range }),

  // Active wallet filter
  activeWalletId: null,
  setActiveWallet: (id) => set({ activeWalletId: id }),
}));