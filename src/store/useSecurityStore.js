import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const PIN_KEY        = 'budget_tracker_pin';
const BIOMETRIC_KEY  = 'budget_tracker_biometric_enabled';

export const useSecurityStore = create((set, get) => ({
  // State
  isPinSet:          false,
  isBiometricEnabled: false,
  isBiometricSupported: false,
  isAuthenticated:   false,
  isLocked:          true,

  // ── Init: load saved settings from SecureStore ──────────────────────────
  initSecurity: async () => {
    try {
      const pin             = await SecureStore.getItemAsync(PIN_KEY);
      const biometricPref   = await SecureStore.getItemAsync(BIOMETRIC_KEY);
      const hwAvailable     = await LocalAuthentication.hasHardwareAsync();
      const enrolled        = await LocalAuthentication.isEnrolledAsync();

      set({
        isPinSet:             !!pin,
        isBiometricEnabled:   biometricPref === 'true',
        isBiometricSupported: hwAvailable && enrolled,
      });
    } catch (e) {
      console.error('initSecurity error:', e);
    }
  },

  // ── Set / Change PIN ─────────────────────────────────────────────────────
  setPin: async (pin) => {
    await SecureStore.setItemAsync(PIN_KEY, pin);
    set({ isPinSet: true });
  },

  // ── Remove PIN ───────────────────────────────────────────────────────────
  removePin: async () => {
    await SecureStore.deleteItemAsync(PIN_KEY);
    await SecureStore.setItemAsync(BIOMETRIC_KEY, 'false');
    set({ isPinSet: false, isBiometricEnabled: false });
  },

  // ── Verify PIN ───────────────────────────────────────────────────────────
  verifyPin: async (inputPin) => {
    const savedPin = await SecureStore.getItemAsync(PIN_KEY);
    return savedPin === inputPin;
  },

  // ── Toggle biometric ─────────────────────────────────────────────────────
  setBiometricEnabled: async (enabled) => {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? 'true' : 'false');
    set({ isBiometricEnabled: enabled });
  },

  // ── Authenticate with biometric ──────────────────────────────────────────
  authenticateWithBiometric: async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:      'Verifikasi identitas Anda',
        fallbackLabel:      'Gunakan PIN',
        disableDeviceFallback: false,
        cancelLabel:        'Batal',
      });
      if (result.success) {
        set({ isAuthenticated: true, isLocked: false });
      }
      return result.success;
    } catch (e) {
      console.error('Biometric auth error:', e);
      return false;
    }
  },

  // ── Unlock app ───────────────────────────────────────────────────────────
  unlock: () => set({ isAuthenticated: true, isLocked: false }),

  // ── Lock app ─────────────────────────────────────────────────────────────
  lock: () => set({ isAuthenticated: false, isLocked: true }),
}));