import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportingAPI, SubmitReportPayload, RespondReportPayload } from '@/api/reportingAPI';
import { localDB } from '@/lib/storage/db';
import { Report } from '@/types';
import { useState } from 'react';

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

export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitReportPayload) => {
      return await reportingAPI.submitReport(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
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
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
