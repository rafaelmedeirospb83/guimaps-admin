export interface CancelBookingRequest {
  booking_id: string
  reason?: string | null
  refund_amount?: number | null
  refund_mode?: 'FULL' | 'PARTIAL' | null
}

export interface ProviderRefundResult {
  provider: 'PAGARME' | 'ABACATEPAY'
  action: 'REFUND' | 'VOID'
  provider_refund_id: string | null
  status: 'SUCCESS' | 'FAILED' | 'ALREADY_CANCELLED'
  error_message: string | null
}

export interface CancelBookingResponse {
  booking_id: string
  booking_status: string
  payment_id: string
  payment_status: string
  splits_updated: number
  provider_result: ProviderRefundResult | null
  cancelled_at: string
  reason: string | null
}

