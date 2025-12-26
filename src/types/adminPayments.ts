export type PaymentProviderCode = 'PAGARME' | 'ABACATEPAY'

export interface PaymentProvidersConfigDTO {
  id?: string
  primary_provider: PaymentProviderCode
  enabled_abacatepay: boolean
  enabled_pagarme: boolean
  allow_card_fallback_to_pagarme: boolean
  card_fallback_provider_code?: PaymentProviderCode | null
  tenant_id?: string | null
  platform_fee_percent?: number | null
  created_at?: string
  updated_at?: string
}

export interface UpdatePaymentProvidersConfigDTO {
  primary_provider: PaymentProviderCode
  enabled_abacatepay: boolean
  enabled_pagarme: boolean
  allow_card_fallback_to_pagarme: boolean
  card_fallback_provider_code?: PaymentProviderCode | null
  tenant_id?: string | null
  platform_fee_percent?: number | null
}

export interface PaymentWebhookEventDTO {
  id: string
  provider: PaymentProviderCode
  provider_event_id: string
  event_type?: string | null
  provider_payment_id?: string | null
  process_status: 'FAILED' | 'PENDING' | 'PROCESSING' | 'PROCESSED' | string
  error_message?: string | null
  created_at?: string
  updated_at?: string
  processed_at?: string | null
  payload_json?: any
}

export interface ReprocessWebhookResponseDTO {
  ok?: boolean
  enqueued?: boolean
  message?: string
  [key: string]: any
}

// Payment Splits Types
export type RecipientType = 'GUIDE_USER' | 'PARTNER' | 'PLATFORM'

export interface PaymentSplitListItem {
  id: string
  booking_id: string
  payment_id: string
  provider_code: string
  gross_amount_cents: number
  platform_fee_cents: number
  recipient_amount_cents: number
  recipient_type: RecipientType
  partner_id: string | null
  guide_user_id: string | null
  status: string
  booking_status: string | null
  payment_status: string | null
  created_at: string
  updated_at: string
}

export interface PayoutListItem {
  id: string
  payment_split_id: string
  payment_id: string
  booking_id: string
  provider_code: string
  amount_cents: number
  currency: string
  destination_type: string
  destination_id: string
  status: 'REQUESTED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | string
  provider_payout_id: string | null
  error_message: string | null
  requested_by_admin_id: string | null
  requested_at: string
  processed_at: string | null
}

export interface PaymentSplitDetail extends PaymentSplitListItem {
  partner_name: string | null // Nome do recipient (guia ou partner)
  booking_title: string | null
  payout_history: PayoutListItem[]
}

export interface CreatePayoutRequest {
  amount_cents?: number | null
  destination_override_id?: string | null
  notes?: string | null
}

export interface CreatePayoutResponse {
  payout_id: string
  status: string
  provider_code: string
  provider_payout_id: string | null
  message: string
  error?: string | null
}

export interface MarkReadyResponse {
  success: boolean
  split_id: string
  status: string
  message?: string
}

export interface RetryPayoutResponse {
  success: boolean
  payout_id: string
  status: string
  message: string
  error?: string | null
}

