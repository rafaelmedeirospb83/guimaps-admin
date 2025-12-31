import { api } from '@shared/lib/axiosInstance'
import type { CancelBookingRequest, CancelBookingResponse } from '../../../types/adminBookingCancel'

export type BookingAffiliateResponse = {
  affiliate_link_id: string | null
  affiliate_code: string | null
  partner_id: string | null
  partner_name: string | null
  partner_slug: string | null
}

export type BookingListItemResponse = {
  id: string
  date: string
  start_time: string
  duration_min: number
  people_count: number
  price_per_person_cents: number
  total_price_cents: number
  status: string
  language: string | null
  tour_title: string
  city_name: string | null
  guide_name: string
  tourist_name: string | null
  payment_status: string | null
  affiliate: BookingAffiliateResponse | null
}

export type BookingGuideResponse = {
  id: string
  name: string
  credential: string
  email: string | null
  phone: string
  avatar_url: string | null
}

export type BookingTouristResponse = {
  id: string
  name: string | null
  email: string | null
  phone: string
  cpf: string | null
}

export type BookingPaymentResponse = {
  id: string
  amount_cents: number
  status: string
  order_id: string | null
  charge_id: string | null
  paid_at: string | null
  canceled_at: string | null
  refunded_at: string | null
}

export type BookingBankAccountResponse = {
  id: string
  holder_name: string
  holder_type: string
  holder_document: string
  bank: string
  branch_number: string
  account_number: string
  account_check_digit: string
  account_type: string
  is_active: boolean
  is_verified: boolean
}

export type BookingDetailResponse = {
  id: string
  date: string
  start_time: string
  duration_min: number
  people_count: number
  price_per_person_cents: number
  total_price_cents: number
  status: string
  language: string | null
  tour_title: string
  tour_slug: string
  city_name: string | null
  guide: BookingGuideResponse
  tourist: BookingTouristResponse
  payment: BookingPaymentResponse | null
  bank_account: BookingBankAccountResponse | null
}

export type ListBookingsParams = {
  status?: string | null
  from?: string | null
}

export const bookingsService = {
  list: async (params?: ListBookingsParams): Promise<BookingListItemResponse[]> => {
    try {
      const response = await api.get<BookingListItemResponse[]>('/api/v1/admin/bookings', {
        params: {
          status: params?.status || undefined,
          from: params?.from || undefined,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error listing bookings:', error)
      throw error
    }
  },

  getById: async (bookingId: string): Promise<BookingDetailResponse> => {
    try {
      const response = await api.get<BookingDetailResponse>(`/api/v1/admin/bookings/${bookingId}`)
      return response.data
    } catch (error) {
      console.error('Error getting booking:', error)
      throw error
    }
  },
}

export const listBookings = bookingsService.list
export const getBookingById = bookingsService.getById

export async function cancelBookingAdmin(
  payload: CancelBookingRequest
): Promise<CancelBookingResponse> {
  try {
    const response = await api.post<CancelBookingResponse>(
      '/api/v1/admin/booking/cancelation',
      payload
    )
    return response.data
  } catch (error) {
    console.error('Error cancelling booking:', error)
    throw error
  }
}

