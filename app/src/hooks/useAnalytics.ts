import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, GetAnalyticsParams } from '@/api/analyticsAPI';
import { localDB } from '@/lib/storage/db';
import { AnalyticsData } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useState, useCallback } from 'react';

const ONE_HOUR_MS = 60 * 60 * 1000;

export function useAnalytics(params: GetAnalyticsParams = {}) {
  const { user } = useAuth();
  const role = user?.role ?? 'student';
  const isClassRep = Boolean(user?.isClassRep);
  const [isOffline, setIsOffline] = useState(false);

  const cacheKey = `${role}_${isClassRep}_${params.startDate ?? 'all'}_${params.endDate ?? 'all'}_${params.courseId ?? 'all'}`;

  const query = useQuery<AnalyticsData>({
    queryKey: ['scoped_analytics', user?.id, role, isClassRep, params.startDate, params.endDate, params.courseId],
    queryFn: async () => {
      // 1. Check local SQLite cache and sync freshness
      const cached = await localDB.getCachedAnalytics(cacheKey);
      const lastSync = await localDB.getLastAnalyticsSyncTime(cacheKey);
      const isFresh = Boolean(
        cached &&
        lastSync &&
        Date.now() - lastSync < ONE_HOUR_MS
      );

      if (isFresh && cached && Object.keys(params).length === 0) {
        setIsOffline(false);
        return cached;
      }

      // 2. Fetch live analytics from backend
      try {
        const liveData = await analyticsAPI.getAnalytics(role, isClassRep, params);
        await localDB.saveAnalytics(liveData, cacheKey);
        setIsOffline(false);
        return liveData;
      } catch (err) {
        console.warn('[useAnalytics] Query failed, attempting SQLite cache:', err);
        if (cached) {
          setIsOffline(true);
          return cached;
        }
        throw err;
      }
    },
    enabled: Boolean(user?.id),
    staleTime: ONE_HOUR_MS,
    gcTime: 24 * ONE_HOUR_MS,
  });

  const forceRefetch = useCallback(async () => {
    try {
      const liveData = await analyticsAPI.getAnalytics(role, isClassRep, params);
      await localDB.saveAnalytics(liveData, cacheKey);
      setIsOffline(false);
      return query.refetch();
    } catch (err) {
      console.warn('[useAnalytics] Force refresh failed, falling back to cache:', err);
      const cached = await localDB.getCachedAnalytics(cacheKey);
      if (cached) {
        setIsOffline(true);
      }
      return query.refetch();
    }
  }, [params, role, isClassRep, cacheKey, query]);

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    isOffline,
    refetch: forceRefetch,
  };
}
