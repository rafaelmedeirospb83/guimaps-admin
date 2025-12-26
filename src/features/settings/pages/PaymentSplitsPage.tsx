import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Search } from 'lucide-react'
import {
  listPaymentSplits,
  getPaymentSplitDetail,
  markSplitReady,
  createSplitPayout,
  retryPayout,
} from '../api/paymentSplitsApi'
import type { CreatePayoutRequest } from '../../../types/adminPayments'
import { SplitsTable } from '../components/SplitsTable'
import { SplitDetailDrawer } from '../components/SplitDetailDrawer'
import { showToast } from '@shared/components/Toast'

const ITEMS_PER_PAGE = 50

export function PaymentSplitsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [offset, setOffset] = useState(0)
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null)

  const { data: splits = [], isLoading, refetch } = useQuery({
    queryKey: ['payment-splits', statusFilter, offset],
    queryFn: () =>
      listPaymentSplits({
        status: statusFilter || undefined,
        limit: ITEMS_PER_PAGE,
        offset,
      }),
  })

  const {
    data: selectedSplit,
    isLoading: isLoadingDetail,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['payment-split-detail', selectedSplitId],
    queryFn: () => getPaymentSplitDetail(selectedSplitId!),
    enabled: !!selectedSplitId,
  })

  // Filtro local por busca
  const filteredSplits = useMemo(() => {
    if (!searchQuery) return splits

    const query = searchQuery.toLowerCase()
    return splits.filter(
      (split) =>
        split.booking_id.toLowerCase().includes(query) ||
        split.payment_id.toLowerCase().includes(query) ||
        (split.partner_id && split.partner_id.toLowerCase().includes(query)) ||
        (split.guide_user_id && split.guide_user_id.toLowerCase().includes(query)),
    )
  }, [splits, searchQuery])

  const markReadyMutation = useMutation({
    mutationFn: markSplitReady,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-splits'] })
      queryClient.invalidateQueries({ queryKey: ['payment-split-detail', selectedSplitId] })
      showToast('Split marcado como READY_TO_PAY com sucesso', 'success')
      refetchDetail()
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || 'Erro ao marcar split como ready'
      showToast(message, 'error')
    },
  })

  const createPayoutMutation = useMutation({
    mutationFn: ({ splitId, payload }: { splitId: string; payload: CreatePayoutRequest }) =>
      createSplitPayout(splitId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-splits'] })
      queryClient.invalidateQueries({ queryKey: ['payment-split-detail', selectedSplitId] })
      
      if (data.error) {
        // Se AbacatePay retornar erro de não implementado
        if (data.error.toLowerCase().includes('not implemented') || data.error.toLowerCase().includes('não suportado')) {
          showToast('Transferência ainda não suportada para este provider no momento', 'warning')
        } else {
          showToast(`Erro no payout: ${data.error}`, 'error')
        }
      } else {
        showToast('Payout executado com sucesso', 'success')
      }
      
      refetchDetail()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao executar payout'
      if (message.toLowerCase().includes('not implemented')) {
        showToast('Transferência ainda não suportada para AbacatePay neste momento', 'warning')
      } else {
        showToast(message, 'error')
      }
    },
  })

  const retryPayoutMutation = useMutation({
    mutationFn: retryPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-split-detail', selectedSplitId] })
      showToast('Payout reprocessado com sucesso', 'success')
      refetchDetail()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao reprocessar payout'
      showToast(message, 'error')
    },
  })

  const handleViewSplit = (splitId: string) => {
    setSelectedSplitId(splitId)
  }

  const handleMarkReady = async (splitId: string) => {
    markReadyMutation.mutate(splitId)
  }

  const handlePayNow = (splitId: string) => {
    setSelectedSplitId(splitId)
  }

  const handleMarkReadyFromDrawer = async () => {
    if (!selectedSplitId) return
    await markReadyMutation.mutateAsync(selectedSplitId)
  }

  const handleCreatePayout = async (payload: CreatePayoutRequest) => {
    if (!selectedSplitId) return
    await createPayoutMutation.mutateAsync({ splitId: selectedSplitId, payload })
  }

  const handleRetryPayout = async (payoutId: string) => {
    await retryPayoutMutation.mutateAsync(payoutId)
  }

  const handleNextPage = () => {
    setOffset((prev) => prev + ITEMS_PER_PAGE)
  }

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - ITEMS_PER_PAGE))
  }

  const hasNextPage = splits.length === ITEMS_PER_PAGE
  const hasPrevPage = offset > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Splits & Payouts</h2>
        <p className="text-gray-600 mt-1">Gerencie repasses manuais após passeio concluído</p>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setOffset(0)
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos</option>
              <option value="PENDING_EVENT">Pendente</option>
              <option value="READY_TO_PAY">Pronto para Pagar</option>
              <option value="PAID">Pago</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por booking ID, payment ID, guide ID ou partner ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Paginação */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {offset + 1} - {offset + filteredSplits.length} de resultados
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={!hasPrevPage || isLoading}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage || isLoading}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <SplitsTable
          splits={filteredSplits}
          isLoading={isLoading}
          onViewSplit={handleViewSplit}
          onMarkReady={handleMarkReady}
          onPayNow={handlePayNow}
        />
      </div>

      {/* Drawer de Detalhes */}
      <SplitDetailDrawer
        split={selectedSplit || null}
        isOpen={!!selectedSplitId}
        onClose={() => setSelectedSplitId(null)}
        onMarkReady={handleMarkReadyFromDrawer}
        onCreatePayout={handleCreatePayout}
        onRetryPayout={handleRetryPayout}
        isLoading={isLoadingDetail}
      />
    </div>
  )
}

