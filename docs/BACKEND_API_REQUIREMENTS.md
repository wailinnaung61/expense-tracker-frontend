# Backend API Requirements for Settings Features

## Overview

The frontend settings have been developed with full localization support (English, Myanmar, Japanese). The following APIs are needed to complete the notification preferences feature.

## Current Implementation Status

### ✅ Fully Implemented (Frontend + Backend)

1. **Profile Settings** (`/api/Profile`)
   - GET - Get user profile
   - PUT - Update profile (phoneNumber, currency, dailyLimit)

2. **Security Settings** (MFA)
   - Already implemented with existing auth endpoints
   - GET `/api/auth/mfa-status` - Get MFA status
   - POST `/api/auth/setup-mfa` - Setup MFA
   - POST `/api/auth/disable-mfa` - Disable MFA

3. **Appearance Settings** ✨
   - **Theme Selector**: Light/Dark/System (using next-themes + custom ThemeProvider)
   - **Animations Toggle**: Disables all animations when turned off
   - **Compact Mode**: Reduces spacing throughout the app for more content density
   - All settings saved to localStorage (no backend needed)

   **How it works:**
   - Theme changes apply immediately using existing theme system
   - Animations toggle adds/removes `reduce-motion` class to disable CSS animations
   - Compact mode adds `compact-mode` class to reduce padding and spacing by 25%
   - Settings persist across sessions via localStorage
   - Applied on page load automatically

### ⚠️ Needs Backend API

## Required API Endpoint: Notification Preferences

### 1. Get Notification Preferences

```http
GET /api/profile/notification-preferences
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "budgetAlerts": true,
  "savingsReminders": true,
  "billReminders": true,
  "weeklyDigest": false
}
```

**Response (404 Not Found):** Returns default preferences

```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "budgetAlerts": true,
  "savingsReminders": true,
  "billReminders": true,
  "weeklyDigest": false
}
```

---

### 2. Update Notification Preferences

```http
PUT /api/profile/notification-preferences
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "budgetAlerts": true,
  "savingsReminders": true,
  "billReminders": true,
  "weeklyDigest": false
}
```

**Response (200 OK):**

```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "budgetAlerts": true,
  "savingsReminders": true,
  "billReminders": true,
  "weeklyDigest": false,
  "updatedAt": "2026-04-05T10:30:00Z"
}
```

---

## Database Schema Suggestion

### Table: `notification_preferences`

```sql
CREATE TABLE notification_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  budget_alerts BOOLEAN DEFAULT true,
  savings_reminders BOOLEAN DEFAULT true,
  bill_reminders BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## Frontend Integration Notes

### Current Implementation

- The notification settings UI is fully built and functional
- Currently uses local state management
- Shows an info banner: "Note: Notification settings will be saved to your profile once the backend API is ready"
- Logs changes to console with `TODO: Save to backend` message

### Files to Update After Backend is Ready

**1. Create service file:** `src/services/notificationPreferencesService.ts`

```typescript
import { apiClient } from "@/lib/api";

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  budgetAlerts: boolean;
  savingsReminders: boolean;
  billReminders: boolean;
  weeklyDigest: boolean;
}

export const notificationPreferencesService = {
  async getPreferences(): Promise<NotificationPreferences> {
    return apiClient.request<NotificationPreferences>(
      "/api/profile/notification-preferences",
      { method: "GET" },
    );
  },

  async updatePreferences(
    preferences: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    return apiClient.request<NotificationPreferences>(
      "/api/profile/notification-preferences",
      {
        method: "PUT",
        body: JSON.stringify(preferences),
      },
    );
  },
};
```

**2. Update component:** `src/components/settings/notification-settings.tsx`

- Replace local state with API calls
- Load preferences from backend on mount
- Save changes to backend on toggle
- Add loading and error states
- Remove the API notice banner

---

## Testing Checklist

When backend API is ready, test:

- [ ] GET preferences returns default values for new users
- [ ] GET preferences returns saved values for existing users
- [ ] PUT preferences successfully updates all fields
- [ ] PUT preferences handles partial updates
- [ ] Authentication required (401 if not logged in)
- [ ] User can only access their own preferences
- [ ] All boolean fields accept true/false
- [ ] Invalid data returns 400 Bad Request
- [ ] CORS headers configured for frontend domain

---

## Settings Pages Structure

### Current Tabs:

1. **Profile** - Account details, currency, daily limit (✅ Working)
2. **Appearance** - Theme, animations, compact mode (✅ Working - localStorage)
3. **Notifications** - Email, push, alerts, reminders (⚠️ Needs API)
4. **Security** - MFA setup/disable (✅ Working)

### Translations Available:

- ✅ English (en)
- ✅ Myanmar (my)
- ✅ Japanese (ja)

---

## Contact

If you have questions about the frontend implementation or need clarification on any API requirements, please reach out.

**Frontend files:**

- `src/components/settings/notification-settings.tsx` - Main component
- `src/i18n/locales/*/translation.json` - Translations
- `src/components/settings/settings-tabs.tsx` - Tab navigation
