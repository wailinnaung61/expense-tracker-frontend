import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { User, LoginResponse } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  fetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user data from /api/auth/me
  const fetchUser = async () => {
    try {
      const userData = await authService.getMe()
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
      authService.clearTokens()
    }
    console.log('User data fetched:', user)
  }

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          await fetchUser()
        }
      } catch (error) {
        console.error('Auth init failed:', error)
      } finally {
        setIsLoading(false)
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

  const refreshToken = async () => {
    const response = await authService.refresh()
    if (!response.requiresMfa && response.tokens) {
      await fetchUser()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshToken,
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
