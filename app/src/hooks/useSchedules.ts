import { useQuery, useQueryClient } from '@tanstack/react-query';
import { schedulesAPI } from '@/api/schedulesAPI';
import { localDB } from '@/lib/storage/db';
import { Session, SessionStatus } from '@/types';
import { useEffect, useState } from 'react';

export function useTodaySessions(selectedDate: string, statusFilter: SessionStatus | 'all' = 'all') {
  const queryClient = useQueryClient();
  const [isOffline, setIsOffline] = useState(false);
  const cacheKey = `today_sessions_${selectedDate}`;

  const query = useQuery<Session[]>({
    queryKey: ['sessions', selectedDate],
    queryFn: async () => {
      try {
        const liveSessions = await schedulesAPI.getSessions({ date: selectedDate });
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

  // Filter query result by status if needed
  const filteredSessions = (query.data ?? []).filter((s) => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

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
