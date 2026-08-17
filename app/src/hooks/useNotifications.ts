import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '@/api/notificationsAPI';
import { localDB } from '@/lib/storage/db';
import { Notification } from '@/types';
import { useState } from 'react';

const NOTIFICATIONS_CACHE_KEY = 'notifications_inbox_cache';

export function useNotificationsInbox() {
  const [isOffline, setIsOffline] = useState(false);

  const query = useQuery<Notification[]>({
    queryKey: ['notifications', 'inbox'],
    queryFn: async () => {
      try {
        const liveList = await notificationsAPI.getInbox();
        await localDB.setCache(NOTIFICATIONS_CACHE_KEY, liveList);
        setIsOffline(false);
        return liveList;
      } catch (err) {
        console.warn('[useNotificationsInbox] Fetch failed, loading SQLite cache:', err);
        const cached = await localDB.getCache<Notification[]>(NOTIFICATIONS_CACHE_KEY);
        if (cached) {
          setIsOffline(true);
          return cached;
        }
        throw err;
      }
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30s in background
  });

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    isOffline,
    refetch: query.refetch,
  };
}

export function useUnreadNotificationCount() {
  const query = useQuery<number>({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      return await notificationsAPI.getUnreadCount();
    },
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: 1000 * 15, // Poll unread count every 15 seconds for live badge updates
  });

  return query.data ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await notificationsAPI.markRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await notificationsAPI.markAllRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
