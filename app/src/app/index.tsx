import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { WelcomeScreen } from '@/screens/welcome/WelcomeScreen';
import { useAuth } from '@/context/AuthContext';

export default function IndexRoute() {
  const router = useRouter();
  const { isAuthenticated, requiresPasswordReset, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      if (requiresPasswordReset) {
        router.replace('/(auth)/reset-password');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, requiresPasswordReset, isLoading, router]);

  const handleLoginPress = () => {
    router.replace('/(auth)/login');
  };

  return <WelcomeScreen onLoginPress={handleLoginPress} />;
}

