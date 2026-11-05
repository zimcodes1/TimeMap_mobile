import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ReportsScreen } from '@/screens/reports/ReportsScreen';

export default function ReportsRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const canAccessReports = Boolean(user?.isClassRep || user?.role === 'class_rep' || user?.role === 'lecturer');

  useEffect(() => {
    if (!canAccessReports) {
      router.replace('/(tabs)');
    }
  }, [canAccessReports, router]);

  if (!canAccessReports) {
    return null;
  }

  return (
    <ReportsScreen
      onNavigateToSession={(id) => router.push(`/sessions/${id}` as any)}
    />
  );
}
