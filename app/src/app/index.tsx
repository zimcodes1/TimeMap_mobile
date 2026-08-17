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
  const { isAuthenticated, user, requiresPasswordReset, isLoading } = useAuth();

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
    }
  }, [isAuthenticated, user, requiresPasswordReset, isLoading, router]);

  const handleLoginPress = () => {
    router.replace('/(auth)/login');
  };

  return <WelcomeScreen onLoginPress={handleLoginPress} />;
}

