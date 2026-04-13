import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SystemSettings {
  evaluationPeriodOpen: boolean;
  anonymousModeEnabled: boolean;
}

const CACHE_KEY_SETTINGS = 'offline_system_settings';

export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const response = await api.get('/admin/settings');
    // Cache for offline use
    await AsyncStorage.setItem(CACHE_KEY_SETTINGS, JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    // Graceful offline fallback
    if (error.message?.includes('Network Error') || error.message?.includes('timed out') || error.message?.includes('offline')) {
      const cached = await AsyncStorage.getItem(CACHE_KEY_SETTINGS);
      if (cached) {
        console.log('Serving system settings from offline cache');
        return JSON.parse(cached);
      }
      // Default settings if no cache available
      return { evaluationPeriodOpen: true, anonymousModeEnabled: false };
    }
    throw error;
  }
};
