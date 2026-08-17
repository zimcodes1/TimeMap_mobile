import React from 'react';
import { useRouter } from 'expo-router';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';

export default function NotificationsRoute() {
  const router = useRouter();
  return (
    <NotificationsScreen
      onNavigateToSession={(id) => router.push(`/sessions/${id}` as any)}
      onNavigateToReport={(id) => router.push(`/reports/${id}` as any)}
    />
  );
}
