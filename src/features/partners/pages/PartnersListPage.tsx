import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Filter, Building2 } from 'lucide-react'
import { usePartnersList } from '../../../hooks/useAdminPartners'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'
import type { PartnerApprovalStatus, PartnerPublic } from '../../../types/partners'

export function PartnersListPage() {
  const navigate = useNavigate()
  const [approvalStatus, setApprovalStatus] = useState<string>('pending')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')

  const { data: partners, isLoading } = usePartnersList({
    approval_status: approvalStatus === 'all' ? undefined : (approvalStatus as PartnerApprovalStatus),
    is_active: activeFilter === 'all' ? undefined : activeFilter === 'active',
    search: search || undefined,
  })

  const getApprovalBadgeClasses = (status?: PartnerPublic['approval_status']) => {
    if (status === 'approved') return 'bg-green-100 text-green-800'
    if (status === 'rejected') return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getApprovalLabel = (status?: PartnerPublic['approval_status']) => {
    if (status === 'approved') return 'Aprovado'
    if (status === 'rejected') return 'Rejeitado'
    return 'Pendente'
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando partners...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partners</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os partners do sistema</p>
        </div>
        <Button onClick={() => navigate('/dashboard/partners/new')}>
          <Plus className="w-4 h-4" />
          Novo Partner
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Busca
            </label>
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome do parceiro"
            />
          </div>

          <div>
            <label htmlFor="approval" className="block text-sm font-medium text-gray-700 mb-2">
              Status de aprovação
            </label>
            <select
              id="approval"
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </div>

          <div>
            <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-2">
              Ativo
            </label>
            <select
              id="is_active"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {!partners || partners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum partner encontrado</h3>
          <p className="text-gray-600 mb-6">Não há partners que correspondam aos filtros selecionados.</p>
          <Button onClick={() => navigate('/dashboard/partners/new')}>
            <Plus className="w-4 h-4" />
            Criar Partner
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status de aprovação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ativo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.city_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalBadgeClasses(
                          partner.approval_status,
                        )}`}
                      >
                        {getApprovalLabel(partner.approval_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {partner.is_active ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(partner.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/dashboard/partners/${partner.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                        Gerenciar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

