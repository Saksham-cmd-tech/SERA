import { useSettingsStore } from '../store/useSettingsStore';
import { lightTheme, darkTheme, Theme } from '../theme';

export function useAppTheme(): Theme & {
  isPrivacyMode: boolean;
  currencySymbol: string;
  currency: string;
} {
  const settings = useSettingsStore(state => state.settings);
  const theme = settings.isDarkMode ? darkTheme : lightTheme;

  return {
    ...theme,
    isPrivacyMode: settings.isPrivacyMode,
    currencySymbol: settings.currencySymbol || '₹',
    currency: settings.currency || 'INR',
  };
}
