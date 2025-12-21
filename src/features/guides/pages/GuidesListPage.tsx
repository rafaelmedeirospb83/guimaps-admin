import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listGuidesAdmin,
  getGuideDetailAdmin,
  updateGuideApprovalAdmin,
} from '../api'
import type { GuideApprovalStatus } from '../../../types/adminGuides'
import { GuideStatusBadge } from '../components/GuideStatusBadge'
import { ResetGuidePasswordModal } from '../components/ResetGuidePasswordModal'
import { showToast } from '@shared/components/Toast'
import { X } from 'lucide-react'

type StatusFilter = '' | 'pending' | 'approved' | 'rejected'

export function GuidesListPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [limit] = useState(50)
  const [offset] = useState(0)

  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null)
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false)

  const { data: guides = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-guides', statusFilter, searchQuery, limit, offset],
    queryFn: () =>
      listGuidesAdmin({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        limit,
        offset,
      }),
  })

  const {
    data: selectedGuideDetail,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['admin-guide-detail', selectedGuideId],
    queryFn: () => getGuideDetailAdmin(selectedGuideId!),
    enabled: !!selectedGuideId,
  })

  const updateApprovalMutation = useMutation({
    mutationFn: ({
      guideId,
      status,
      rejectionReason,
    }: {
      guideId: string
      status: GuideApprovalStatus
      rejectionReason?: string | null
    }) =>
      updateGuideApprovalAdmin(guideId, {
        approval_status: status,
        rejection_reason: rejectionReason,
      }),
    onSuccess: (updatedGuide) => {
      queryClient.setQueryData(['admin-guide-detail', updatedGuide.id], updatedGuide)
      queryClient.invalidateQueries({ queryKey: ['admin-guides'] })
      showToast(`Guia ${updatedGuide.approval_status === 'approved' ? 'aprovado' : updatedGuide.approval_status === 'rejected' ? 'reprovado' : 'marcado como pendente'} com sucesso`, 'success')
      refetchDetail()
    },
    onError: () => {
      showToast('Erro ao atualizar status do guia', 'error')
    },
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  const openGuideDetail = (guideId: string) => {
    setSelectedGuideId(guideId)
  }

  const closeGuideDetail = () => {
    setSelectedGuideId(null)
  }

  const updateApproval = async (status: GuideApprovalStatus) => {
    if (!selectedGuideId) return

    let rejection_reason: string | null = null
    if (status === 'rejected') {
      const reason = window.prompt('Informe o motivo da reprovação (visível internamente):')
      if (!reason || reason.trim() === '') {
        return
      }
      rejection_reason = reason.trim()
    }

    updateApprovalMutation.mutate({
      guideId: selectedGuideId,
      status,
      rejectionReason: rejection_reason,
    })
  }

  const selectedGuideName =
    selectedGuideDetail?.full_name ||
    guides.find((g) => g.id === selectedGuideId)?.full_name ||
    undefined

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guias</h1>
          <p className="text-gray-600 mt-1">
            Gerencie o cadastro, aprovação e acesso dos guias na plataforma.
          </p>
        </div>
      </header>

      {/* Filtros */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Reprovado</option>
            </select>
          </div>

          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Buscar (nome ou e-mail)
            </label>
            <input
              type="text"
              placeholder="Ex: João, maria@email.com..."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Buscar'}
          </button>
        </form>
      </section>

      {/* Tabela */}
      <section className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Carregando guias...</div>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="py-2 pr-4">Guia</th>
                <th className="py-2 pr-4">Contato</th>
                <th className="py-2 pr-4">Cidade</th>
                <th className="py-2 pr-4">Idioma</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Avaliações</th>
                <th className="py-2 pr-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {guides.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-gray-500">
                    Nenhum guia encontrado com os filtros atuais.
                  </td>
                </tr>
              )}

              {guides.map((guide) => (
                <tr
                  key={guide.id}
                  className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  onClick={() => openGuideDetail(guide.id)}
                >
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{guide.full_name}</span>
                      <span className="text-xs text-gray-500">{guide.credential}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col text-xs text-gray-700">
                      <span>{guide.email}</span>
                      <span>{guide.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-700">
                    {guide.city_name || '-'}
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-700">
                    {guide.main_language || '-'}
                  </td>
                  <td className="py-3 pr-4">
                    <GuideStatusBadge status={guide.approval_status} />
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-700">
                    {guide.rating_count > 0 ? (
                      <span>
                        {guide.rating_avg.toFixed(1)} ⭐ ({guide.rating_count})
                      </span>
                    ) : (
                      <span className="text-gray-400">Sem avaliações</span>
                    )}
                  </td>
                  <td
                    className="py-3 pr-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                      onClick={() => openGuideDetail(guide.id)}
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Drawer de Detalhes */}
      {selectedGuideId && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/20"
          onClick={closeGuideDetail}
        >
          <div
            className="h-full w-full max-w-md bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold">Detalhes do guia</h2>
                {selectedGuideDetail && (
                  <p className="text-xs text-gray-500">ID: {selectedGuideDetail.id}</p>
                )}
              </div>
              <button
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={closeGuideDetail}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-4 py-3 space-y-4">
              {isDetailLoading && (
                <p className="text-sm text-gray-500">Carregando detalhes...</p>
              )}

              {selectedGuideDetail && !isDetailLoading && (
                <>
                  {/* Cabeçalho do guia */}
                  <div className="flex gap-3 items-center">
                    {selectedGuideDetail.avatar_url ? (
                      <img
                        src={selectedGuideDetail.avatar_url}
                        alt={selectedGuideDetail.full_name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600">
                        {selectedGuideDetail.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {selectedGuideDetail.full_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {selectedGuideDetail.credential}
                      </span>
                      <div className="mt-1">
                        <GuideStatusBadge status={selectedGuideDetail.approval_status} />
                      </div>
                    </div>
                  </div>

                  {/* Info contato */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs">
                    <p className="font-medium text-gray-700 mb-1">Contato</p>
                    <p className="text-gray-700 break-all">E-mail: {selectedGuideDetail.email}</p>
                    <p className="text-gray-700">Telefone: {selectedGuideDetail.phone}</p>
                    <p className="text-gray-700 mt-1">
                      Cidade principal: {selectedGuideDetail.city_name || '-'}
                    </p>
                    <p className="text-gray-700">
                      Idiomas:{' '}
                      {selectedGuideDetail.languages.length > 0
                        ? selectedGuideDetail.languages.join(', ')
                        : '-'}
                    </p>
                  </div>

                  {/* Bio / Endereço */}
                  <div className="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                    <p className="font-medium text-gray-700 mb-1">Bio</p>
                    <p className="text-gray-700">
                      {selectedGuideDetail.bio || 'Sem bio cadastrada.'}
                    </p>

                    <p className="font-medium text-gray-700 mt-3 mb-1">Endereço</p>
                    <p className="text-gray-700">
                      {selectedGuideDetail.address || 'Não informado.'}
                    </p>
                  </div>

                  {/* Avaliação */}
                  <div className="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                    <p className="font-medium text-gray-700 mb-1">Avaliação</p>
                    {selectedGuideDetail.rating_count > 0 ? (
                      <p className="text-gray-700">
                        {selectedGuideDetail.rating_avg.toFixed(1)} ⭐ (
                        {selectedGuideDetail.rating_count} avaliações)
                      </p>
                    ) : (
                      <p className="text-gray-500">Ainda sem avaliações.</p>
                    )}
                  </div>

                  {/* Motivo de reprovação */}
                  {selectedGuideDetail.approval_status === 'rejected' &&
                    selectedGuideDetail.rejection_reason && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs">
                        <p className="font-medium text-red-700 mb-1">Motivo da reprovação</p>
                        <p className="text-red-700">{selectedGuideDetail.rejection_reason}</p>
                      </div>
                    )}

                  {/* Data de aprovação */}
                  {selectedGuideDetail.approved_at && (
                    <div className="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                      <p className="font-medium text-gray-700 mb-1">Aprovado em</p>
                      <p className="text-gray-700">
                        {new Date(selectedGuideDetail.approved_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Ações no rodapé do drawer */}
            <div className="border-t px-4 py-3 flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    if (!selectedGuideDetail) return
                    setResetPasswordModalOpen(true)
                  }}
                  disabled={!selectedGuideDetail}
                >
                  Redefinir senha
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
                  onClick={() => updateApproval('pending')}
                  disabled={!selectedGuideDetail || updateApprovalMutation.isPending}
                >
                  Marcar como pendente
                </button>
                <button
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                  onClick={() => updateApproval('rejected')}
                  disabled={!selectedGuideDetail || updateApprovalMutation.isPending}
                >
                  Reprovar
                </button>
                <button
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-60"
                  onClick={() => updateApproval('approved')}
                  disabled={!selectedGuideDetail || updateApprovalMutation.isPending}
                >
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de reset de senha */}
      <ResetGuidePasswordModal
        guideId={selectedGuideId}
        guideName={selectedGuideName}
        isOpen={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        onSuccess={() => {
          // Opcional: fazer algo após reset de senha
        }}
      />
    </div>
  )
}

