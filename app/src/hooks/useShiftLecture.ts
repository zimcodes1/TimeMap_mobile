import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venuesAPI, VenueItem, VenueAvailabilityResponse } from '@/api/venuesAPI';
import { schedulesAPI } from '@/api/schedulesAPI';
import { discrepanciesAPI, CreateDiscrepancyPayload } from '@/api/discrepanciesAPI';
import { localDB } from '@/lib/storage/db';
import { Session } from '@/types';

/**
 * Hook to fetch venues within a course's scope (or user's scope).
 */
export function useVenues(courseId?: string) {
  return useQuery<VenueItem[]>({
    queryKey: ['venues', courseId ?? 'all'],
    queryFn: () => venuesAPI.getVenues({ courseId }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch live venue availability (free time slots) for a given date or weekday.
 */
export function useVenueAvailability(
  venueId?: string,
  dateOrOptions?: string | { date?: string; weekday?: string },
  excludeSessionId?: string
) {
  const date = typeof dateOrOptions === 'string' ? dateOrOptions : dateOrOptions?.date;
  const weekday = typeof dateOrOptions === 'object' ? dateOrOptions?.weekday : undefined;

  return useQuery<VenueAvailabilityResponse>({
    queryKey: ['venue_availability', venueId, date, weekday, excludeSessionId],
    queryFn: () => {
      if (!venueId || (!date && !weekday)) {
        throw new Error('venueId and either date or weekday are required');
      }
      return venuesAPI.getVenueAvailability(venueId, { date, weekday, excludeSessionId });
    },
    enabled: Boolean(venueId && (date || weekday)),
    staleTime: 30 * 1000, // 30 seconds fresh
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to shift a single session instance.
 */
export function useShiftSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: {
        venue?: string | number;
        session_date?: string;
        session_start_time?: string;
        session_end_time?: string;
      };
    }) => {
      const updated = await schedulesAPI.shiftSession(sessionId, payload);
      await localDB.updateSessionInCache(updated);
      return updated;
    },
    onSuccess: (updatedSession: Session) => {
      // Invalidate queries so lists update
      queryClient.invalidateQueries({ queryKey: ['scoped_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session_detail', updatedSession.id] });
      queryClient.setQueryData(['session_detail', updatedSession.id], updatedSession);
    },
  });
}

/**
 * Hook to cancel a single session instance.
 */
export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      reason,
    }: {
      sessionId: string;
      reason?: string;
    }) => {
      const updated = await schedulesAPI.cancelSession(sessionId, reason);
      await localDB.cancelSessionInCache(sessionId);
      return updated;
    },
    onSuccess: (updatedSession: Session) => {
      queryClient.invalidateQueries({ queryKey: ['scoped_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session_detail', updatedSession.id] });
      queryClient.setQueryData(['session_detail', updatedSession.id], updatedSession);
    },
  });
}

/**
 * Hook to submit a recurrent discrepancy request for admin approval.
 */
export function useSubmitDiscrepancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDiscrepancyPayload) => {
      return discrepanciesAPI.submitDiscrepancy(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoped_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['discrepancies'] });
    },
  });
}
