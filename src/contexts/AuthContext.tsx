import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/services/authService'
import { profileService } from '@/services/profileService'
import { apiClient } from '@/lib/api'
import type { User, LoginResponse } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResponse>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  /** Update header/sidebar avatar immediately after Settings change. */
  setAvatarUrl: (url: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setAvatarUrl = (url: string | null) => {
    setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev))
  }

  const fetchUser = async (silent: boolean = false) => {
    try {
      const userData = await authService.getMe()
      const raw = userData as unknown as Record<string, unknown>
      let avatarUrl: string | null =
        (typeof userData.avatarUrl === 'string' && userData.avatarUrl) ||
        (typeof raw.AvatarUrl === 'string' && (raw.AvatarUrl as string)) ||
        null

      try {
        const profile = await profileService.getProfile()
        avatarUrl = profile.avatar?.url?.trim() || avatarUrl
      } catch {
        // Avatar is optional
      }

      setUser({ ...userData, avatarUrl: avatarUrl || null })
      localStorage.setItem('username', userData.userName)
    } catch (error: any) {
      console.error('Failed to fetch user:', error)
      setUser(null)
      if (error?.status === 401 || error?.status === 403) {
        authService.clearTokens()
      }
      if (!silent) {
        throw error
      }
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          await fetchUser(true)
        }
      } catch (error) {
        console.error('Auth init failed:', error)
      } finally {
        setIsLoading(false)
        apiClient.setInitialLoadComplete()
      }
    }
    void initAuth()
  }, [])

  const login = async (usernameOrEmail: string, password: string): Promise<LoginResponse> => {
    const response = await authService.signIn({ usernameOrEmail, password })
    if (!response.requiresMfa && response.tokens) {
      await fetchUser()
    }
    return response
  }

  const logout = async () => {
    await authService.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        fetchUser,
        setAvatarUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
