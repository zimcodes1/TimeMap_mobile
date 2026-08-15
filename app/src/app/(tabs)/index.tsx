import React from 'react';
import { useRouter } from 'expo-router';
import { TodayScreen } from '@/screens/today/TodayScreen';

export default function TodayRoute() {
  const router = useRouter();
  return (
    <TodayScreen
      onNavigateToSession={(id) => router.push(`/sessions/${id}` as any)}
    />
  );
}
