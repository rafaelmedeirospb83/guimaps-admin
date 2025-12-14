import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { usePartnerDetail, useCreatePartner, useUpdatePartner } from '../../../hooks/useAdminPartners'
import { listCities, type City } from '@features/tours/api'
import { showToast } from '@shared/components/Toast'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'
import type { PartnerCreatePayload, PartnerUpdatePayload } from '../../../types/partners'

export function PartnerFormPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const isEditing = !!slug

  const { data: partnerDetail, isLoading: isLoadingDetail } = usePartnerDetail(slug)
  const createMutation = useCreatePartner()
  const updateMutation = useUpdatePartner(partnerDetail?.partner.id)

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: listCities,
  })

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

  useEffect(() => {
    if (partnerDetail?.partner) {
      const partner = partnerDetail.partner
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
  }, [partnerDetail])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: PartnerCreatePayload | PartnerUpdatePayload = {
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

    if (isEditing && partnerDetail?.partner.id) {
      updateMutation.mutate(payload as PartnerUpdatePayload, {
        onSuccess: () => {
          showToast('Partner atualizado com sucesso', 'success')
          navigate(`/dashboard/partners/${formData.slug || partnerDetail.partner.slug}`)
        },
        onError: () => {
          showToast('Erro ao atualizar partner', 'error')
        },
      })
    } else {
      createMutation.mutate(payload as PartnerCreatePayload, {
        onSuccess: (data) => {
          showToast('Partner criado com sucesso', 'success')
          navigate(`/dashboard/partners/${data.slug}`)
        },
        onError: () => {
          showToast('Erro ao criar partner', 'error')
        },
      })
    }
  }

  if (isLoadingDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/partners')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Partner' : 'Novo Partner'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Atualize as informações do partner' : 'Preencha os dados do novo partner'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="w-full"
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
              placeholder="exemplo-partner"
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
              placeholder="Ex: restaurante, hotel, loja"
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
              rows={4}
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

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
              Latitude
            </label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
              Longitude
            </label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp
            </label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <Input
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
              URL do Logo
            </label>
            <Input
              id="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="avg_ticket_cents" className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Médio (centavos)
            </label>
            <Input
              id="avg_ticket_cents"
              type="number"
              value={formData.avg_ticket_cents}
              onChange={(e) => setFormData((prev) => ({ ...prev, avg_ticket_cents: e.target.value }))}
              min="0"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.highlight_home}
                onChange={(e) => setFormData((prev) => ({ ...prev, highlight_home: e.target.checked }))}
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

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/partners')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Salvar Alterações' : 'Criar Partner'}
          </Button>
        </div>
      </form>
    </div>
  )
}

