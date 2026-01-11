import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Star,
  Image as ImageIcon,
  Plus,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react'
import {
  usePartnerDetail,
  useUpdatePartner,
  usePartnerPhotos,
  useUploadPartnerPhoto,
  useUpdatePartnerPhoto,
  useDeletePartnerPhoto,
  usePartnerToursAdmin,
  useAddTourToPartner,
  useUpdatePartnerTour,
  useDeletePartnerTour,
  useCreateAffiliateLink,
  usePartnerCommissions,
  usePayPartnerCommission,
  useUpdatePartnerApproval,
} from '../../../hooks/useAdminPartners'
import { listTours, listCities, type City, type Tour } from '@features/tours/api'
import { showToast } from '@shared/components/Toast'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'
import type {
  PartnerUpdatePayload,
  PartnerPhotoCreatePayload,
  PartnerApprovalStatus,
} from '../../../types/partners'

export function PartnerDetailPage() {
  const { id: partnerId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: partner, isLoading: isLoadingDetail } = usePartnerDetail(partnerId)

  const updateMutation = useUpdatePartner(partnerId)
  const approvalMutation = useUpdatePartnerApproval(partnerId)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fotos
  const { data: photos = [] } = usePartnerPhotos(partnerId)
  const uploadPhotoMutation = useUploadPartnerPhoto(partnerId)
  const updatePhotoMutation = useUpdatePartnerPhoto()
  const deletePhotoMutation = useDeletePartnerPhoto()

  // Tours
  const { data: partnerTours = [] } = usePartnerToursAdmin(partnerId)
  const addTourMutation = useAddTourToPartner(partnerId)
  const updateTourMutation = useUpdatePartnerTour()
  const deleteTourMutation = useDeletePartnerTour()

  // Tours disponíveis para adicionar
  const { data: availableTours = [] } = useQuery<Tour[]>({
    queryKey: ['tours'],
    queryFn: listTours,
  })

  // Cidades
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: listCities,
  })

  // Affiliate links
  const createAffiliateLinkMutation = useCreateAffiliateLink(partnerId)

  // Commissions
  const { data: commissionsData } = usePartnerCommissions(partnerId)
  const payCommissionMutation = usePayPartnerCommission()

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: '',
    description: '',
    city_id: '',
    address: '',
    neighborhood: '',
    latitude: '',
    longitude: '',
    whatsapp: '',
    phone: '',
    instagram: '',
    website_url: '',
    logo_url: '',
    avg_ticket_cents: '',
    highlight_home: false,
    is_active: true,
  })

  const [showAddTourModal, setShowAddTourModal] = useState(false)
  const [selectedTourId, setSelectedTourId] = useState('')
  const [tourPriority, setTourPriority] = useState('')

  const [showAffiliateLinkModal, setShowAffiliateLinkModal] = useState(false)
  const [affiliateLinkData, setAffiliateLinkData] = useState({
    code: '',
    tour_id: '',
    landing_path: '',
    commission_type: 'percent' as 'percent' | 'fixed',
    commission_percent: '',
    commission_cents: '',
    max_uses: '',
    expires_at: '',
    is_active: true,
  })

  // Preencher form quando partner carregar
  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        slug: partner.slug,
        type: partner.type,
        description: partner.description || '',
        city_id: partner.city_id || '',
        address: partner.address || '',
        neighborhood: partner.neighborhood || '',
        latitude: partner.latitude?.toString() || '',
        longitude: partner.longitude?.toString() || '',
        whatsapp: partner.whatsapp || '',
        phone: partner.phone || '',
        instagram: partner.instagram || '',
        website_url: partner.website_url || '',
        logo_url: partner.logo_url || '',
        avg_ticket_cents: partner.avg_ticket_cents?.toString() || '',
        highlight_home: partner.highlight_home,
        is_active: partner.is_active,
      })
    }
  }, [partner])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: PartnerUpdatePayload = {
      name: formData.name,
      slug: formData.slug || null,
      type: formData.type,
      description: formData.description || null,
      city_id: formData.city_id || null,
      address: formData.address || null,
      neighborhood: formData.neighborhood || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      whatsapp: formData.whatsapp || null,
      phone: formData.phone || null,
      instagram: formData.instagram || null,
      website_url: formData.website_url || null,
      logo_url: formData.logo_url || null,
      avg_ticket_cents: formData.avg_ticket_cents
        ? parseInt(formData.avg_ticket_cents, 10)
        : null,
      highlight_home: formData.highlight_home,
      is_active: formData.is_active,
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        showToast('Partner atualizado com sucesso', 'success')
      },
      onError: () => {
        showToast('Erro ao atualizar partner', 'error')
      },
    })
  }

  // Fotos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !partnerId) return

    const file = files[0]
    const isPrimary = photos.length === 0

    const payload: PartnerPhotoCreatePayload = {
      is_primary: isPrimary,
      sort_order: photos.length,
    }

    uploadPhotoMutation.mutate(
      { file, payload },
      {
        onSuccess: () => {
          showToast('Foto adicionada com sucesso', 'success')
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        },
        onError: () => {
          showToast('Erro ao adicionar foto', 'error')
        },
      },
    )
  }

  const handleSetPrimary = (photoId: string) => {
    updatePhotoMutation.mutate(
      { photoId, payload: { is_primary: true } },
      {
        onSuccess: () => {
          showToast('Foto principal definida com sucesso', 'success')
        },
        onError: () => {
          showToast('Erro ao definir foto principal', 'error')
        },
      },
    )
  }

  const handleDeletePhoto = (photoId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta foto?')) {
      deletePhotoMutation.mutate(photoId, {
        onSuccess: () => {
          showToast('Foto removida com sucesso', 'success')
        },
        onError: () => {
          showToast('Erro ao remover foto', 'error')
        },
      })
    }
  }

  const handleMovePhoto = (photoId: string, direction: 'up' | 'down') => {
    const photo = photos.find((p) => p.id === photoId)
    if (!photo) return

    const currentIndex = photos.findIndex((p) => p.id === photoId)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= photos.length) return

    const targetPhoto = photos[newIndex]
    const newSortOrder = targetPhoto.sort_order

    updatePhotoMutation.mutate(
      { photoId, payload: { sort_order: newSortOrder } },
      {
        onSuccess: () => {
          showToast('Ordem atualizada com sucesso', 'success')
        },
      },
    )
  }

  // Tours
  const handleAddTour = () => {
    if (!selectedTourId || !partnerId) return

    addTourMutation.mutate(
      {
        tour_id: selectedTourId,
        priority: tourPriority ? parseInt(tourPriority, 10) : undefined,
      },
      {
        onSuccess: () => {
          showToast('Tour adicionado com sucesso', 'success')
          setShowAddTourModal(false)
          setSelectedTourId('')
          setTourPriority('')
        },
        onError: () => {
          showToast('Erro ao adicionar tour', 'error')
        },
      },
    )
  }

  const handleUpdateTourPriority = (partnerTourId: string, newPriority: number) => {
    updateTourMutation.mutate(
      { partnerTourId, payload: { priority: newPriority } },
      {
        onSuccess: () => {
          showToast('Prioridade atualizada com sucesso', 'success')
        },
      },
    )
  }

  const handleDeleteTour = (partnerTourId: string, tourTitle: string) => {
    if (window.confirm(`Tem certeza que deseja remover o tour "${tourTitle}"?`)) {
      deleteTourMutation.mutate(partnerTourId, {
        onSuccess: () => {
          showToast('Tour removido com sucesso', 'success')
        },
        onError: () => {
          showToast('Erro ao remover tour', 'error')
        },
      })
    }
  }

  // Affiliate links
  const handleCreateAffiliateLink = () => {
    if (!partnerId) return

    createAffiliateLinkMutation.mutate(
      {
        code: affiliateLinkData.code,
        tour_id: affiliateLinkData.tour_id || null,
        landing_path: affiliateLinkData.landing_path,
        commission_type: affiliateLinkData.commission_type,
        commission_percent:
          affiliateLinkData.commission_percent && affiliateLinkData.commission_type === 'percent'
            ? parseFloat(affiliateLinkData.commission_percent)
            : null,
        commission_cents:
          affiliateLinkData.commission_cents && affiliateLinkData.commission_type === 'fixed'
            ? parseInt(affiliateLinkData.commission_cents, 10)
            : null,
        max_uses: affiliateLinkData.max_uses ? parseInt(affiliateLinkData.max_uses, 10) : null,
        expires_at: affiliateLinkData.expires_at || null,
        is_active: affiliateLinkData.is_active,
      },
      {
        onSuccess: () => {
          showToast('Link de afiliado criado com sucesso', 'success')
          setShowAffiliateLinkModal(false)
          setAffiliateLinkData({
            code: '',
            tour_id: '',
            landing_path: '',
            commission_type: 'percent',
            commission_percent: '',
            commission_cents: '',
            max_uses: '',
            expires_at: '',
            is_active: true,
          })
        },
        onError: () => {
          showToast('Erro ao criar link de afiliado', 'error')
        },
      },
    )
  }

  // Commissions
  const handlePayCommission = (commissionId: string) => {
    payCommissionMutation.mutate(
      { commissionId, payload: { paid_at: new Date().toISOString() } },
      {
        onSuccess: () => {
          showToast('Comissão marcada como paga', 'success')
        },
        onError: () => {
          showToast('Erro ao marcar comissão como paga', 'error')
        },
      },
    )
  }

  const handleApprove = () => {
    approvalMutation.mutate(
      { approval_status: 'approved' },
      {
        onSuccess: () => {
          showToast('Parceiro aprovado com sucesso', 'success')
        },
        onError: () => {
          showToast('Erro ao aprovar parceiro', 'error')
        },
      },
    )
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showToast('Informe o motivo da rejeição', 'error')
      return
    }
    approvalMutation.mutate(
      { approval_status: 'rejected', rejection_reason: rejectionReason },
      {
        onSuccess: () => {
          showToast('Parceiro rejeitado', 'success')
          setShowRejectModal(false)
          setRejectionReason('')
        },
        onError: () => {
          showToast('Erro ao rejeitar parceiro', 'error')
        },
      },
    )
  }

  const handleSetPending = () => {
    approvalMutation.mutate(
      { approval_status: 'pending' },
      {
        onSuccess: () => {
          showToast('Parceiro voltou para pendente', 'success')
        },
        onError: () => {
          showToast('Erro ao alterar status', 'error')
        },
      },
    )
  }

  const getApprovalBadgeClasses = (status?: PartnerApprovalStatus) => {
    if (status === 'approved') return 'bg-green-100 text-green-800'
    if (status === 'rejected') return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getApprovalLabel = (status?: PartnerApprovalStatus) => {
    if (status === 'approved') return 'Aprovado'
    if (status === 'rejected') return 'Rejeitado'
    return 'Pendente'
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoadingDetail || !partner) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando detalhes do partner...</div>
      </div>
    )
  }

  const sortedPhotos = [...photos].sort((a, b) => a.sort_order - b.sort_order)
  const sortedPartnerTours = [...partnerTours].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/partners')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{partner.name}</h1>
          <p className="text-gray-600 mt-1">Slug: {partner.slug}</p>
        </div>
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getApprovalBadgeClasses(
            partner.approval_status,
          )}`}
        >
          {getApprovalLabel(partner.approval_status)}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status de Aprovação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-600">Status atual:</span>{' '}
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalBadgeClasses(
                partner.approval_status,
              )}`}
            >
              {getApprovalLabel(partner.approval_status)}
            </span>
          </div>
          {partner.approved_at && (
            <div>
              <span className="text-sm text-gray-600">Aprovado em:</span>{' '}
              <span className="text-sm font-medium text-gray-900">{formatDate(partner.approved_at)}</span>
            </div>
          )}
          {partner.rejection_reason && (
            <div className="md:col-span-2">
              <span className="text-sm text-gray-600">Motivo da rejeição:</span>{' '}
              <span className="text-sm font-medium text-red-600">{partner.rejection_reason}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          {partner.approval_status !== 'approved' && (
            <Button
              onClick={handleApprove}
              disabled={approvalMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Aprovar Parceiro
            </Button>
          )}
          {partner.approval_status !== 'rejected' && (
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(true)}
              disabled={approvalMutation.isPending}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Rejeitar Parceiro
            </Button>
          )}
          {partner.approval_status !== 'pending' && (
            <Button
              variant="outline"
              onClick={handleSetPending}
              disabled={approvalMutation.isPending}
            >
              Voltar para Pendente
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form de edição */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Partner</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione uma cidade</option>
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
                  value={formData.neighborhood}
                  onChange={(e) => setFormData((prev) => ({ ...prev, neighborhood: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.highlight_home}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, highlight_home: e.target.checked }))
                    }
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Destaque na home</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Ativo</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 mt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </Button>
            </div>
          </form>

          {/* Tours do partner */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tours deste Partner</h2>
              <Button
                variant="outline"
                onClick={() => setShowAddTourModal(true)}
              >
                <Plus className="w-4 h-4" />
                Adicionar Tour
              </Button>
            </div>

            {sortedPartnerTours.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Nenhum tour adicionado ainda</p>
            ) : (
              <div className="space-y-2">
                {sortedPartnerTours.map((partnerTour, index) => (
                  <div
                    key={partnerTour.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{partnerTour.tour_title}</div>
                      <div className="text-sm text-gray-600">
                        {formatPrice(partnerTour.tour_price_cents)} • {partnerTour.tour_duration_minutes} min
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Prioridade: {partnerTour.priority}</span>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleUpdateTourPriority(partnerTour.id, partnerTour.priority - 1)
                        }
                        disabled={index === 0}
                        className="p-1"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleUpdateTourPriority(partnerTour.id, partnerTour.priority + 1)
                        }
                        disabled={index === sortedPartnerTours.length - 1}
                        className="p-1"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteTour(partnerTour.id, partnerTour.tour_title)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Fotos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Fotos</h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPhotoMutation.isPending}
                className="text-sm"
              >
                <Upload className="w-4 h-4" />
                Adicionar
              </Button>
            </div>

            {sortedPhotos.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Nenhuma foto adicionada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Foto do partner'}
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
                          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                          title="Definir como principal"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(photo.id, 'up')}
                          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                      {index < sortedPhotos.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(photo.id, 'down')}
                          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-2 text-white hover:bg-red-600/80 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Affiliate Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Links de Afiliado</h2>
              <Button
                variant="outline"
                onClick={() => setShowAffiliateLinkModal(true)}
                className="text-sm"
              >
                <Plus className="w-4 h-4" />
                Novo Link
              </Button>
            </div>
            <p className="text-sm text-gray-600">Funcionalidade em desenvolvimento</p>
          </div>

          {/* Commissions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comissões</h2>
            {commissionsData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Pendente</div>
                    <div className="font-semibold text-gray-900">
                      {formatPrice(commissionsData.total_pending_cents)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Pago</div>
                    <div className="font-semibold text-green-600">
                      {formatPrice(commissionsData.total_paid_cents)}
                    </div>
                  </div>
                </div>
                {commissionsData.commissions.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {commissionsData.commissions.map((commission) => (
                      <div
                        key={commission.id}
                        className="p-3 border border-gray-200 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{formatPrice(commission.commission_cents)}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              commission.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {commission.status}
                          </span>
                        </div>
                        <div className="text-gray-600 text-xs">{formatDate(commission.created_at)}</div>
                        {commission.status !== 'paid' && (
                          <Button
                            variant="outline"
                            className="mt-2 w-full text-sm"
                            onClick={() => handlePayCommission(commission.id)}
                          >
                            Marcar como paga
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Carregando comissões...</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Adicionar Tour */}
      {showAddTourModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Tour</h3>
              <button
                onClick={() => setShowAddTourModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tour</label>
                <select
                  value={selectedTourId}
                  onChange={(e) => setSelectedTourId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione um tour</option>
                  {availableTours
                    .filter((tour) => !partnerTours.some((pt) => pt.tour_id === tour.id))
                    .map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.title}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                <Input
                  type="number"
                  value={tourPriority}
                  onChange={(e) => setTourPriority(e.target.value)}
                  placeholder="Menor número = maior prioridade"
                />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddTourModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleAddTour}
                  disabled={!selectedTourId || addTourMutation.isPending}
                  className="flex-1"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Affiliate Link */}
      {showAffiliateLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Novo Link de Afiliado</h3>
              <button
                onClick={() => setShowAffiliateLinkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                <Input
                  value={affiliateLinkData.code}
                  onChange={(e) =>
                    setAffiliateLinkData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Landing Path *</label>
                <Input
                  value={affiliateLinkData.landing_path}
                  onChange={(e) =>
                    setAffiliateLinkData((prev) => ({ ...prev, landing_path: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Comissão</label>
                <select
                  value={affiliateLinkData.commission_type}
                  onChange={(e) =>
                    setAffiliateLinkData((prev) => ({
                      ...prev,
                      commission_type: e.target.value as 'percent' | 'fixed',
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="percent">Percentual</option>
                  <option value="fixed">Valor Fixo</option>
                </select>
              </div>
              {affiliateLinkData.commission_type === 'percent' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percentual de Comissão
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={affiliateLinkData.commission_percent}
                    onChange={(e) =>
                      setAffiliateLinkData((prev) => ({ ...prev, commission_percent: e.target.value }))
                    }
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comissão (centavos)
                  </label>
                  <Input
                    type="number"
                    value={affiliateLinkData.commission_cents}
                    onChange={(e) =>
                      setAffiliateLinkData((prev) => ({ ...prev, commission_cents: e.target.value }))
                    }
                  />
                </div>
              )}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAffiliateLinkModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateAffiliateLink}
                  disabled={createAffiliateLinkMutation.isPending}
                  className="flex-1"
                >
                  Criar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rejeitar Parceiro</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da rejeição *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Informe o motivo da rejeição"
                />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectionReason('')
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleReject}
                  disabled={approvalMutation.isPending || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Rejeitar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

