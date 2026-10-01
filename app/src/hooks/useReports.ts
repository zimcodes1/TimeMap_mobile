import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportingAPI, SubmitReportPayload, RespondReportPayload } from '@/api/reportingAPI';
import { isSessionReportWindowOpen } from '@/api/schedulesAPI';
import { localDB } from '@/lib/storage/db';
import { Report, Session } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useAllSchedules } from '@/hooks/useSchedules';
import { useState, useMemo } from 'react';

const REPORTS_CACHE_KEY = 'reports_list_cache';

export function useReports() {
  const [isOffline, setIsOffline] = useState(false);

  const query = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      try {
        const liveReports = await reportingAPI.getReports();
        await localDB.setCache(REPORTS_CACHE_KEY, liveReports);
        setIsOffline(false);
        return liveReports;
      } catch (err) {
        console.warn('[useReports] Fetch failed, loading SQLite cache:', err);
        const cached = await localDB.getCache<Report[]>(REPORTS_CACHE_KEY);
        if (cached && cached.length > 0) {
          setIsOffline(true);
          return cached;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    reports: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    error: query.error,
    isOffline,
    refetch: query.refetch,
  };
}

export function useToReportCount(): number {
  const { user } = useAuth();
  const isClassRep = Boolean(user?.isClassRep);
  const { allSessions } = useAllSchedules();

  return useMemo(() => {
    if (!isClassRep || !allSessions || allSessions.length === 0) return 0;
    return allSessions.filter((s) => isSessionReportWindowOpen(s) && !s.reportId).length;
  }, [isClassRep, allSessions]);
}

export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitReportPayload) => {
      return await reportingAPI.submitReport(payload);
    },
    onSuccess: async (report, variables) => {
      const sessionId = String(variables.lectureSession);
      const reportId = String(report.id);
      const held = variables.held;

      // 1. Mark session as reported in SQLite store
      await localDB.markSessionAsReported(sessionId, reportId, held);

      // 2. Optimistically update all session queries in React Query cache
      queryClient.setQueriesData<Session[]>(
        { queryKey: ['scoped_sessions'] },
        (old) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((s) => {
            if (String(s.id) === sessionId) {
              return {
                ...s,
                reportId,
                reportWindowOpen: false,
                status: (held ? 'held' : 'not_held') as Session['status'],
              };
            }
            return s;
          });
        }
      );

      queryClient.setQueryData<Session>(
        ['session_detail', sessionId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            reportId,
            reportWindowOpen: false,
            status: (held ? 'held' : 'not_held') as Session['status'],
          };
        }
      );

      // 3. Invalidate queries to ensure complete backend alignment
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['scoped_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session_detail'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['scoped_analytics'] });
    },
  });
}

export function useRespondReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RespondReportPayload) => {
      return await reportingAPI.respondToReport(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['scoped_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session_detail'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['scoped_analytics'] });
    },
  });
}
