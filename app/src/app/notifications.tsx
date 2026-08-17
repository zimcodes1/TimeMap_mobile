import React from 'react';
import { useRouter } from 'expo-router';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';

export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <NotificationsScreen
      onNavigateToSession={(sessionId) => router.push(`/sessions/${sessionId}` as any)}
      onNavigateToReport={(reportId) => router.push(`/reports/${reportId}` as any)}
    />
  );
}
