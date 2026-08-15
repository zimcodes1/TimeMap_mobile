import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NotificationResolverScreen } from '@/screens/notifications/NotificationResolverScreen';

export default function NotificationResolverRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <NotificationResolverScreen
      notificationId={id ?? ''}
      onBack={() => router.back()}
      onNavigateToSession={(sessionId) => router.replace(`/sessions/${sessionId}` as any)}
      onNavigateToReport={(reportId) => router.replace(`/reports/${reportId}` as any)}
    />
  );
}
