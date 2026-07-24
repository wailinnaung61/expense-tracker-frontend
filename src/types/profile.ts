import { z } from 'zod'

export interface NotificationPreferences {
  budgetAlerts: boolean
  recurringPayments: boolean
  autoPayments: boolean
  savingGoals: boolean
  largeTransactions: boolean
  paymentFailures: boolean
  exports: boolean
}

export type ProfileAvatarSource = "preset" | "upload"

export interface ProfileAvatar {
  source: ProfileAvatarSource | string
  presetId: string | null
  url: string
}

export interface AvatarPreset {
  id: string
  label: string
  accentColor: string
  url: string
}

export interface ProfileResponse {
  userId: string
  userName: string
  email: string
  phoneNumber: string | null
  currency: string
  locale: string
  dailyLimit: number
  roleId: string
  status: string
  mfaEnabled: boolean
  mfaMethod: string | null
  /** Master opt-in for SMTP email channel (also on GET/PUT /api/email-settings). */
  notifyEmailEnabled: boolean
  notificationPreferences: NotificationPreferences
  avatar?: ProfileAvatar | null
  createdAt: string
  updatedAt: string | null
  lastLoginAt: string | null
}

export interface UpdateProfileRequest {
  phoneNumber?: string | null
  currency?: string
  locale?: string
  dailyLimit?: number
  notifyEmailEnabled?: boolean
  notificationPreferences?: NotificationPreferences
  /** Optional: set cartoon preset while saving profile settings. */
  avatarPresetId?: string
}

export interface SelectAvatarPresetRequest {
  presetId: string
}

// Supported currencies from backend
export const SUPPORTED_CURRENCIES = [
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
] as const

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code']

// Supported locales for notifications
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'my', name: 'မြန်မာ (Myanmar)' },
] as const

export type LocaleCode = typeof SUPPORTED_LOCALES[number]['code']

// Validation schema for profile update form
export const updateProfileSchema = z.object({
  phoneNumber: z.string().optional().nullable(),
  currency: z.enum(['JPY', 'USD', 'EUR', 'GBP', 'SGD', 'THB', 'MMK']),
  locale: z.enum(['en', 'ja', 'my']),
  dailyLimit: z.number().min(0, 'Daily limit cannot be negative'),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
