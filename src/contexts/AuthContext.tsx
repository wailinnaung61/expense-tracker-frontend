import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/services/authService'
import { apiClient } from '@/lib/api'
import type { User, LoginResponse } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResponse>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user data from /api/auth/me
const fetchUser = async (silent: boolean = false) => {
  try {
    // Note: The apiClient will automatically attempt token refresh if needed
    // The silent parameter affects whether refresh errors show alerts
    const userData = await authService.getMe()
    setUser(userData)
    // Store username for refresh token requests (needed for Google OAuth and page reload)
    localStorage.setItem('username', userData.userName)
  } catch (error: any) {
    console.error('Failed to fetch user:', error)
    setUser(null)
    if (error?.status === 401 || error?.status === 403) {
      authService.clearTokens()
    }
    // Re-throw if not silent to let caller handle
    if (!silent) {
      throw error
    }
  }
}

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Silent mode: don't show error alerts on initial page load
          await fetchUser(true)
        }
      } catch (error) {
        // Silently fail - user will be redirected to login without alert
        console.error('Auth init failed:', error)
      } finally {
        setIsLoading(false)
        // Mark initial load as complete - future token refresh errors will show alerts
        apiClient.setInitialLoadComplete()
      }
    }
    initAuth()
  }, [])

  const login = async (usernameOrEmail: string, password: string): Promise<LoginResponse> => {
    const response = await authService.signIn({ usernameOrEmail, password })
    // If no MFA required, fetch user data immediately
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
