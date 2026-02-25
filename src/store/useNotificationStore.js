import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_SETTINGS_KEY = 'notification_settings';

export const useNotificationStore = create((set, get) => ({
  // Budget Alert
  budgetAlertEnabled: true,
  budgetAlertThreshold: 80, // 50, 80, 90, 100

  // Savings Reminder
  savingsReminderEnabled: false,
  savingsReminderFrequency: 'weekly', // daily, weekly, monthly
  savingsReminderTime: '09:00',

  // Daily Summary
  dailySummaryEnabled: false,
  dailySummaryTime: '20:00',

  // ── Init: Load saved settings ─────────────────────────────────────────
  initNotifications: async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        set(settings);
      }
    } catch (e) {
      console.error('Error loading notification settings:', e);
    }
  },

  // ── Save settings ──────────────────────────────────────────────────────
  saveSettings: async () => {
    try {
      const state = get();
      const settings = {
        budgetAlertEnabled: state.budgetAlertEnabled,
        budgetAlertThreshold: state.budgetAlertThreshold,
        savingsReminderEnabled: state.savingsReminderEnabled,
        savingsReminderFrequency: state.savingsReminderFrequency,
        savingsReminderTime: state.savingsReminderTime,
        dailySummaryEnabled: state.dailySummaryEnabled,
        dailySummaryTime: state.dailySummaryTime,
      };
      await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving notification settings:', e);
    }
  },

  // ── Budget Alert ───────────────────────────────────────────────────────
  setBudgetAlert: async (enabled, threshold) => {
    set({ budgetAlertEnabled: enabled, budgetAlertThreshold: threshold });
    await get().saveSettings();
  },

  // ── Savings Reminder ───────────────────────────────────────────────────
  setSavingsReminder: async (enabled, frequency, time) => {
    set({
      savingsReminderEnabled: enabled,
      savingsReminderFrequency: frequency,
      savingsReminderTime: time,
    });
    await get().saveSettings();
  },

  // ── Daily Summary ──────────────────────────────────────────────────────
  setDailySummary: async (enabled, time) => {
    set({ dailySummaryEnabled: enabled, dailySummaryTime: time });
    await get().saveSettings();
  },
}));