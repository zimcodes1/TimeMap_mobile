import React from 'react';
import { useRouter } from 'expo-router';
import { ReportsScreen } from '@/screens/reports/ReportsScreen';

export default function ReportsRoute() {
  const router = useRouter();
  return (
    <ReportsScreen
      onNavigateToSession={(id) => router.push(`/sessions/${id}` as any)}
    />
  );
}
