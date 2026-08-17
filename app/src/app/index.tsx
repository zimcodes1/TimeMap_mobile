import React from 'react';
import { useRouter } from 'expo-router';
import { WelcomeScreen } from '@/screens/welcome/WelcomeScreen';

export default function IndexRoute() {
  const router = useRouter();

  const handleLoginPress = () => {
    router.replace('/(auth)/login');
  };

  return <WelcomeScreen onLoginPress={handleLoginPress} />;
}
