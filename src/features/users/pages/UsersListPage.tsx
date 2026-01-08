import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Eye, Search, Filter, User as UserIcon, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { listUsers, deleteUser } from '../api'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'
import { showToast } from '@shared/components/Toast'

const ITEMS_PER_PAGE = 50

type StatusFilter = 'active' | 'inactive' | 'deleted' | ''

export function UsersListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [createdFromFilter, setCreatedFromFilter] = useState<string>('')
  const [createdToFilter, setCreatedToFilter] = useState<string>('')
  const [offset, setOffset] = useState(0)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', statusFilter, searchQuery, createdFromFilter, createdToFilter, offset],
    queryFn: () =>
      listUsers({
        status: statusFilter || undefined,
        q: searchQuery || undefined,
        created_from: createdFromFilter || undefined,
        created_to: createdToFilter || undefined,
        limit: ITEMS_PER_PAGE,
        offset,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      showToast('Usuário removido com sucesso', 'success')
    },
    onError: (error: unknown) => {
      let message = 'Erro ao remover usuário'
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { detail?: string } } }
        if (apiError.response?.status === 404) {
          message = 'Usuário não encontrado'
        } else if (apiError.response?.data?.detail) {
          message = apiError.response.data.detail
        }
      }
      showToast(message, 'error')
    },
  })

  const handleDelete = (userId: string, userName: string | null) => {
    if (window.confirm(`Tem certeza que deseja remover o usuário ${userName || userId}?`)) {
      deleteMutation.mutate(userId)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOffset(0)
    refetch()
  }

  const handleClearFilters = () => {
    setStatusFilter('')
    setSearchQuery('')
    setCreatedFromFilter('')
    setCreatedToFilter('')
    setOffset(0)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      tourist: 'Turista',
      guide: 'Guia',
      admin: 'Administrador',
    }
    return roleMap[role] || role
  }

  const getRoleBadgeColor = (role: string) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-800'
    if (role === 'guide') return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1
  const hasNextPage = data ? offset + ITEMS_PER_PAGE < data.total : false
  const hasPreviousPage = offset > 0

  const handleNextPage = () => {
    if (hasNextPage) {
      setOffset(offset + ITEMS_PER_PAGE)
    }
  }

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setOffset(Math.max(0, offset - ITEMS_PER_PAGE))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando usuários...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os usuários da plataforma</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nome, email, telefone ou documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="deleted">Removido</option>
              </select>
            </div>

            <div>
              <label htmlFor="created_from" className="block text-sm font-medium text-gray-700 mb-2">
                Criado a partir de
              </label>
              <Input
                id="created_from"
                type="datetime-local"
                value={createdFromFilter}
                onChange={(e) => setCreatedFromFilter(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="created_to" className="block text-sm font-medium text-gray-700 mb-2">
                Criado até
              </label>
              <Input
                id="created_to"
                type="datetime-local"
                value={createdToFilter}
                onChange={(e) => setCreatedToFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" variant="primary">
                Buscar
              </Button>
              <Button type="button" variant="outline" onClick={handleClearFilters}>
                Limpar
              </Button>
            </div>
          </div>
        </form>
      </div>

      {data && data.items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-600">Não há usuários que correspondam aos filtros selecionados.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {data?.items.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.cpf || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            user.is_active
                          )}`}
                        >
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateTime(user.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => navigate(`/dashboard/users/${user.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          {user.is_active && (
                            <Button
                              variant="ghost"
                              onClick={() => handleDelete(user.id, user.name)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.total > ITEMS_PER_PAGE && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {offset + 1} a {Math.min(offset + ITEMS_PER_PAGE, data.total)} de {data.total} usuários
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <div className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

