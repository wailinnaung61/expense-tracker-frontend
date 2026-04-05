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

export interface ProfileResponse {
  userId: string
  userName: string
  email: string
  phoneNumber: string | null
  currency: string
  dailyLimit: number
  roleId: string
  status: string
  mfaEnabled: boolean
  mfaMethod: string | null
  notificationPreferences: NotificationPreferences
  createdAt: string
  updatedAt: string | null
  lastLoginAt: string | null
}

export interface UpdateProfileRequest {
  phoneNumber?: string | null
  currency?: string
  dailyLimit?: number
  notificationPreferences?: NotificationPreferences
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

// Validation schema for profile update form
export const updateProfileSchema = z.object({
  phoneNumber: z.string().optional().nullable(),
  currency: z.enum(['JPY', 'USD', 'EUR', 'GBP', 'SGD', 'THB', 'MMK']),
  dailyLimit: z.number().min(0, 'Daily limit cannot be negative'),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
