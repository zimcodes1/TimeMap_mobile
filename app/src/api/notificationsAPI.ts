import { apiClient } from './apiClient';
import { Notification, NotificationType } from '@/types';

export function mapBackendToNotification(raw: any): Notification {
  return {
    id: String(raw.id),
    type: (raw.notification_type as NotificationType) || 'general',
    title: raw.title || 'Notification',
    body: raw.body || '',
    isRead: Boolean(raw.is_read || raw.read_at),
    createdAt: raw.created_at || new Date().toISOString(),
    relatedModel: raw.related_model,
    relatedId: raw.related_id ? String(raw.related_id) : undefined,
  };
}

export const notificationsAPI = {
  /**
   * Fetch notification inbox items from GET /api/notifications/inbox/
   */
  async getInbox(): Promise<Notification[]> {
    try {
      const rawList = await apiClient<any[]>('/notifications/inbox/', {
        method: 'GET',
      });

      if (Array.isArray(rawList)) {
        return rawList.map(mapBackendToNotification);
      }
      return [];
    } catch (error) {
      console.warn('[notificationsAPI] Failed to fetch inbox:', error);
      throw error;
    }
  },

  /**
   * Fetch unread notification count from GET /api/notifications/inbox/unread-count/
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient<{ unread_count?: number; count?: number }>('/notifications/inbox/unread-count/', {
        method: 'GET',
      });
      return res.unread_count ?? res.count ?? 0;
    } catch (error) {
      console.warn('[notificationsAPI] Failed to fetch unread count:', error);
      return 0;
    }
  },

  /**
   * Mark single notification read via POST /api/notifications/inbox/{id}/read/
   */
  async markRead(id: string): Promise<void> {
    try {
      await apiClient(`/notifications/inbox/${id}/read/`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn(`[notificationsAPI] Failed to mark read ${id}:`, error);
    }
  },

  /**
   * Mark all notifications read via POST /api/notifications/inbox/mark-all-read/
   */
  async markAllRead(): Promise<void> {
    try {
      await apiClient('/notifications/inbox/mark-all-read/', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('[notificationsAPI] Failed to mark all read:', error);
    }
  },

  /**
   * Register device token for push notifications POST /api/notifications/devices/
   */
  async registerDeviceToken(fcmToken: string, platform: 'android' | 'ios' | 'web'): Promise<void> {
    try {
      await apiClient('/notifications/devices/', {
        method: 'POST',
        body: JSON.stringify({ fcm_token: fcmToken, platform }),
      });
    } catch (error) {
      console.warn('[notificationsAPI] Device registration error:', error);
    }
  },

  /**
   * Deactivate device token POST /api/notifications/devices/deactivate/
   */
  async deactivateDeviceToken(fcmToken: string): Promise<void> {
    try {
      await apiClient('/notifications/devices/deactivate/', {
        method: 'POST',
        body: JSON.stringify({ fcm_token: fcmToken }),
      });
    } catch (error) {
      console.warn('[notificationsAPI] Device deactivation error:', error);
    }
  },
};
