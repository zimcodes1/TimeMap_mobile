import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { schedulesAPI } from '@/api/schedulesAPI';
import { localDB } from '@/lib/storage/db';
import { AcademicSession, Semester } from '@/types';
import { useAuth } from '@/context/AuthContext';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function useAcademicSessions() {
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const query = useQuery<AcademicSession[]>({
    queryKey: ['academic_sessions', userId],
    queryFn: async () => {
      // 1. Try local SQLite cache
      const cached = await localDB.getAcademicSessions();
      if (cached && cached.length > 0) {
        // Also fetch live in background or return cached if fresh
        schedulesAPI
          .getAcademicSessions()
          .then((live) => {
            if (live && live.length > 0) {
              localDB.saveAcademicSessions(live);
            }
          })
          .catch((err) => {
            console.warn('[useAcademicSessions] Background refresh error:', err);
          });
        return cached;
      }

      // 2. Fetch live data
      try {
        const live = await schedulesAPI.getAcademicSessions();
        if (live && live.length > 0) {
          await localDB.saveAcademicSessions(live);
        }
        return live;
      } catch (err) {
        console.warn('[useAcademicSessions] Network fetch failed, checking SQLite cache:', err);
        if (cached && cached.length > 0) {
          return cached;
        }
        throw err;
      }
    },
    enabled: Boolean(user?.id),
    staleTime: ONE_DAY_MS,
    gcTime: 7 * ONE_DAY_MS,
  });

  const sessions = useMemo(() => query.data ?? [], [query.data]);

  // Determine current active academic session
  const currentSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions.find((s) => s.isCurrent) || sessions[0];
  }, [sessions]);

  // Selected session (defaults to current active session)
  const selectedSession = useMemo(() => {
    if (!selectedSessionId) return currentSession;
    return sessions.find((s) => s.id === selectedSessionId) || currentSession;
  }, [selectedSessionId, sessions, currentSession]);

  const selectSession = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
  }, []);

  return {
    sessions,
    currentSession,
    selectedSession,
    selectSession,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useActiveSemester() {
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';

  const query = useQuery<Semester | null>({
    queryKey: ['active_semester', userId],
    queryFn: async () => {
      const cached = await localDB.getActiveSemester();
      if (cached) {
        schedulesAPI
          .getActiveSemester()
          .then((live) => {
            if (live) localDB.saveActiveSemester(live);
          })
          .catch((e) => console.warn('[useActiveSemester] Background fetch failed:', e));
        return cached;
      }
      try {
        const live = await schedulesAPI.getActiveSemester();
        if (live) {
          await localDB.saveActiveSemester(live);
        }
        return live;
      } catch (err) {
        console.warn('[useActiveSemester] Fetch failed:', err);
        return cached ?? null;
      }
    },
    enabled: Boolean(user?.id),
    staleTime: ONE_DAY_MS,
    gcTime: 7 * ONE_DAY_MS,
  });

  return {
    activeSemester: query.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

