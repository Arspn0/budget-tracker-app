import { useAppStore } from '../store/useAppStore';
import { DarkColors, LightColors } from '../theme/colors';

export const useTheme = () => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  return isDarkMode ? DarkColors : LightColors;
};

// Helper: get theme colors without hook (for non-component files)
export const getThemeColors = (isDark) => {
  return isDark ? DarkColors : LightColors;
};