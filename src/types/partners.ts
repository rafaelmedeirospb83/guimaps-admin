export type PartnerApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface PartnerPublic {
  id: string
  name: string
  slug: string
  type: string

  description?: string | null

  city_id?: string | null
  address?: string | null
  neighborhood?: string | null
  latitude?: number | null
  longitude?: number | null

  whatsapp?: string | null
  phone?: string | null
  instagram?: string | null
  website_url?: string | null
  logo_url?: string | null

  avg_ticket_cents?: number | null
  highlight_home: boolean
  is_active: boolean
  user_id?: string | null
  city_name?: string | null
  approval_status?: PartnerApprovalStatus
  approved_at?: string | null
  rejection_reason?: string | null
  is_establishment?: boolean
  created_at?: string
}

export interface PartnerCreatePayload {
  name: string
  type: string
  slug?: string | null

  description?: string | null
  city_id?: string | null
  address?: string | null
  neighborhood?: string | null
  latitude?: number | null
  longitude?: number | null

  whatsapp?: string | null
  phone?: string | null
  instagram?: string | null
  website_url?: string | null
  logo_url?: string | null

  avg_ticket_cents?: number | null
  highlight_home?: boolean
  is_active?: boolean
}

export interface PartnerUpdatePayload {
  name?: string | null
  slug?: string | null
  type?: string | null

  description?: string | null
  city_id?: string | null
  address?: string | null
  neighborhood?: string | null
  latitude?: number | null
  longitude?: number | null

  whatsapp?: string | null
  phone?: string | null
  instagram?: string | null
  website_url?: string | null
  logo_url?: string | null

  avg_ticket_cents?: number | null
  highlight_home?: boolean | null
  is_active?: boolean | null
}

export interface PartnerTourPublic {
  id: string // id do registro partner_tours
  tour_id: string
  tour_slug: string
  tour_title: string
  tour_duration_minutes: number
  tour_price_cents: number
  priority: number
}

export interface PartnerDetailResponse {
  partner: PartnerPublic
  tours: PartnerTourPublic[]
}

export interface PartnerPhoto {
  id: string
  url: string
  caption?: string | null
  is_primary: boolean
  sort_order: number
  created_at: string // ISO date-time
}

export interface PartnerPhotoCreatePayload {
  caption?: string | null
  is_primary?: boolean
  sort_order?: number
}

export interface PartnerPhotoUpdatePayload {
  caption?: string | null
  is_primary?: boolean
  sort_order?: number
}

export interface PartnerTourCreatePayload {
  tour_id: string
  priority?: number
}

export interface PartnerTourUpdatePayload {
  priority?: number
}

export type CommissionType = string // "percent" | "fixed"

export interface AffiliateLinkCreatePayload {
  code: string
  tour_id?: string | null
  landing_path: string
  commission_type: CommissionType
  commission_percent?: number | string | null
  commission_cents?: number | null
  max_uses?: number | null
  expires_at?: string | null
  is_active?: boolean
}

export interface PartnerCommissionPublic {
  id: string
  partner_id: string
  affiliate_link_id?: string | null
  booking_id?: string | null
  payment_id?: string | null
  base_amount_cents: number
  commission_cents: number
  status: string
  paid_at?: string | null
  created_at: string
}

export interface PartnerCommissionsResponse {
  commissions: PartnerCommissionPublic[]
  total_pending_cents: number
  total_paid_cents: number
  total_canceled_cents: number
}

export interface PayCommissionRequest {
  paid_at?: string | null
}

export interface PartnerApprovalPayload {
  approval_status: PartnerApprovalStatus
  rejection_reason?: string | null
}

