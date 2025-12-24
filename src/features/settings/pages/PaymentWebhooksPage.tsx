import { useQuery, useMutation } from '@tanstack/react-query'
import { listFailedWebhooks, reprocessWebhook } from '../api/adminPayments'
import { FailedWebhooksTable } from '../components/FailedWebhooksTable'
import { showToast } from '@shared/components/Toast'

export function PaymentWebhooksPage() {
  const {
    data: failedWebhooks = [],
    isLoading: isLoadingWebhooks,
    refetch: refetchWebhooks,
  } = useQuery({
    queryKey: ['failed-webhooks'],
    queryFn: () => listFailedWebhooks(200),
  })

  const reprocessMutation = useMutation({
    mutationFn: reprocessWebhook,
    onSuccess: () => {
      showToast('Webhook enfileirado para reprocessamento', 'success')
      refetchWebhooks()
    },
    onError: () => {
      showToast('Erro ao reprocessar webhook', 'error')
    },
  })

  const handleReprocess = async (webhookEventId: string) => {
    await reprocessMutation.mutateAsync(webhookEventId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Webhooks com Falha</h2>
        <p className="text-gray-600 mt-1">
          Gerencie webhooks que falharam no processamento e reprocesse eventos
        </p>
      </div>

      <FailedWebhooksTable
        webhooks={failedWebhooks}
        isLoading={isLoadingWebhooks}
        onRefresh={() => refetchWebhooks()}
        onReprocess={handleReprocess}
      />
    </div>
  )
}

