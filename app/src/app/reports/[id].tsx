import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReportDetailScreen } from '@/screens/reports/ReportDetailScreen';

export default function ReportDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <ReportDetailScreen
      reportId={id ?? ''}
      onBack={() => router.back()}
    />
  );
}
