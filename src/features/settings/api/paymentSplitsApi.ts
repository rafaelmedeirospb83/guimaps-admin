import { api } from '@shared/lib/axiosInstance'
import type {
  PaymentSplitListItem,
  PaymentSplitDetail,
  PayoutListItem,
  CreatePayoutRequest,
  CreatePayoutResponse,
  MarkReadyResponse,
  RetryPayoutResponse,
} from '../../../types/adminPayments'

export interface ListPaymentSplitsParams {
  status?: string
  limit?: number
  offset?: number
}

export async function listPaymentSplits(
  params: ListPaymentSplitsParams = {},
): Promise<PaymentSplitListItem[]> {
  const { status, limit = 50, offset = 0 } = params

  const response = await api.get<PaymentSplitListItem[]>('/api/v1/admin/payments/splits', {
    params: {
      status: status || undefined,
      limit,
      offset,
    },
  })

  return response.data
}

export async function getPaymentSplitDetail(splitId: string): Promise<PaymentSplitDetail> {
  const response = await api.get<PaymentSplitDetail>(
    `/api/v1/admin/payments/splits/${splitId}`,
  )
  return response.data
}

export async function markSplitReady(splitId: string): Promise<MarkReadyResponse> {
  try {
    const response = await api.post<MarkReadyResponse>(
      `/api/v1/admin/payments/splits/${splitId}/mark-ready`,
      {},
    )
    
    if (response.data && response.data.success === false) {
      const errorMessage = response.data.message || 'Não foi possível marcar split como READY_TO_PAY'
      const error = new Error(errorMessage) as Error & {
        response?: {
          data: MarkReadyResponse
        }
        isAxiosError?: boolean
      }
      error.response = {
        data: response.data,
      }
      error.isAxiosError = true
      throw error
    }
    
    return response.data
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: MarkReadyResponse } }
      if (apiError.response?.data && !apiError.response.data.success) {
        const errorMessage = apiError.response.data.message || 'Não foi possível marcar split como READY_TO_PAY'
        const newError = new Error(errorMessage) as Error & {
          response?: {
            data: MarkReadyResponse
          }
        }
        newError.response = apiError.response
        throw newError
      }
    }
    throw error
  }
}

export async function createSplitPayout(
  splitId: string,
  body: CreatePayoutRequest,
): Promise<CreatePayoutResponse> {
  const response = await api.post<CreatePayoutResponse>(
    `/api/v1/admin/payments/splits/${splitId}/payout`,
    body,
  )
  return response.data
}

export async function getPayoutDetail(payoutId: string): Promise<PayoutListItem> {
  const response = await api.get<PayoutListItem>(
    `/api/v1/admin/payments/splits/payouts/${payoutId}`,
  )
  return response.data
}

export async function retryPayout(payoutId: string): Promise<RetryPayoutResponse> {
  const response = await api.post<RetryPayoutResponse>(
    `/api/v1/admin/payments/splits/payouts/${payoutId}/retry`,
    {},
  )
  return response.data
}



