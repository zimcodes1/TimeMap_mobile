import React from 'react';
import { useRouter } from 'expo-router';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';

export default function CalendarRoute() {
  const router = useRouter();
  return (
    <CalendarScreen
      onNavigateToSession={(id) => router.push(`/sessions/${id}` as any)}
    />
  );
}
