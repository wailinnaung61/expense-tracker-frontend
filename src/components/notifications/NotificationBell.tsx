import { Bell, CheckCheck, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';
import { useTranslation } from '@/hooks/useTranslation';
import type { NotificationDto, NotificationSummary } from '@/types/notification';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { ScrollArea } from '@/components/ui/scroll-area';

const POLL_INTERVAL = 180000; // 3 minutes

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load summary when dropdown opens
  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getSummary();
      setSummary(data);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error(t('notifications.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for unread count
  useEffect(() => {
    const pollUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to poll unread count:', error);
      }
    };

    // Initial load - use summary to get count
    loadSummary();

    // Set up polling for just the count (lighter endpoint)
    const interval = setInterval(pollUnreadCount, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [loadSummary]);

  // Load summary when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadSummary();
    }
  }, [isOpen, loadSummary]);

  const handleNotificationClick = async (notification: NotificationDto) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
        // Update local state
        setUnreadCount((prev) => Math.max(0, prev - 1));
        if (summary) {
          setSummary({
            ...summary,
            unreadCount: Math.max(0, summary.unreadCount - 1),
            recentNotifications: summary.recentNotifications.map((n) =>
              n.id === notification.id ? { ...n, isRead: true } : n
            ),
          });
        }
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
          setIsOpen(false);
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
      setUnreadCount(0);
      if (summary) {
        setSummary({
          unreadCount: 0,
          recentNotifications: summary.recentNotifications.map((n) => ({
            ...n,
            isRead: true,
          })),
        });
      }
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
      // Reload summary
      await loadSummary();
      toast.success(t('notifications.success.deleted'));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error(t('notifications.error.deleteFailed'));
    }
  };

  const getNotificationIcon = () => {
    // Customize based on notification type
    return <Bell className="h-4 w-4" />;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <div className="flex items-center justify-between px-2 py-2">
          <h3 className="font-semibold">{t('notifications.title')}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              {t('notifications.loading')}
            </div>
          ) : !summary || summary.recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t('notifications.noNotifications')}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {summary.recentNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 px-3 py-3',
                    !notification.isRead && 'bg-accent/50'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="shrink-0 pt-0.5">
                    {getNotificationIcon()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {summary && summary.recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="sticky bottom-0 bg-popover p-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-sm font-medium bg-muted hover:bg-accent"
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
              >
                {t('notifications.viewAll')}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
