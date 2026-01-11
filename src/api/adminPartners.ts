import { api } from '@shared/lib/axiosInstance'
import type {
  PartnerPublic,
  PartnerCreatePayload,
  PartnerUpdatePayload,
  AffiliateLinkCreatePayload,
  PartnerCommissionsResponse,
  PayCommissionRequest,
  PartnerPhoto,
  PartnerPhotoCreatePayload,
  PartnerPhotoUpdatePayload,
  PartnerTourPublic,
  PartnerTourCreatePayload,
  PartnerTourUpdatePayload,
  PartnerApprovalPayload,
  PartnerApprovalStatus,
} from '../types/partners'

export interface ListPartnersParams {
  approval_status?: PartnerApprovalStatus
  is_active?: boolean
  search?: string
}

export async function listPartners(params: ListPartnersParams = {}): Promise<PartnerPublic[]> {
  const response = await api.get<PartnerPublic[]>('/api/v1/admin/partners', { params })
  return response.data
}

export async function getAdminPartnerDetail(partnerId: string): Promise<PartnerPublic> {
  const response = await api.get<PartnerPublic>(`/api/v1/admin/partners/${partnerId}`)
  return response.data
}

export async function updatePartnerApproval(
  partnerId: string,
  payload: PartnerApprovalPayload,
): Promise<PartnerPublic> {
  const response = await api.patch<PartnerPublic>(
    `/api/v1/admin/partners/${partnerId}/approval`,
    payload,
  )
  return response.data
}

export async function createPartner(payload: PartnerCreatePayload): Promise<PartnerPublic> {
  const response = await api.post<PartnerPublic>('/api/v1/admin/partners', payload)
  return response.data
}

export async function updatePartner(
  partnerId: string,
  payload: PartnerUpdatePayload,
): Promise<PartnerPublic> {
  const response = await api.patch<PartnerPublic>(`/api/v1/admin/partners/${partnerId}`, payload)
  return response.data
}

/**
 * Fotos do partner
 */

export async function listPartnerPhotos(partnerId: string): Promise<PartnerPhoto[]> {
  const response = await api.get<PartnerPhoto[]>(`/api/v1/admin/partners/${partnerId}/photos`)
  return response.data
}

export async function uploadPartnerPhoto(
  partnerId: string,
  file: File,
  payload: PartnerPhotoCreatePayload,
): Promise<PartnerPhoto> {
  const formData = new FormData()
  formData.append('file', file)

  if (payload.caption != null) formData.append('caption', payload.caption)
  if (payload.is_primary != null) formData.append('is_primary', String(payload.is_primary))
  if (payload.sort_order != null) formData.append('sort_order', String(payload.sort_order))

  const response = await api.post<PartnerPhoto>(
    `/api/v1/admin/partners/${partnerId}/photos`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )

  return response.data
}

export async function updatePartnerPhoto(
  photoId: string,
  payload: PartnerPhotoUpdatePayload,
): Promise<PartnerPhoto> {
  const response = await api.patch<PartnerPhoto>(
    `/api/v1/admin/partners/photos/${photoId}`,
    payload,
  )
  return response.data
}

export async function deletePartnerPhoto(photoId: string): Promise<void> {
  await api.delete(`/api/v1/admin/partners/photos/${photoId}`)
}

/**
 * Tours do partner (admin)
 */

export async function listPartnerToursAdmin(partnerId: string): Promise<PartnerTourPublic[]> {
  const response = await api.get<PartnerTourPublic[]>(`/api/v1/admin/partners/${partnerId}/tours`)
  return response.data
}

export async function addTourToPartner(
  partnerId: string,
  payload: PartnerTourCreatePayload,
): Promise<PartnerTourPublic> {
  const response = await api.post<PartnerTourPublic>(
    `/api/v1/admin/partners/${partnerId}/tours`,
    payload,
  )
  return response.data
}

export async function updatePartnerTour(
  partnerTourId: string,
  payload: PartnerTourUpdatePayload,
): Promise<PartnerTourPublic> {
  const response = await api.patch<PartnerTourPublic>(
    `/api/v1/admin/partner-tours/${partnerTourId}`,
    payload,
  )
  return response.data
}

export async function deletePartnerTour(partnerTourId: string): Promise<void> {
  await api.delete(`/api/v1/admin/partner-tours/${partnerTourId}`)
}

/**
 * Affiliate links e commissions
 */

export async function createAffiliateLinkForPartner(
  partnerId: string,
  payload: AffiliateLinkCreatePayload,
): Promise<Record<string, unknown>> {
  const response = await api.post<Record<string, unknown>>(
    `/api/v1/admin/partners/${partnerId}/affiliate-links`,
    payload,
  )
  return response.data
}

export async function listPartnerCommissions(
  partnerId: string,
  params?: { status?: string | null; from?: string | null; to?: string | null },
): Promise<PartnerCommissionsResponse> {
  const response = await api.get<PartnerCommissionsResponse>(
    `/api/v1/admin/partners/${partnerId}/commissions`,
    { params },
  )
  return response.data
}

export async function payPartnerCommission(
  commissionId: string,
  payload: PayCommissionRequest,
): Promise<Record<string, unknown>> {
  const response = await api.post<Record<string, unknown>>(
    `/api/v1/admin/partner-commissions/${commissionId}/pay`,
    payload,
  )
  return response.data
}

