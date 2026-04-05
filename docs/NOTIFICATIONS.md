# Notification System

A comprehensive notification system integrated into the expense tracker frontend application.

## Features

### 🔔 Bell Icon in Header

- Real-time unread badge count
- Dropdown showing 5 most recent notifications
- Auto-refresh every 30 seconds
- Click notification to navigate to related page
- Mark individual or all notifications as read
- Delete notifications

### 📄 Full Notifications Page

- View all notifications with pagination
- Filter by: All / Unread / Read
- Mark all as read
- Clear all read notifications
- Delete individual notifications
- Automatic navigation to related resources

## API Endpoints

| Method | Endpoint                                       | Purpose                               |
| ------ | ---------------------------------------------- | ------------------------------------- |
| GET    | `/api/notifications/summary`                   | Unread count + 5 latest notifications |
| GET    | `/api/notifications/unread-count`              | Just the badge number for polling     |
| GET    | `/api/notifications?isRead=&pageSize=&cursor=` | Full list with pagination             |
| PATCH  | `/api/notifications/{id}/read`                 | Mark one as read                      |
| PATCH  | `/api/notifications/read-all`                  | Mark all as read                      |
| DELETE | `/api/notifications/{id}`                      | Delete one notification               |
| DELETE | `/api/notifications/read`                      | Delete all read notifications         |

## File Structure

```
src/
├── types/
│   └── notification.ts              # TypeScript types
├── services/
│   └── notificationService.ts       # API service methods
├── components/
│   └── notifications/
│       └── NotificationBell.tsx     # Header bell component
├── pages/
│   └── notifications/
│       └── NotificationsPage.tsx    # Full notifications page
└── router.tsx                       # Route: /notifications
```

## Components

### NotificationBell Component

Located at `src/components/notifications/NotificationBell.tsx`

**Features:**

- Displays bell icon with unread count badge
- Polls for unread count every 30 seconds
- Dropdown with 5 most recent notifications
- Click to mark as read and navigate
- "Mark all read" button
- "View all notifications" link

**Usage:**

```tsx
import { NotificationBell } from "@/components/notifications/NotificationBell";

<NotificationBell />;
```

Already integrated into:

- `HorizontalHeader` component
- `VerticalHeader` component

### NotificationsPage Component

Located at `src/pages/notifications/NotificationsPage.tsx`

**Features:**

- Paginated list of all notifications
- Filter dropdown (All/Unread/Read)
- Mark all as read
- Clear all read notifications
- Mark individual as read
- Delete individual notifications
- Load more button for pagination

**Route:** `/notifications`

## Notification Navigation

When clicking a notification, it automatically navigates to the related resource based on `referenceType`:

| Reference Type | Navigation Route |
| -------------- | ---------------- |
| `budget`       | `/budget`        |
| `saving`       | `/savings`       |
| `investment`   | `/investments`   |
| `transaction`  | `/transactions`  |
| `bill`         | `/transactions`  |

## TypeScript Types

```typescript
interface NotificationDto {
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

interface NotificationSummary {
  unreadCount: number;
  recentNotifications: NotificationDto[];
}

interface PagedNotificationResult {
  items: NotificationDto[];
  totalCount: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}
```

## Service Methods

All service methods are in `notificationService.ts`:

```typescript
// Get summary for bell dropdown
await notificationService.getSummary();

// Get just unread count (for polling)
await notificationService.getUnreadCount();

// Get paginated notifications
await notificationService.getNotifications({
  isRead: false,
  pageSize: 20,
});

// Mark one as read
await notificationService.markAsRead(notificationId);

// Mark all as read
await notificationService.markAllAsRead();

// Delete one notification
await notificationService.deleteNotification(notificationId);

// Delete all read notifications
await notificationService.deleteAllRead();
```

## Customization

### Notification Icons

To customize icons based on notification type, edit the `getNotificationIcon()` function in both components:

```typescript
const getNotificationIcon = () => {
  // Customize based on notification type
  // Example:
  // switch (type) {
  //   case 'budget': return <DollarSign className="h-4 w-4" />;
  //   case 'saving': return <PiggyBank className="h-4 w-4" />;
  //   default: return <Bell className="h-4 w-4" />;
  // }
  return <Bell className="h-4 w-4" />;
};
```

### Polling Interval

To change the polling interval (default 30 seconds), edit the constant in `NotificationBell.tsx`:

```typescript
const POLL_INTERVAL = 30000; // milliseconds
```

### Page Size

To change the default page size for the notifications page (default 20), edit the state in `NotificationsPage.tsx`:

```typescript
const [pageSize] = useState(20);
```

## Toast Notifications

The system uses `react-toastify` for toast notifications. Success and error messages are shown for:

- Marking as read
- Marking all as read
- Deleting notifications
- Clearing read notifications
- API errors

## Styling

The components use Tailwind CSS classes and follow the existing design system:

- Uses `bg-destructive` for unread badge
- Uses `bg-accent` for unread notification backgrounds
- Uses `border-l-4 border-l-primary` for unread notification indicator
- Responsive design with proper mobile support

## Future Enhancements

Possible improvements:

- Real-time notifications using WebSockets/SignalR
- Sound/desktop notifications
- Notification preferences/settings
- Different notification types with custom icons
- Rich notification content (images, actions)
- Notification grouping
- Mark as unread functionality
