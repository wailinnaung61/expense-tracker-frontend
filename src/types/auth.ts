import { z } from 'zod'

// ============================================================================
// Backend-Aligned API Types
// ============================================================================

// Token Types
export interface TokenResponse {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

// Sign Up
export interface UserSignUpRequest {
  username: string
  email: string
  password: string
}

export interface UserSignUpResponse {
  message: string
  userSub?: string
}

// Resend Confirmation
export interface ResendConfirmationRequest {
  username: string
}

// Confirm Sign Up
export interface UserConfirmSignUpRequest {
  username: string
  confirmationCode: string
}

// Sign In
export interface UserSignInRequest {
  usernameOrEmail: string
  password: string
}

export interface MfaChallenge {
  session: string
  username: string
  challengeName: string
}

export interface AuthSignInResult {
  requiresMfa: boolean
  tokens?: TokenResponse
  mfaChallenge?: MfaChallenge
}

export interface UserSignInResponse {
  tokens: TokenResponse
}

// Refresh Token
export interface UserRefreshTokenWithUsernameRequest {
  refreshToken: string
  username: string
}

// Forgot Password
export interface UserForgotPasswordRequest {
  usernameOrEmail: string
}

// Reset Password
export interface UserResetPasswordRequest {
  usernameOrEmail: string
  confirmationCode: string
  newPassword: string
}

// Change Password (matches backend UserChangePasswordRequest)
export interface UserChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// User Profile
export interface UserMenu {
  key: string
  label: string
  path: string
}

export interface CognitoUser {
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
  /** From profile avatar.url — used in header/sidebar. */
  avatarUrl?: string | null
}

export interface UpdateProfileRequest {
  userName: string
  email: string
}

// Email Verification
export interface ConfirmEmailChangeRequest {
  confirmationCode: string
}

// MFA Types
export interface MfaVerifyRequest {
  session: string
  username: string
  totpCode: string
}

export interface MfaSetupResponse {
  secretCode: string
  qrCodeUri: string
  session: string
}

export interface MfaVerifySetupRequest {
  totpCode: string
  session?: string
}

export interface MfaVerifySetupResponse {
  success: boolean
  backUpCodes: string[]
  message: string
}

export interface DisableMfaWithBackupCodeRequest {
  username: string
  backupCode: string
}

export interface MfaStatusResponse {
  mfaEnabled: boolean
  preferredMfa?: string
}

// Google OAuth
export interface OAuthUrlResponse {
  authorizationUrl: string
}

export interface GoogleSignInRequest {
  authorizationCode: string
  redirectUri: string
}

// Legacy Aliases (for backward compatibility)
export type LoginResponse = AuthSignInResult
export type User = CognitoUser
export type UpdateAuthProfileRequest = UpdateProfileRequest
export type VerifyTotpResponse = UserSignInResponse

// Form Validation Schemas
export const signInSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
})

export const signUpSchema = z.object({
  userName: z.string()
    .min(2, 'User Name is required')
    .regex(/^\S*$/, 'Username must not contain spaces'),
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

export const disableMfaSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  backupCode: z.string().min(1, 'Backup code is required'),
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type TotpFormData = z.infer<typeof totpSchema>
export type ConfirmSignUpFormData = z.infer<typeof confirmSignUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type DisableMfaFormData = z.infer<typeof disableMfaSchema>
