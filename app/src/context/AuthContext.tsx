import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';
import { secureStore, AuthTokens } from '@/lib/storage/secureStore';
import { localDB } from '@/lib/storage/db';
import { authAPI, mapBackendToUserProfile, LoginPayload, PasswordResetPayload } from '@/api/authAPI';
import Toast from 'react-native-toast-message';

export interface AuthContextType {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requiresPasswordReset: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = Boolean(tokens?.access && user);
  const requiresPasswordReset = Boolean(user?.requiresPasswordReset);

  /**
   * Hydrate auth state on startup from SecureStore & SQLite cache
   */
  const hydrateAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const access = await secureStore.getAccessToken();
      const refresh = await secureStore.getRefreshToken();
      const cachedProfile = await localDB.getCachedUserProfile();

      if (access && refresh) {
        setTokens({ access, refresh });

        if (cachedProfile) {
          setUser(cachedProfile);
        }

        // Validate session in background with live API
        try {
          const profileRes = await authAPI.getProfile();
          const mapped = mapBackendToUserProfile(profileRes.user, profileRes.profile);
          setUser(mapped);
          await localDB.saveUserProfile(mapped);
        } catch (apiErr: any) {
          // If 401 / 403 authorization error occurs and token refresh failed
          if (apiErr?.status === 401 || apiErr?.status === 403) {
            console.log('[AuthContext] Stored session invalid, logging out.');
            await secureStore.clearTokens();
            await localDB.clearUserProfile();
            setTokens(null);
            setUser(null);
          } else {
            console.log('[AuthContext] Network offline, relying on cached SQLite profile.');
          }
        }
      } else {
        setTokens(null);
        setUser(null);
      }
    } catch (err) {
      console.error('[AuthContext] Hydration error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  /**
   * Handle user login
   */
  const login = async (credentials: LoginPayload): Promise<void> => {
    const res = await authAPI.login(credentials);

    // Save tokens in SecureStore
    await secureStore.saveTokens(res.tokens);
    setTokens(res.tokens);

    // Map and cache profile in SQLite DB
    const mappedUser = mapBackendToUserProfile(res.user, res.profile, res.requires_password_reset);
    setUser(mappedUser);
    await localDB.saveUserProfile(mappedUser);

    Toast.show({
      type: 'success',
      text1: 'Welcome back!',
      text2: `Logged in as ${mappedUser.fullName}`,
    });
  };

  /**
   * Handle first-time password reset
   */
  const resetPassword = async (newPassword: string): Promise<void> => {
    const payload: PasswordResetPayload = { new_password: newPassword };
    const res = await authAPI.passwordReset(payload);

    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        requiresPasswordReset: false,
      };
      setUser(updatedUser);
      await localDB.saveUserProfile(updatedUser);
    }

    Toast.show({
      type: 'success',
      text1: 'Password Updated',
      text2: res.detail || 'Your password has been updated successfully.',
    });
  };

  /**
   * Handle user logout
   */
  const logout = async (): Promise<void> => {
    try {
      await secureStore.clearTokens();
      await localDB.clearUserProfile();
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    } finally {
      setTokens(null);
      setUser(null);
      Toast.show({
        type: 'info',
        text1: 'Signed out',
        text2: 'You have been logged out of your account.',
      });
    }
  };

  /**
   * Manually refetch profile from API
   */
  const refreshProfile = async (): Promise<void> => {
    if (!tokens?.access) return;
    try {
      const profileRes = await authAPI.getProfile();
      const mapped = mapBackendToUserProfile(profileRes.user, profileRes.profile);
      setUser(mapped);
      await localDB.saveUserProfile(mapped);
    } catch (err) {
      console.error('[AuthContext] Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        isAuthenticated,
        requiresPasswordReset,
        login,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
