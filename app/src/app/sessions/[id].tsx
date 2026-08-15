import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SessionDetailScreen } from '@/screens/sessions/SessionDetailScreen';

export default function SessionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SessionDetailScreen
      sessionId={id ?? ''}
      onBack={() => router.back()}
    />
  );
}
