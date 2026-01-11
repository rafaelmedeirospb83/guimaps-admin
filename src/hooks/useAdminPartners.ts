import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listPartners,
  getAdminPartnerDetail,
  createPartner,
  updatePartner,
  createAffiliateLinkForPartner,
  listPartnerCommissions,
  payPartnerCommission,
  listPartnerPhotos,
  uploadPartnerPhoto,
  updatePartnerPhoto,
  deletePartnerPhoto,
  listPartnerToursAdmin,
  addTourToPartner,
  updatePartnerTour,
  deletePartnerTour,
  type ListPartnersParams,
  updatePartnerApproval,
} from '../api/adminPartners'

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
} from '../types/partners'

export function usePartnersList(params: ListPartnersParams = {}) {
  return useQuery<PartnerPublic[]>({
    queryKey: ['admin-partners', params],
    queryFn: () => listPartners(params),
  })
}

export function usePartnerDetail(partnerId: string | undefined) {
  return useQuery<PartnerPublic>({
    queryKey: ['admin-partner-detail', partnerId],
    queryFn: () => getAdminPartnerDetail(partnerId!),
    enabled: Boolean(partnerId),
  })
}

export function useCreatePartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PartnerCreatePayload) => createPartner(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
    },
  })
}

export function useUpdatePartner(partnerId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PartnerUpdatePayload) => updatePartner(partnerId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
      queryClient.invalidateQueries({ queryKey: ['admin-partner-detail'] })
    },
  })
}

export function useUpdatePartnerApproval(partnerId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PartnerApprovalPayload) => updatePartnerApproval(partnerId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
      queryClient.invalidateQueries({ queryKey: ['admin-partner-detail'] })
    },
  })
}

/**
 * Fotos do partner
 */

export function usePartnerPhotos(partnerId: string | undefined) {
  return useQuery<PartnerPhoto[]>({
    queryKey: ['admin-partner-photos', partnerId],
    queryFn: () => listPartnerPhotos(partnerId!),
    enabled: Boolean(partnerId),
  })
}

export function useUploadPartnerPhoto(partnerId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: { file: File; payload: PartnerPhotoCreatePayload }) =>
      uploadPartnerPhoto(partnerId!, variables.file, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-photos', partnerId] })
    },
  })
}

export function useUpdatePartnerPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: { photoId: string; payload: PartnerPhotoUpdatePayload }) =>
      updatePartnerPhoto(variables.photoId, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-photos'] })
    },
  })
}

export function useDeletePartnerPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (photoId: string) => deletePartnerPhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-photos'] })
    },
  })
}

/**
 * Tours do partner
 */

export function usePartnerToursAdmin(partnerId: string | undefined) {
  return useQuery<PartnerTourPublic[]>({
    queryKey: ['admin-partner-tours', partnerId],
    queryFn: () => listPartnerToursAdmin(partnerId!),
    enabled: Boolean(partnerId),
  })
}

export function useAddTourToPartner(partnerId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PartnerTourCreatePayload) => addTourToPartner(partnerId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-tours', partnerId] })
    },
  })
}

export function useUpdatePartnerTour() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: { partnerTourId: string; payload: PartnerTourUpdatePayload }) =>
      updatePartnerTour(variables.partnerTourId, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-tours'] })
    },
  })
}

export function useDeletePartnerTour() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (partnerTourId: string) => deletePartnerTour(partnerTourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-tours'] })
    },
  })
}

/**
 * Affiliate & commissions
 */

export function useCreateAffiliateLink(partnerId: string | undefined) {
  return useMutation({
    mutationFn: (payload: AffiliateLinkCreatePayload) =>
      createAffiliateLinkForPartner(partnerId!, payload),
  })
}

export function usePartnerCommissions(
  partnerId: string | undefined,
  params?: { status?: string | null; from?: string | null; to?: string | null },
) {
  return useQuery<PartnerCommissionsResponse>({
    queryKey: ['admin-partner-commissions', partnerId, params],
    queryFn: () => listPartnerCommissions(partnerId!, params),
    enabled: Boolean(partnerId),
  })
}

export function usePayPartnerCommission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: { commissionId: string; payload: PayCommissionRequest }) =>
      payPartnerCommission(variables.commissionId, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-commissions'] })
    },
  })
}

