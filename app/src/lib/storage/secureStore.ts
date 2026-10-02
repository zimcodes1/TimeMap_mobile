import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'timemap_access_token';
const REFRESH_TOKEN_KEY = 'timemap_refresh_token';
const USER_SESSION_KEY = 'timemap_user_session';
const HAS_LOGGED_IN_KEY = 'timemap_has_logged_in';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export const secureStore = {
  /**
   * Save access and refresh tokens to SecureStore
   */
  async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh);
    } catch (error) {
      console.error('[SecureStore] Error saving tokens:', error);
    }
  },

  /**
   * Retrieve stored access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('[SecureStore] Error reading access token:', error);
      return null;
    }
  },

  /**
   * Retrieve stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('[SecureStore] Error reading refresh token:', error);
      return null;
    }
  },

  /**
   * Clear all stored authentication tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_SESSION_KEY);
    } catch (error) {
      console.error('[SecureStore] Error clearing tokens:', error);
    }
  },

  /**
   * Mark that a user has logged in to the app at least once
   */
  async saveHasLoggedIn(): Promise<void> {
    try {
      await SecureStore.setItemAsync(HAS_LOGGED_IN_KEY, 'true');
    } catch (error) {
      console.error('[SecureStore] Error saving hasLoggedIn:', error);
    }
  },

  /**
   * Check if a user has ever logged in to the app
   */
  async getHasLoggedIn(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(HAS_LOGGED_IN_KEY);
      return val === 'true';
    } catch (error) {
      console.error('[SecureStore] Error reading hasLoggedIn:', error);
      return false;
    }
  },

  /**
   * Reset hasLoggedIn flag (used only on explicit user logout)
   */
  async clearHasLoggedIn(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(HAS_LOGGED_IN_KEY);
    } catch (error) {
      console.error('[SecureStore] Error clearing hasLoggedIn:', error);
    }
  },
};
