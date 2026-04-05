import { Bell, Check, CheckCheck, Filter, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';
import { useTranslation } from '@/hooks/useTranslation';
import type { NotificationDto, PagedNotificationResult } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [result, setResult] = useState<PagedNotificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [pageSize] = useState(20);

  const loadNotifications = async (newCursor?: string, resetData = false) => {
    try {
      setLoading(true);
      const filters: { isRead?: boolean; pageSize: number; cursor?: string } = {
        pageSize,
      };

      if (filter === 'unread') filters.isRead = false;
      if (filter === 'read') filters.isRead = true;
      if (newCursor) filters.cursor = newCursor;

      const data = await notificationService.getNotifications(filters);

      if (resetData) {
        setResult(data);
      } else {
        // Append for pagination
        setResult((prev) =>
          prev
            ? {
                ...data,
                items: [...prev.items, ...data.items],
              }
            : data
        );
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error(t('notifications.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset and reload when filter changes
    loadNotifications(undefined, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleLoadMore = () => {
    if (result?.nextCursor) {
      loadNotifications(result.nextCursor, false);
    }
  };

  const handleNotificationClick = async (notification: NotificationDto) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
        // Update local state
        setResult((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((n) =>
                  n.id === notification.id ? { ...n, isRead: true } : n
                ),
              }
            : null
        );
      }

      // Navigate based on reference type
      if (notification.referenceType && notification.referenceId) {
        const routeMap: Record<string, string> = {
          budget: `/budget`,
          saving: `/savings`,
          investment: `/investments`,
          transaction: `/transactions`,
          bill: `/transactions`,
        };
        const route = routeMap[notification.referenceType.toLowerCase()];
        if (route) {
          navigate(route);
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error(t('notifications.error.updateFailed'));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update all items to read
      setResult((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((n) => ({ ...n, isRead: true })),
            }
          : null
      );
      toast.success(t('notifications.success.allMarkedAsRead'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error(t('notifications.error.markAllReadFailed'));
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      // Remove from local state
      setResult((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((n) => n.id !== notificationId),
              totalCount: prev.totalCount - 1,
            }
          : null
      );
      toast.success(t('notifications.success.deleted'));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error(t('notifications.error.deleteFailed'));
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationService.deleteAllRead();
      // Remove all read items from local state
      setResult((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((n) => !n.isRead),
              totalCount: prev.items.filter((n) => !n.isRead).length,
            }
          : null
      );
      toast.success(t('notifications.success.clearedRead'));
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
      toast.error(t('notifications.error.clearReadFailed'));
    }
  };

  const handleMarkAsRead = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setResult((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((n) =>
                n.id === notificationId ? { ...n, isRead: true } : n
              ),
            }
          : null
      );
      toast.success(t('notifications.success.markedAsRead'));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error(t('notifications.error.markAsReadFailed'));
    }
  };

  const getNotificationIcon = () => {
    // Customize based on notification type
    return <Bell className="h-5 w-5" />;
  };

  const unreadCount = result?.items.filter((n) => !n.isRead).length || 0;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('notifications.title')}</h1>
          <p className="text-muted-foreground">
            {result ? `${result.totalCount} ${t('notifications.total')}` : t('notifications.loading')}
            {unreadCount > 0 && ` • ${unreadCount} ${t('notifications.unread')}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              {t('notifications.markAllRead')}
            </Button>
          )}
          {result && result.items.some((n) => n.isRead) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRead}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('notifications.clearRead')}
            </Button>
          )}
        </div>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder={t('notifications.filter.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('notifications.filter.all')}</SelectItem>
              <SelectItem value="unread">{t('notifications.filter.unread')}</SelectItem>
              <SelectItem value="read">{t('notifications.filter.read')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading && !result ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </Card>
          ))
        ) : !result || result.items.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">{t('notifications.noNotifications')}</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread'
                  ? t('notifications.allCaughtUp')
                  : filter === 'read'
                  ? t('notifications.noReadNotifications')
                  : t('notifications.noNotificationsDesc')}
              </p>
            </div>
          </Card>
        ) : (
          <>
            {result.items.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  'group cursor-pointer p-4 transition-colors hover:bg-accent/50',
                  !notification.isRead && 'border-l-4 border-l-primary bg-accent/30'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      notification.isRead ? "bg-muted" : "bg-primary/10"
                    )}>
                      {getNotificationIcon()}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            title={t('notifications.markAsRead')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          title={t('notifications.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {!notification.isRead && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-primary">{t('notifications.new')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Load More */}
            {result.hasNextPage && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? t('notifications.loading') : t('notifications.loadMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
