import { api } from '@shared/lib/axiosInstance'

export interface UserListItem {
  id: string
  name: string | null
  email: string | null
  phone: string
  cpf: string | null
  role: 'tourist' | 'guide' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BookingSummary {
  id: string
  status: string
  date: string
  start_time: string
  total_price_cents: number
  payment_status: string | null
  created_at: string
}

export interface CardSummary {
  id: string
  type: string
  brand: string | null
  last_four: string | null
  is_default: boolean
  is_active: boolean
  created_at: string
}

export interface UserDetail extends UserListItem {
  pagarme_customer_id: string | null
  pagarme_recipient_id: string | null
  accepted_terms_at: string | null
}

export interface PaginatedResponse<T> {
  items: T[]
  limit: number
  offset: number
  total: number
}

export interface UserDetailResponse {
  user: UserDetail
  bookings: PaginatedResponse<BookingSummary>
  cards: CardSummary[]
}

export interface ListUsersResponse extends PaginatedResponse<UserListItem> {}

export interface ListUsersParams {
  q?: string
  status?: 'active' | 'inactive' | 'deleted'
  created_from?: string
  created_to?: string
  limit?: number
  offset?: number
}

export interface GetUserDetailParams {
  bookings_limit?: number
  bookings_offset?: number
}

export const usersService = {
  list: async (params?: ListUsersParams): Promise<ListUsersResponse> => {
    try {
      const response = await api.get<ListUsersResponse>('/api/v1/admin/users', {
        params: {
          ...(params?.q && { q: params.q }),
          ...(params?.status && { status: params.status }),
          ...(params?.created_from && { created_from: params.created_from }),
          ...(params?.created_to && { created_to: params.created_to }),
          ...(params?.limit && { limit: params.limit }),
          ...(params?.offset && { offset: params.offset }),
        },
      })
      return response.data
    } catch (error) {
      console.error('Error listing users:', error)
      throw error
    }
  },

  getById: async (userId: string, params?: GetUserDetailParams): Promise<UserDetailResponse> => {
    try {
      const response = await api.get<UserDetailResponse>(`/api/v1/admin/users/${userId}`, {
        params: {
          ...(params?.bookings_limit && { bookings_limit: params.bookings_limit }),
          ...(params?.bookings_offset && { bookings_offset: params.bookings_offset }),
        },
      })
      return response.data
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  },

  delete: async (userId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/admin/users/${userId}`)
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },
}

export const listUsers = usersService.list
export const getUserById = usersService.getById
export const deleteUser = usersService.delete

