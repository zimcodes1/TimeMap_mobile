import { useQuery } from '@tanstack/react-query';
import { schedulesAPI, GetSessionsParams } from '@/api/schedulesAPI';
import { localDB } from '@/lib/storage/db';
import { Session, SessionStatus } from '@/types';
import { useState } from 'react';

export function useTodaySessions(
  selectedDate: string,
  statusFilter: SessionStatus | 'all' = 'all',
  options: { canViewPast?: boolean } = {}
) {
  const { canViewPast = false } = options;
  const todayStr = new Date().toISOString().split('T')[0];
  const [isOffline, setIsOffline] = useState(false);
  const cacheKey = `today_sessions_from_${selectedDate}`;

  const query = useQuery<Session[]>({
    queryKey: ['sessions', 'from', selectedDate],
    queryFn: async () => {
      try {
        const liveSessions = await schedulesAPI.getSessions({ startDate: selectedDate });
        // Cache live data to local SQLite database
        await localDB.setCache(cacheKey, liveSessions);
        setIsOffline(false);
        return liveSessions;
      } catch (err) {
        console.warn('[useTodaySessions] Fetch failed, checking SQLite cache:', err);
        const cached = await localDB.getCache<Session[]>(cacheKey);
        if (cached && cached.length > 0) {
          setIsOffline(true);
          return cached;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
  });

  // Filter query result by status, role-based past date restriction, and cap at max 10 schedules
  const filteredSessions = (query.data ?? [])
    .filter((s) => {
      if (!canViewPast && s.date < todayStr) {
        return false;
      }
      if (statusFilter === 'all') return true;
      return s.status === statusFilter;
    })
    .slice(0, 10); // Max 10 schedules displayed on the today screen

  return {
    sessions: filteredSessions,
    allSessions: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    error: query.error,
    isOffline,
    refetch: query.refetch,
  };
}

export function useAllSchedules(params: GetSessionsParams = {}) {
  const [isOffline, setIsOffline] = useState(false);
  const cacheKey = `all_schedules_${params.startDate ?? 'all'}_${params.endDate ?? 'all'}_${params.courseId ?? 'all'}`;

  const query = useQuery<Session[]>({
    queryKey: ['sessions', 'all', params.startDate, params.endDate, params.courseId, params.status],
    queryFn: async () => {
      try {
        const liveSessions = await schedulesAPI.getSessions(params);
        await localDB.setCache(cacheKey, liveSessions);
        setIsOffline(false);
        return liveSessions;
      } catch (err) {
        console.warn('[useAllSchedules] Fetch failed, checking SQLite cache:', err);
        const cached = await localDB.getCache<Session[]>(cacheKey);
        if (cached && cached.length > 0) {
          setIsOffline(true);
          return cached;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    error: query.error,
    isOffline,
    refetch: query.refetch,
  };
}

export function useSessionDetail(sessionId: string) {
  const [isOffline, setIsOffline] = useState(false);
  const cacheKey = `session_detail_${sessionId}`;

  const query = useQuery<Session>({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      try {
        const detail = await schedulesAPI.getSessionDetail(sessionId);
        await localDB.setCache(cacheKey, detail);
        setIsOffline(false);
        return detail;
      } catch (err) {
        console.warn(`[useSessionDetail] Fetch failed for ${sessionId}, checking SQLite cache:`, err);
        const cached = await localDB.getCache<Session>(cacheKey);
        if (cached) {
          setIsOffline(true);
          return cached;
        }
        throw err;
      }
    },
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60 * 5,
  });

  return {
    session: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isOffline,
    refetch: query.refetch,
  };
}
