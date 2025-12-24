export type GuideApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface GuideAdminListItem {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  approval_status: GuideApprovalStatus
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  city_name: string | null
  main_language: string | null
  credential: string
  rating_avg: number
  rating_count: number
  is_active: boolean
}

export interface GuideAdminDetail extends GuideAdminListItem {
  avatar_url: string | null
  bio: string | null
  address: string | null
  languages: string[]
  main_city_id: string | null
  updated_at: string
}

export interface GuideApprovalUpdateDTO {
  approval_status: GuideApprovalStatus
  rejection_reason?: string | null
}

export interface GuidePasswordUpdateDTO {
  new_password: string
}


