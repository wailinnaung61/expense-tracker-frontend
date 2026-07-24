import { apiClient } from '@/lib/api'
import type {
  AvatarPreset,
  ProfileResponse,
  SelectAvatarPresetRequest,
  UpdateProfileRequest,
} from '@/types/profile'

function normalizeAvatar(raw: ProfileResponse): ProfileResponse {
  const r = raw as unknown as Record<string, unknown>
  const avatarRaw = (raw.avatar ?? r.Avatar) as Record<string, unknown> | null | undefined
  if (!avatarRaw || typeof avatarRaw !== 'object') {
    return { ...raw, avatar: raw.avatar ?? null }
  }
  return {
    ...raw,
    avatar: {
      source: String(avatarRaw.source ?? avatarRaw.Source ?? 'preset'),
      presetId: (avatarRaw.presetId ?? avatarRaw.PresetId ?? null) as string | null,
      url: String(avatarRaw.url ?? avatarRaw.Url ?? ''),
    },
  }
}

export const profileService = {
  async getProfile(): Promise<ProfileResponse> {
    const raw = await apiClient.request<ProfileResponse>('/api/Profile', {
      method: 'GET',
    })
    return normalizeAvatar(raw)
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    const raw = await apiClient.request<ProfileResponse>('/api/Profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return normalizeAvatar(raw)
  },

  async getAvatarPresets(): Promise<AvatarPreset[]> {
    const raw = await apiClient.request<AvatarPreset[] | { items?: AvatarPreset[] }>(
      '/api/Profile/avatars/presets',
      { method: 'GET' }
    )
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { items?: AvatarPreset[] }).items)
        ? (raw as { items: AvatarPreset[] }).items
        : []
    return list.map((item) => {
      const row = item as unknown as Record<string, unknown>
      return {
        id: String(row.id ?? row.Id ?? ''),
        label: String(row.label ?? row.Label ?? ''),
        accentColor: String(row.accentColor ?? row.AccentColor ?? '#94A3B8'),
        url: String(row.url ?? row.Url ?? ''),
      }
    })
  },

  async selectAvatarPreset(data: SelectAvatarPresetRequest): Promise<ProfileResponse> {
    const raw = await apiClient.request<ProfileResponse>('/api/Profile/avatar/preset', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return normalizeAvatar(raw)
  },

  async uploadAvatar(file: File): Promise<ProfileResponse> {
    const form = new FormData()
    form.append('file', file)
    const raw = await apiClient.request<ProfileResponse>('/api/Profile/avatar', {
      method: 'POST',
      body: form,
    })
    return normalizeAvatar(raw)
  },

  async removeAvatar(): Promise<ProfileResponse> {
    const raw = await apiClient.request<ProfileResponse>('/api/Profile/avatar', {
      method: 'DELETE',
    })
    return normalizeAvatar(raw)
  },
}
