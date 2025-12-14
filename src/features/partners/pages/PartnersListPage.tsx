import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Filter, Building2 } from 'lucide-react'
import { usePartnersList } from '../../../hooks/useAdminPartners'
import { listCities, type City } from '@features/tours/api'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'

export function PartnersListPage() {
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [cityFilter, setCityFilter] = useState<string>('')
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('')
  const [highlightOnly, setHighlightOnly] = useState<boolean>(false)

  const { data: partners, isLoading } = usePartnersList({
    type: typeFilter || undefined,
    city_id: cityFilter || undefined,
    neighborhood: neighborhoodFilter || undefined,
    highlight_only: highlightOnly || undefined,
  })

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: listCities,
  })

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
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <Input
              id="type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              placeholder="Ex: restaurante, hotel"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <select
              id="city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Todas as cidades</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
              Bairro
            </label>
            <Input
              id="neighborhood"
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              placeholder="Nome do bairro"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={highlightOnly}
                onChange={(e) => setHighlightOnly(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Apenas em destaque</span>
            </label>
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
                    Bairro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destaque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      <div className="text-sm text-gray-900">
                        {cities.find((c) => c.id === partner.city_id)?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.neighborhood || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {partner.highlight_home ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Sim
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/dashboard/partners/${partner.slug}`)}
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
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

