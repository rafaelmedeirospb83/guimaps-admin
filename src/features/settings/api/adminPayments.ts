import { api } from '@shared/lib/axiosInstance'
import type {
  PaymentProvidersConfigDTO,
  UpdatePaymentProvidersConfigDTO,
  PaymentWebhookEventDTO,
  ReprocessWebhookResponseDTO,
} from '../../../types/adminPayments'

export async function getPaymentsConfig(): Promise<PaymentProvidersConfigDTO> {
  const response = await api.get<PaymentProvidersConfigDTO>('/api/v1/admin/payments/config')
  return response.data
}

export async function updatePaymentsConfig(
  payload: UpdatePaymentProvidersConfigDTO,
): Promise<PaymentProvidersConfigDTO> {
  const response = await api.put<PaymentProvidersConfigDTO>(
    '/api/v1/admin/payments/config',
    payload,
  )
  return response.data
}

export async function listFailedWebhooks(
  limit: number = 200,
): Promise<PaymentWebhookEventDTO[]> {
  const response = await api.get<PaymentWebhookEventDTO[]>(
    '/api/v1/admin/payments/webhooks/failed',
    {
      params: { limit },
    },
  )
  return response.data
}

export async function reprocessWebhook(
  webhookEventId: string,
): Promise<ReprocessWebhookResponseDTO> {
  const response = await api.post<ReprocessWebhookResponseDTO>(
    `/api/v1/admin/payments/webhooks/${webhookEventId}/reprocess`,
  )
  return response.data
}

