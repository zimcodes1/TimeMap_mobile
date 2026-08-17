import React from 'react';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { useAuth } from '@/context/AuthContext';

export default function ProfileRoute() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return <ProfileScreen onLogout={handleLogout} />;
}

