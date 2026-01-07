import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Upload, Trash2, Star, Image as ImageIcon } from 'lucide-react'
import { 
  getTourById, 
  createTour, 
  updateTour, 
  listTourPhotos,
  uploadTourPhoto,
  deleteTourPhoto,
  setPrimaryTourPhoto,
  listCities,
  type TourCreateRequest, 
  type TourUpdateRequest
} from '../api'
import { TourTaxonomySelect } from '../components/TourTaxonomySelect'
import { TourVrMediaSection } from '../components/TourVrMediaSection'
import { showToast } from '@shared/components/Toast'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'

export function TourFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const isEditing = !!id

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => getTourById(id!),
    enabled: isEditing,
  })

  const { data: photos = [], refetch: refetchPhotos } = useQuery({
    queryKey: ['tour-photos', id],
    queryFn: () => listTourPhotos(id!),
    enabled: isEditing && !!id,
  })

  const generalPhotos = useMemo(() => {
    return photos.filter((photo) => photo.photo_type === 'general')
  }, [photos])

  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ['cities'],
    queryFn: listCities,
    staleTime: 0,
    refetchOnMount: 'always',
  })


  const createMutation = useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      showToast('Tour criado com sucesso', 'success')
      navigate('/dashboard/tours')
    },
    onError: () => {
      showToast('Erro ao criar tour', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TourUpdateRequest }) => updateTour(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      queryClient.invalidateQueries({ queryKey: ['tour', id] })
      showToast('Tour atualizado com sucesso', 'success')
      navigate('/dashboard/tours')
    },
    onError: () => {
      showToast('Erro ao atualizar tour', 'error')
    },
  })

  const uploadPhotoMutation = useMutation({
    mutationFn: ({ tourId, file, isPrimary }: { tourId: string; file: File; isPrimary?: boolean }) =>
      uploadTourPhoto(tourId, { file, photo_type: 'general', is_primary: isPrimary || false }),
    onSuccess: () => {
      refetchPhotos()
      showToast('Foto adicionada com sucesso', 'success')
    },
    onError: () => {
      showToast('Erro ao adicionar foto', 'error')
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: ({ tourId, photoId }: { tourId: string; photoId: string }) =>
      deleteTourPhoto(tourId, photoId),
    onSuccess: () => {
      refetchPhotos()
      showToast('Foto removida com sucesso', 'success')
    },
    onError: () => {
      showToast('Erro ao remover foto', 'error')
    },
  })

  const setPrimaryMutation = useMutation({
    mutationFn: ({ tourId, photoId }: { tourId: string; photoId: string }) =>
      setPrimaryTourPhoto(tourId, photoId),
    onSuccess: () => {
      refetchPhotos()
      showToast('Foto primária definida com sucesso', 'success')
    },
    onError: () => {
      showToast('Erro ao definir foto primária', 'error')
    },
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: '',
    price_cents: '',
    currency: 'BRL',
    categoryIds: [] as string[],
    tagIds: [] as string[],
    has_3d: false,
    plan_mode: 'flex',
    include: '',
    not_include: '',
    city_id: '',
  })

  useEffect(() => {
    if (!tour) return
    
    setFormData({
      title: tour.title,
      description: tour.description,
      duration_minutes: tour.duration_minutes.toString(),
      price_cents: tour.price_cents.toString(),
      currency: tour.currency,
      categoryIds: tour.categories?.map((c) => c.id) || [],
      tagIds: tour.tags?.map((t) => t.id) || [],
      has_3d: tour.has_3d,
      plan_mode: tour.plan_mode,
      include: tour.include.join(', '),
      not_include: tour.not_include.join(', '),
      city_id: tour.city?.id || '',
    })
  }, [tour])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const includeArray = formData.include
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const notIncludeArray = formData.not_include
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const payload: TourCreateRequest | TourUpdateRequest = {
      title: formData.title,
      description: formData.description,
      duration_minutes: parseInt(formData.duration_minutes, 10),
      price_cents: parseInt(formData.price_cents, 10),
      currency: formData.currency,
      category_ids: formData.categoryIds.length > 0 ? formData.categoryIds : undefined,
      tag_ids: formData.tagIds.length > 0 ? formData.tagIds : undefined,
      has_3d: formData.has_3d,
      plan_mode: formData.plan_mode,
      include: includeArray,
      not_include: notIncludeArray,
      city_id: formData.city_id || null,
    }

    if (isEditing) {
      updateMutation.mutate({ id: id!, data: payload })
    } else {
      createMutation.mutate(payload as TourCreateRequest)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !id) return

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      showToast('Por favor, selecione arquivos de imagem', 'error')
      return
    }

    const isPrimary = photos.length === 0
    imageFiles.forEach((file, index) => {
      const shouldBePrimary = isPrimary && index === 0
      uploadPhotoMutation.mutate({ tourId: id, file, isPrimary: shouldBePrimary })
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDeletePhoto = (photoId: string) => {
    if (!id) return
    if (window.confirm('Tem certeza que deseja remover esta foto?')) {
      deletePhotoMutation.mutate({ tourId: id, photoId })
    }
  }

  const handleSetPrimary = (photoId: string) => {
    if (!id) return
    setPrimaryMutation.mutate({ tourId: id, photoId })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/tours')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Tour' : 'Novo Tour'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Atualize as informações do tour' : 'Preencha os dados do novo tour'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
              className="w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
              Duração (minutos) *
            </label>
            <Input
              id="duration_minutes"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData((prev) => ({ ...prev, duration_minutes: e.target.value }))}
              required
              min="1"
            />
          </div>

          <div>
            <label htmlFor="price_cents" className="block text-sm font-medium text-gray-700 mb-2">
              Preço (centavos) *
            </label>
            <Input
              id="price_cents"
              type="number"
              value={formData.price_cents}
              onChange={(e) => setFormData((prev) => ({ ...prev, price_cents: e.target.value }))}
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Moeda *
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <TourTaxonomySelect
              value={{
                categoryIds: formData.categoryIds,
                tagIds: formData.tagIds,
              }}
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  categoryIds: value.categoryIds,
                  tagIds: value.tagIds,
                }))
              }}
            />
          </div>

          <div>
            <label htmlFor="plan_mode" className="block text-sm font-medium text-gray-700 mb-2">
              Modo de Plano
            </label>
            <select
              id="plan_mode"
              value={formData.plan_mode}
              onChange={(e) => setFormData((prev) => ({ ...prev, plan_mode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="flex">Flex</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.has_3d}
                onChange={(e) => setFormData((prev) => ({ ...prev, has_3d: e.target.checked }))}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Tem experiência 3D</span>
            </label>
          </div>

          <div>
            <label htmlFor="include" className="block text-sm font-medium text-gray-700 mb-2">
              Inclui (separado por vírgula)
            </label>
            <Input
              id="include"
              value={formData.include}
              onChange={(e) => setFormData((prev) => ({ ...prev, include: e.target.value }))}
              placeholder="Ex: Guia, Transporte, Almoço"
            />
          </div>

          <div>
            <label htmlFor="not_include" className="block text-sm font-medium text-gray-700 mb-2">
              Não Inclui (separado por vírgula)
            </label>
            <Input
              id="not_include"
              value={formData.not_include}
              onChange={(e) => setFormData((prev) => ({ ...prev, not_include: e.target.value }))}
              placeholder="Ex: Bebidas, Gorjetas"
            />
          </div>

          <div>
            <label htmlFor="city_id" className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <select
              id="city_id"
              value={formData.city_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, city_id: e.target.value }))}
              disabled={isLoadingCities}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{isLoadingCities ? 'Carregando cidades...' : 'Selecione uma cidade'}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.state} - {city.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isEditing && id && (
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Fotos do Tour</h3>
                <p className="text-sm text-gray-600 mt-1">Gerencie as fotos deste tour</p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploadPhotoMutation.isPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={uploadPhotoMutation.isPending}
                >
                  <Upload className="w-4 h-4" />
                  {uploadPhotoMutation.isPending ? 'Enviando...' : 'Adicionar Fotos'}
                </Button>
              </div>
            </div>

            {generalPhotos.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhuma foto adicionada ainda</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                >
                  <Upload className="w-4 h-4" />
                  Adicionar Fotos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generalPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                  >
                    <img
                      src={photo.url}
                      alt={`Foto do tour ${tour?.title}`}
                      className="w-full h-full object-cover"
                    />
                    {photo.is_primary && (
                      <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Principal
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {!photo.is_primary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(photo.id)}
                          disabled={setPrimaryMutation.isPending}
                          className="p-2 text-white hover:bg-white/20 rounded transition-colors disabled:opacity-50"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        disabled={deletePhotoMutation.isPending}
                        className="p-2 text-white hover:bg-red-600/80 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seção VR 360 */}
        {isEditing && id && <TourVrMediaSection tourId={id} />}

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/tours')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Salvar Alterações' : 'Criar Tour'}
          </Button>
        </div>
      </form>
    </div>
  )
}

