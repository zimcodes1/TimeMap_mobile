import React from 'react';
import { useRouter } from 'expo-router';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

export default function ProfileRoute() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO(api-wiring): clear auth context + SecureStore tokens
    router.replace('/(auth)/login');
  };

  return <ProfileScreen onLogout={handleLogout} />;
}
