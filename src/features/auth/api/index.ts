import { api } from '@shared/lib/axiosInstance'

export type AdminLoginRequest = {
  email: string
  password: string
}

export type RefreshTokenRequest = {
  refresh_token: string
}

export type AuthTokenResponse = {
  access_token: string
  refresh_token: string
  token_type?: string
  expires_in?: number
}

export type AuthResponse = {
  access_token: string
  refresh_token: string
  user: {
    id: string
    name: string
    email: string
    role: 'admin'
  }
}

export type RefreshTokenResponse = {
  access_token: string
  refresh_token: string
}

export type UserResponse = {
  id: string
  name: string
  email: string
  role: 'admin'
}

export const authService = {
  adminLogin: async (data: AdminLoginRequest): Promise<AuthTokenResponse> => {
    try {
      const response = await api.post<AuthTokenResponse>('/api/v1/admin/login', data)
      return response.data
    } catch (error) {
      console.error('Error logging in admin:', error)
      throw error
    }
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    try {
      const response = await api.post<RefreshTokenResponse>('/api/v1/auth/refresh', data)
      return response.data
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw error
    }
  },

  getMe: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>('/api/v1/admin/me')
      return response.data
    } catch (error) {
      console.error('Error fetching current user:', error)
      throw error
    }
  },
}

export const adminLogin = authService.adminLogin
export const refreshToken = authService.refreshToken
export const getMe = authService.getMe

