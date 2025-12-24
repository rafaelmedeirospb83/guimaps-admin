import { api } from '@shared/lib/axiosInstance'
import type {
  GuideAdminListItem,
  GuideAdminDetail,
  GuideApprovalUpdateDTO,
  GuidePasswordUpdateDTO,
} from '../../../types/adminGuides'

export interface ListGuidesParams {
  status?: string | null
  search?: string | null
  limit?: number
  offset?: number
}

export async function listGuidesAdmin(
  params: ListGuidesParams = {},
): Promise<GuideAdminListItem[]> {
  const { status, search, limit = 50, offset = 0 } = params

  const response = await api.get<GuideAdminListItem[]>('/api/v1/admin/guides', {
    params: {
      status: status || undefined,
      search: search || undefined,
      limit,
      offset,
    },
  })

  return response.data
}

export async function getGuideDetailAdmin(guideId: string): Promise<GuideAdminDetail> {
  const response = await api.get<GuideAdminDetail>(`/api/v1/admin/guides/${guideId}`)
  return response.data
}

export async function updateGuideApprovalAdmin(
  guideId: string,
  payload: GuideApprovalUpdateDTO,
): Promise<GuideAdminDetail> {
  const response = await api.patch<GuideAdminDetail>(
    `/api/v1/admin/guides/${guideId}/approval`,
    payload,
  )
  return response.data
}

export async function resetGuidePasswordAdmin(
  guideId: string,
  payload: GuidePasswordUpdateDTO,
): Promise<void> {
  await api.post(`/api/v1/admin/guides/${guideId}/reset-password`, payload)
}


