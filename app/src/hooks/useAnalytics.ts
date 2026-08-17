import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, GetAnalyticsParams } from '@/api/analyticsAPI';
import { localDB } from '@/lib/storage/db';
import { AnalyticsData } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export function useAnalytics(params: GetAnalyticsParams = {}) {
  const { user } = useAuth();
  const role = user?.role ?? 'student';
  const isClassRep = Boolean(user?.isClassRep);
  const [isOffline, setIsOffline] = useState(false);

  const cacheKey = `analytics_${role}_${isClassRep}_${params.startDate ?? 'all'}_${params.endDate ?? 'all'}_${params.courseId ?? 'all'}`;

  const query = useQuery<AnalyticsData>({
    queryKey: ['analytics', role, isClassRep, params.startDate, params.endDate, params.courseId],
    queryFn: async () => {
      try {
        const liveData = await analyticsAPI.getAnalytics(role, isClassRep, params);
        await localDB.setCache(cacheKey, liveData);
        setIsOffline(false);
        return liveData;
      } catch (err) {
        console.warn('[useAnalytics] Query failed, attempting SQLite cache:', err);
        const cached = await localDB.getCache<AnalyticsData>(cacheKey);
        if (cached) {
          setIsOffline(true);
          return cached;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    isOffline,
    refetch: query.refetch,
  };
}
