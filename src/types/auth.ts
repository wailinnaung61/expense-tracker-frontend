import { z } from 'zod'

// API Response Types
export interface LoginResponse {
  requiresMfa: boolean
  tokens: {
    accessToken: string
    idToken: string
    refreshToken: string
    expiresIn: number
    tokenType: string
  }
  mfaChallenge: string | null
}

export interface UserMenu {
  key: string
  label: string
  path: string
}

export interface User {
  userId: string
  userName: string
  email: string
  phoneNumber: string
  cognitoUserId: string
  cognitoUserName: string
  userPoolId: string
  mfaEnabled: boolean
  roleId: string
  status: string
  dailyLimit: number
  currency: string
  menus: UserMenu[]
}

export interface VerifyTotpResponse {
  tokens: {
    accessToken: string
    idToken: string
    refreshToken: string
    expiresIn: number
    tokenType: string
  }
}

// Form Validation Schemas
export const signInSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
})

export const signUpSchema = z.object({
  userName: z.string().min(2, 'User Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Use a number")
  .regex(/[a-z]/, "Use a lowercase letter")
  .regex(/[A-Z]/, "Use an uppercase letter")
  .regex(/[^A-Za-z0-9]/, "Use a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const confirmSignUpSchema = z.object({
  code: z.string().length(6, 'Confirmation code must be 6 digits'),
})

export const totpSchema = z.object({
  code: z.string().length(6, 'TOTP code must be 6 digits'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  code: z.string().length(6, 'Confirmation code must be 6 digits'),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Use a number")
  .regex(/[a-z]/, "Use a lowercase letter")
  .regex(/[A-Z]/, "Use an uppercase letter")
  .regex(/[^A-Za-z0-9]/, "Use a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Use a number")
  .regex(/[a-z]/, "Use a lowercase letter")
  .regex(/[A-Z]/, "Use an uppercase letter")
  .regex(/[^A-Za-z0-9]/, "Use a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type TotpFormData = z.infer<typeof totpSchema>
export type ConfirmSignUpFormData = z.infer<typeof confirmSignUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
