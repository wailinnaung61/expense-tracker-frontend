import { apiClient } from '@/lib/api'
import type { 
  AuthSignInResult,
  CognitoUser, 
  UserSignInRequest,
  UserSignUpRequest,
  UserSignUpResponse,
  UserConfirmSignUpRequest,
  UserForgotPasswordRequest,
  UserResetPasswordRequest,
  UserChangePasswordRequest,
  UpdateProfileRequest,
  MfaVerifyRequest,
  UserSignInResponse,
  OAuthUrlResponse,
  GoogleSignInRequest,
  DisableMfaWithBackupCodeRequest,
  TokenResponse
} from '@/types/auth'

export interface SignUpData {
  userName: string
  email: string
  password: string
}

export interface SignInData {
  usernameOrEmail: string
  password: string
}

export interface VerifyTotpData {
  session: string
  username: string
  totpCode: string
}

export const authService = {
  // Sign in - returns MFA status or tokens
  async signIn(data: SignInData): Promise<AuthSignInResult> {
    const signInRequest: UserSignInRequest = {
      usernameOrEmail: data.usernameOrEmail,
      password: data.password
    }
    const response = await apiClient.post<AuthSignInResult>('/api/Auth/signin', signInRequest)
    
    // If no MFA required, store tokens immediately
    if (!response.requiresMfa && response.tokens) {
      this.storeTokens(response.tokens)
      // Store username for refresh token requests
      localStorage.setItem('username', data.usernameOrEmail)
    }
    return response
  },

  // Verify TOTP code for MFA
  async verifyTotp(data: VerifyTotpData): Promise<UserSignInResponse> {
    const mfaRequest: MfaVerifyRequest = {
      session: data.session,
      username: data.username,
      totpCode: data.totpCode
    }
    const response = await apiClient.post<UserSignInResponse>('/api/Auth/mfa/verify', mfaRequest)
    this.storeTokens(response.tokens)
    // Store username for refresh token requests
    localStorage.setItem('username', data.username)
    return response
  },

  // Get current user info
  async getMe(): Promise<CognitoUser> {
    return apiClient.get<CognitoUser>('/api/Auth/me')
  },

  // Sign up
  async signUp(data: SignUpData): Promise<UserSignUpResponse> {
    const signUpRequest: UserSignUpRequest = {
      username: data.userName,
      email: data.email,
      password: data.password
    }
    return apiClient.post<UserSignUpResponse>('/api/Auth/signup', signUpRequest)
  },

  // Resend confirmation email
  async resendConfirmation(username: string): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/resend-confirmation', { username })
  },

  // Confirm email
  async confirm(username: string, confirmationCode: string): Promise<{ message: string }> {
    const confirmRequest: UserConfirmSignUpRequest = {
      username,
      confirmationCode
    }
    return apiClient.post('/api/Auth/confirm', confirmRequest)
  },

  // Forgot password
  async forgotPassword(usernameOrEmail: string): Promise<{ message: string }> {
    const forgotRequest: UserForgotPasswordRequest = {
      usernameOrEmail
    }
    return apiClient.post('/api/Auth/forgot-password', forgotRequest)
  },

  // Reset password
  async resetPassword(data: { usernameOrEmail: string; confirmationCode: string; newPassword: string; }): Promise<{ message: string }> {
    const resetRequest: UserResetPasswordRequest = {
      usernameOrEmail: data.usernameOrEmail,
      confirmationCode: data.confirmationCode,
      newPassword: data.newPassword
    }
    return apiClient.post('/api/Auth/reset-password', resetRequest)
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
    const changeRequest: UserChangePasswordRequest = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword
    }
    return apiClient.post('/api/Auth/change-password', changeRequest)
  },

  // Update auth profile (userName, email)
  async updateAuthProfile(data: { userName: string; email: string }): Promise<CognitoUser> {
    const updateRequest: UpdateProfileRequest = {
      userName: data.userName,
      email: data.email
    }
    return apiClient.put<CognitoUser>('/api/Auth/profile', updateRequest)
  },

  // Resend email verification
  async resendEmailVerification(): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/resend-email-verification')
  },

  // Confirm email change
  async confirmEmailChange(confirmationCode: string): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/confirm-email-change', { confirmationCode })
  },

  // Disable MFA with backup code
  async disableMfaWithBackup(data: { username: string; backupCode: string }): Promise<{ message: string }> {
    const disableRequest: DisableMfaWithBackupCodeRequest = {
      username: data.username,
      backupCode: data.backupCode
    }
    return apiClient.post('/api/Auth/mfa/disable-with-backup', disableRequest)
  },

  // Sign out
  async signOut(): Promise<void> {
    const token = this.getAccessToken()
    
    // Clear tokens first to ensure user is logged out even if API fails
    this.clearTokens()
    
    try {
      // Only call API if we have a token
      if (token) {
        await apiClient.post('/api/Auth/signout')
      }
    } catch (error) {
      // Ignore errors - user is already logged out locally
      console.error('Sign out API call failed:', error)
    }
  },

  // Google OAuth
  async getGoogleAuthUrl(): Promise<OAuthUrlResponse> {
    const redirectUri = import.meta.env.VITE_REDIRECT_URI
    return apiClient.get<OAuthUrlResponse>('/api/Auth/google/url', { redirectUri })
  },

  async handleGoogleCallback(authorizationCode: string): Promise<AuthSignInResult> {
    const redirectUri = import.meta.env.VITE_REDIRECT_URI
    const googleRequest: GoogleSignInRequest = {
      authorizationCode,
      redirectUri,
    }
    const response = await apiClient.post<AuthSignInResult>('/api/Auth/google/callback', googleRequest)
    
    // Store tokens if no MFA required
    if (!response.requiresMfa && response.tokens) {
      this.storeTokens(response.tokens)
    }
    return response
  },

  // Token management
  storeTokens(tokens: TokenResponse): void {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('idToken', tokens.idToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
  },

  clearTokens(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('idToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  },
}
