import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { WelcomeScreen } from '@/screens/welcome/WelcomeScreen';
import { useAuth } from '@/context/AuthContext';

function isMobileRoleAllowed(user: any): boolean {
  if (!user) return false;
  return (
    user.role === 'student' ||
    user.role === 'class_rep' ||
    user.role === 'lecturer' ||
    Boolean(user.isClassRep)
  );
}

export default function IndexRoute() {
  const router = useRouter();
  const { isAuthenticated, user, requiresPasswordReset, hasEverLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      if (!isMobileRoleAllowed(user)) {
        router.replace('/(auth)/unauthorized-role');
      } else if (requiresPasswordReset) {
        router.replace('/(auth)/reset-password');
      } else {
        router.replace('/(tabs)');
      }
    } else if (hasEverLoggedIn) {
      // User has logged in before and hasn't logged out -> skip Welcome screen directly to Login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, user, requiresPasswordReset, hasEverLoggedIn, isLoading, router]);

  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  if (isLoading || isAuthenticated || hasEverLoggedIn) {
    return null;
  }

  return <WelcomeScreen onLoginPress={handleLoginPress} />;
}

