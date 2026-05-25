import { apiClient } from '@/lib/api';
import type { 
  NotificationSummary, 
  PagedNotificationResult,
  NotificationFilters 
} from '@/types/notification';

/** API may return a bare number or a wrapped object. */
export function normalizeUnreadCount(data: unknown): number {
  if (typeof data === 'number' && Number.isFinite(data)) {
    return Math.max(0, Math.floor(data));
  }
  if (typeof data === 'string' && data.trim() !== '') {
    const n = Number(data);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['unreadCount', 'count', 'value'] as const) {
      if (key in obj) {
        return normalizeUnreadCount(obj[key]);
      }
    }
  }
  return 0;
}

export const notificationService = {
  /**
   * Get notification summary (unread count + 5 latest)
   * Used for bell icon dropdown
   */
  getSummary: async (): Promise<NotificationSummary> => {
    return await apiClient.get<NotificationSummary>('/api/notifications/summary');
  },

  /**
   * Get just the unread count
   * Used for badge polling
   */
  getUnreadCount: async (): Promise<number> => {
    const data = await apiClient.get<unknown>('/api/notifications/unread-count');
    return normalizeUnreadCount(data);
  },

  /**
   * Get paginated notifications
   * Used for full notification page
   */
  getNotifications: async (filters?: NotificationFilters): Promise<PagedNotificationResult> => {
    const params = new URLSearchParams();
    
    if (filters?.isRead !== undefined) {
      params.append('isRead', String(filters.isRead));
    }
    if (filters?.pageSize) {
      params.append('pageSize', String(filters.pageSize));
    }
    if (filters?.cursor) {
      params.append('cursor', filters.cursor);
    }

    return await apiClient.get<PagedNotificationResult>(
      `/api/notifications?${params.toString()}`
    );
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.request(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.request('/api/notifications/read-all', { method: 'PATCH' });
  },

  /**
   * Delete a single notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/notifications/${id}`);
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async (): Promise<void> => {
    await apiClient.delete('/api/notifications/read');
  },
};
