import { useQuery, useQueryClient } from '@tanstack/react-query';
import { schedulesAPI, GetSessionsParams } from '@/api/schedulesAPI';
import { localDB } from '@/lib/storage/db';
import { Session, SessionStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useState, useCallback, useMemo } from 'react';

const ONE_HOUR_MS = 60 * 60 * 1000;

export function useAllSchedules(params: GetSessionsParams = {}) {
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';
  const [isOffline, setIsOffline] = useState(false);

  const queryKey = useMemo(
    () => ['scoped_sessions', userId, params.startDate ?? 'all', params.endDate ?? 'all', params.courseId ?? 'all', params.status ?? 'all'],
    [userId, params.startDate, params.endDate, params.courseId, params.status]
  );

  const query = useQuery<Session[]>({
    queryKey,
    queryFn: async () => {
      // 1. Check local SQLite cache first
      const cachedSessions = await localDB.getSessions();
      const lastSync = await localDB.getLastSessionsSyncTime();
      const isFresh = Boolean(
        cachedSessions &&
        cachedSessions.length > 0 &&
        lastSync &&
        Date.now() - lastSync < ONE_HOUR_MS
      );

      // If cache is fresh and no explicit filter override is requested, serve from SQLite instantly
      if (isFresh && cachedSessions && Object.keys(params).length === 0) {
        setIsOffline(false);
        return cachedSessions;
      }

      // 2. Otherwise fetch live data from backend
      try {
        const liveSessions = await schedulesAPI.getSessions(params);
        if (Object.keys(params).length === 0) {
          await localDB.saveSessions(liveSessions);
        }
        setIsOffline(false);
        return liveSessions;
      } catch (err) {
        console.warn('[useAllSchedules] Network fetch failed, checking SQLite cache:', err);
        if (cachedSessions && cachedSessions.length > 0) {
          setIsOffline(true);
          return cachedSessions;
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
      const liveSessions = await schedulesAPI.getSessions(params);
      if (Object.keys(params).length === 0) {
        await localDB.saveSessions(liveSessions);
      }
      setIsOffline(false);
      return query.refetch();
    } catch (err) {
      console.warn('[useAllSchedules] Force refresh failed, falling back to cache:', err);
      const cachedSessions = await localDB.getSessions();
      if (cachedSessions && cachedSessions.length > 0) {
        setIsOffline(true);
      }
      return query.refetch();
    }
  }, [params, query]);

  return {
    sessions: query.data ?? [],
    allSessions: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    error: query.error,
    isOffline,
    refetch: forceRefetch,
  };
}

export function useTodaySessions(
  selectedDate: string,
  statusFilter: SessionStatus | 'all' = 'all',
  options: { canViewPast?: boolean } = {}
) {
  const { canViewPast = false } = options;
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Reads from the centralized scoped schedules store backed by SQLite with 1-hour freshness
  const {
    allSessions,
    isLoading,
    isRefreshing,
    isError,
    error,
    isOffline,
    refetch,
  } = useAllSchedules();

  // Purely local in-memory/SQLite filtering when date or status chips change (0ms latency, NO network calls)
  const filteredSessions = useMemo(() => {
    return (allSessions ?? [])
      .filter((s) => {
        if (!canViewPast && s.date < todayDateStr) {
          return false;
        }
        if (s.date < selectedDate) {
          return false;
        }
        if (statusFilter === 'all') return true;
        return s.status === statusFilter;
      })
      .slice(0, 10);
  }, [allSessions, selectedDate, statusFilter, canViewPast, todayDateStr]);

  return {
    sessions: filteredSessions,
    allSessions: allSessions ?? [],
    isLoading,
    isRefreshing,
    isError,
    error,
    isOffline,
    refetch,
  };
}

export function useSessionDetail(sessionId: string) {
  const [isOffline, setIsOffline] = useState(false);

  const query = useQuery<Session>({
    queryKey: ['session_detail', sessionId],
    queryFn: async () => {
      // 1. Instantly check local SQLite storage
      const cached = await localDB.getSessionById(sessionId);
      if (cached) {
        setIsOffline(false);
        return cached;
      }

      // 2. Fetch from backend if not found locally
      try {
        const detail = await schedulesAPI.getSessionDetail(sessionId);
        await localDB.setCache(`session_detail_${sessionId}`, detail);
        setIsOffline(false);
        return detail;
      } catch (err) {
        console.warn(`[useSessionDetail] Fetch failed for ${sessionId}, checking SQLite cache:`, err);
        if (cached) {
          setIsOffline(true);
          return cached;
        }
        throw err;
      }
    },
    enabled: Boolean(sessionId),
    staleTime: ONE_HOUR_MS,
  });

  return {
    session: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isOffline,
    refetch: query.refetch,
  };
}
