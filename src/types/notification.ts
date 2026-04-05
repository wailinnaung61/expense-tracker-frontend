export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationSummary {
  unreadCount: number;
  recentNotifications: NotificationDto[];
}

export interface PagedNotificationResult {
  items: NotificationDto[];
  totalCount: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}

export interface NotificationFilters {
  isRead?: boolean;
  pageSize?: number;
  cursor?: string;
}
