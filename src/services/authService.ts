import { apiClient } from '@/lib/api'
import type { LoginResponse, User, VerifyTotpResponse } from '@/types/auth'

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
  async signIn(data: SignInData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/Auth/signin', data)
    
    // If no MFA required, store tokens immediately
    if (!response.requiresMfa && response.tokens) {
      this.storeTokens(response.tokens)
      // Store username for refresh token requests
      localStorage.setItem('username', data.usernameOrEmail)
    }
    console.log('Sign in response:', response);
    return response
  },

  // Verify TOTP code for MFA
  async verifyTotp(data: VerifyTotpData): Promise<VerifyTotpResponse> {
    const response = await apiClient.post<VerifyTotpResponse>('/api/Auth/mfa/verify', data)
    this.storeTokens(response.tokens)
    // Store username for refresh token requests
    localStorage.setItem('username', data.username)
    return response
  },

  // Get current user info
  async getMe(): Promise<User> {
    return apiClient.get<User>('/api/Auth/me')
  },

  // Sign up
  async signUp(data: SignUpData): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/signup', data)
  },

  // Resend confirmation email
  async resendConfirmation(username: string): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/resend-confirmation', { username })
  },

  // Confirm email
  async confirm(username: string, confirmationCode: string): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/confirm', { username, confirmationCode })
  },

  // Forgot password
  async forgotPassword(usernameOrEmail: string): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/forgot-password', { usernameOrEmail })
  },

  // Reset password
  async resetPassword(data: { usernameOrEmail: string; confirmationCode: string; newPassword: string; }): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/reset-password', data)
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/change-password', data)
  },

  // Disable MFA with backup code
  async disableMfaWithBackup(data: { username: string; backupCode: string }): Promise<{ message: string }> {
    return apiClient.post('/api/Auth/mfa/disable-with-backup', data)
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
  async getGoogleAuthUrl(): Promise<{ authorizationUrl: string }> {
    const redirectUri = import.meta.env.VITE_REDIRECT_URI
    return apiClient.get<{ authorizationUrl: string }>('/api/Auth/google/url', { redirectUri })
  },

  async handleGoogleCallback(authorizationCode: string): Promise<LoginResponse> {
    const redirectUri = import.meta.env.VITE_REDIRECT_URI
    const response = await apiClient.post<LoginResponse>('/api/Auth/google/callback', {
      authorizationCode,
      redirectUri,
    })
    
    // Store tokens if no MFA required
    if (!response.requiresMfa && response.tokens) {
      this.storeTokens(response.tokens)
    }
    return response
  },

  // Token management
  storeTokens(tokens: LoginResponse['tokens']): void {
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
