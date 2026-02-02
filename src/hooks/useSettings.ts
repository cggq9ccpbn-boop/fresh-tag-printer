import { useLocalStorage } from './useLocalStorage';
import { DistributorSettings, DEFAULT_SETTINGS } from '@/types';

const SETTINGS_KEY = 'food-labels-settings';

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<DistributorSettings>(
    SETTINGS_KEY,
    DEFAULT_SETTINGS
  );

  const updateSettings = (updates: Partial<DistributorSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const isConfigured = () => {
    return settings.companyName.trim() !== '' && settings.address.trim() !== '';
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isConfigured,
  };
}
