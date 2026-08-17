import { Platform } from 'react-native';

/**
 * API Base URL resolution for TimeMap Mobile.
 * In development:
 * - Android emulator maps host machine localhost to 10.0.2.2
 * - iOS simulator connects via localhost
 * - Physical devices connect via EXPO_PUBLIC_API_URL or local IP
 */
function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }

  return 'http://localhost:8000/api';
}

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT_MS: 15000,
  TOKEN_REFRESH_THRESHOLD_DAYS: 7,
};
