import { apiClient } from '@/lib/api';
import type { 
  NotificationSummary, 
  PagedNotificationResult,
  NotificationFilters 
} from '@/types/notification';

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
    return await apiClient.get<number>('/api/notifications/unread-count');
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
