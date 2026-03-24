import { apiClient } from '@/lib/api'
import type { ProfileResponse, UpdateProfileRequest } from '@/types/profile'

export const profileService = {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<ProfileResponse> {
    return apiClient.request<ProfileResponse>('/api/Profile', {
      method: 'GET',
    })
  },

  /**
   * Update current user's profile (currency, dailyLimit, phoneNumber)
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    return apiClient.request<ProfileResponse>('/api/Profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}
