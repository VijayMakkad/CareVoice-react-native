/**
 * @fileoverview Zustand store for settings — expanded with all toggles.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@carevoice_settings';

const useSettingsStore = create((set, get) => ({
  theme: 'dark',
  voiceEnabled: true,
  hapticEnabled: true,
  notificationsEnabled: true,
  fallDetectionEnabled: false,
  speechRate: 0.8,
  fontSize: 'large',

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) set(JSON.parse(raw));
    } catch (e) {
      console.error('[SettingsStore] Load error:', e);
    }
  },

  updateSetting: async (key, value) => {
    set({ [key]: value });
    const state = get();
    const toSave = {
      theme: state.theme,
      voiceEnabled: state.voiceEnabled,
      hapticEnabled: state.hapticEnabled,
      notificationsEnabled: state.notificationsEnabled,
      fallDetectionEnabled: state.fallDetectionEnabled,
      speechRate: state.speechRate,
      fontSize: state.fontSize,
    };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
  },
}));

export default useSettingsStore;
