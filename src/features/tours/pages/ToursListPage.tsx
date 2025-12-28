import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, MapPin, Clock, DollarSign } from 'lucide-react'
import { listTours, deleteTour } from '../api'
import { showToast } from '@shared/components/Toast'
import { Button } from '@shared/components/Button'

export function ToursListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: tours, isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: listTours,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      showToast('Tour deletado com sucesso', 'success')
    },
    onError: () => {
      showToast('Erro ao deletar tour', 'error')
    },
  })

  const handleDelete = async (tourId: string, tourTitle: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o tour "${tourTitle}"?`)) {
      deleteMutation.mutate(tourId)
    }
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(cents / 100)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`
    }
    return `${mins}min`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando tours...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tours</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os tours do sistema</p>
        </div>
        <Button onClick={() => navigate('/dashboard/tours/new')}>
          <Plus className="w-4 h-4" />
          Novo Tour
        </Button>
      </div>

      {!tours || tours.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum tour encontrado</h3>
          <p className="text-gray-600 mb-6">Comece criando seu primeiro tour</p>
          <Button onClick={() => navigate('/dashboard/tours/new')}>
            <Plus className="w-4 h-4" />
            Criar Tour
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{tour.title}</h3>
                    {tour.city && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {tour.city.name}, {tour.city.state}
                      </p>
                    )}
                  </div>
                  {tour.has_3d && (
                    <span className="px-2 py-1 bg-primary-100 text-primary text-xs font-medium rounded">
                      3D
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tour.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(tour.duration_minutes)}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatPrice(tour.price_cents, tour.currency)}
                  </div>
                </div>

                {(tour.categories && tour.categories.length > 0) || (tour.tags && tour.tags.length > 0) ? (
                  <div className="mb-4 space-y-2">
                    {tour.categories && tour.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tour.categories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium"
                          >
                            {category.name}
                            {category.icon && <span className="ml-1">{category.icon}</span>}
                          </span>
                        ))}
                      </div>
                    )}
                    {tour.tags && tour.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tour.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/dashboard/tours/${tour.id}/edit`)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(tour.id, tour.title)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

