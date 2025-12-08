import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type User = {
  id: string
  name: string
  email: string
  role: 'admin'
}

type AuthContextType = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
  updateTokens: (accessToken: string, refreshToken: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'guimaps_admin_access_token',
  REFRESH_TOKEN: 'guimaps_admin_refresh_token',
  USER: 'guimaps_admin_user',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER)
    return stored ? JSON.parse(stored) : null
  })
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  })
  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  })

  const login = (newAccessToken: string, newRefreshToken: string, newUser: User) => {
    setAccessToken(newAccessToken)
    setRefreshToken(newRefreshToken)
    setUser(newUser)
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }

  const updateTokens = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken)
    setRefreshToken(newRefreshToken)
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken && !!user,
        login,
        logout,
        updateTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

