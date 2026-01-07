import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Image as ImageIcon, Video, AlertCircle } from 'lucide-react'
import {
  listTourVrMedia,
  uploadTourVrPhoto360,
  uploadTourVrVideo360,
  deleteTourVrMedia,
  type VrMediaType,
  type TourVrMediaItem,
} from '../api/vrMedia'
import { VrMediaCard } from './VrMediaCard'
import { VrMediaPreviewModal } from './VrMediaPreviewModal'
import { Button } from '@shared/components/Button'
import { showToast } from '@shared/components/Toast'

interface Props {
  tourId: string
}

/**
 * Seção completa para gerenciar mídia VR 360 do tour
 * - Tabs para Foto 360 e Vídeo 360
 * - Grid de cards
 * - Upload e ações
 */
export function TourVrMediaSection({ tourId }: Props) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<VrMediaType>('PHOTO_360')
  const [previewMedia, setPreviewMedia] = useState<TourVrMediaItem | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const photoFileInputRef = useRef<HTMLInputElement>(null)
  const videoFileInputRef = useRef<HTMLInputElement>(null)

  // Listar mídia VR (expires_in = 600s para evitar URLs expiradas durante navegação)
  const { data: vrMediaList = [], isLoading: isLoadingList, refetch: refetchList } = useQuery({
    queryKey: ['tour-vr-media', tourId, activeTab],
    queryFn: () => listTourVrMedia(tourId, { media_type: activeTab, expires_in: 600 }),
    enabled: !!tourId,
  })

  // Filtrar apenas o tipo ativo
  const activeMediaList = vrMediaList.filter((item) => item.media_type === activeTab)

  // Upload de foto 360
  const uploadPhotoMutation = useMutation({
    mutationFn: ({ file, isPrimary }: { file: File; isPrimary?: boolean }) =>
      uploadTourVrPhoto360(tourId, file, { is_primary: isPrimary }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-vr-media', tourId] })
      showToast('Foto 360° enviada com sucesso', 'success')
      if (photoFileInputRef.current) {
        photoFileInputRef.current.value = ''
      }
    },
    onError: (error: unknown) => {
      let message = 'Erro ao enviar foto 360°'
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } }; message?: string }
        message = apiError.response?.data?.message || apiError.message || message
      } else if (error && typeof error === 'object' && 'message' in error) {
        message = String((error as { message: unknown }).message) || message
      }
      showToast(message, 'error')
    },
  })

  // Upload de vídeo 360 (quando disponível)
  const uploadVideoMutation = useMutation({
    mutationFn: ({ file, isPrimary }: { file: File; isPrimary?: boolean }) =>
      uploadTourVrVideo360(tourId, file, { is_primary: isPrimary }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-vr-media', tourId] })
      showToast('Vídeo 360° enviado com sucesso', 'success')
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = ''
      }
    },
    onError: (error: unknown) => {
      let message = 'Erro ao enviar vídeo 360°'
      if (error && typeof error === 'object' && 'message' in error) {
        message = String((error as { message: unknown }).message) || message
      } else if (error instanceof Error) {
        message = error.message
      }
      if (message.includes('não está disponível') || message.includes('endpoint')) {
        showToast('Upload de vídeo 360° ainda não está disponível. Aguardando endpoint no backend.', 'warning')
      } else {
        showToast(message, 'error')
      }
    },
  })

  // Delete mídia VR
  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => deleteTourVrMedia(tourId, mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-vr-media', tourId] })
      showToast('Mídia VR excluída com sucesso', 'success')
    },
    onError: (error: unknown) => {
      let message = 'Erro ao excluir mídia VR'
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } }; message?: string }
        message = apiError.response?.data?.message || apiError.message || message
      } else if (error && typeof error === 'object' && 'message' in error) {
        message = String((error as { message: unknown }).message) || message
      }
      showToast(message, 'error')
    },
  })

  // Handlers
  const handlePhotoUpload = () => {
    photoFileInputRef.current?.click()
  }

  const handleVideoUpload = () => {
    videoFileInputRef.current?.click()
  }

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem', 'error')
      return
    }

    const isPrimary = activeMediaList.length === 0
    uploadPhotoMutation.mutate({ file, isPrimary })
  }

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      showToast('Por favor, selecione um arquivo de vídeo', 'error')
      return
    }

    const isPrimary = activeMediaList.length === 0
    uploadVideoMutation.mutate({ file, isPrimary })
  }

  const handlePreview = async (mediaItem: TourVrMediaItem) => {
    setIsLoadingPreview(true)
    setPreviewMedia(null)

    try {
      const updatedList = await refetchList()
      const updatedItem = updatedList.data?.find((item) => item.id === mediaItem.id)
      setPreviewMedia(updatedItem || mediaItem)
    } catch (error) {
      console.error('Erro ao carregar preview:', error)
      setPreviewMedia(mediaItem)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleDelete = (mediaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta mídia VR?')) {
      deleteMutation.mutate(mediaId)
    }
  }

  const handleSetPrimary = async (mediaId: string) => {
    // Para foto 360, podemos reutilizar o endpoint de set-primary de fotos
    // Por enquanto, vamos sugerir reupload como primário ou aguardar endpoint específico
    // Parâmetro será usado quando a funcionalidade for implementada
    void mediaId
    showToast('Funcionalidade em desenvolvimento. Por favor, faça upload novamente marcando como principal.', 'info')
  }

  const isVideoUploadAvailable = false // TODO: Verificar se endpoint de vídeo existe

  return (
    <div className="pt-6 border-t border-gray-200">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">VR 360 (Marketing)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Suba uma foto 360° e/ou vídeo 360°. O painel usa URLs assinadas temporárias (expiram em minutos).
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('PHOTO_360')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'PHOTO_360'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Foto 360°
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('VIDEO_360')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'VIDEO_360'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Video className="w-4 h-4 inline mr-2" />
            Vídeo 360°
          </button>
        </div>
      </div>

      {/* Conteúdo da Tab Ativa */}
      <div>
        {/* Botão de Upload */}
        <div className="flex items-center justify-end mb-4">
          {activeTab === 'PHOTO_360' ? (
            <>
              <input
                ref={photoFileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFileSelect}
                className="hidden"
                disabled={uploadPhotoMutation.isPending}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handlePhotoUpload}
                disabled={uploadPhotoMutation.isPending}
              >
                <Upload className="w-4 h-4" />
                {uploadPhotoMutation.isPending ? 'Enviando...' : 'Adicionar Foto 360°'}
              </Button>
            </>
          ) : (
            <>
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoFileSelect}
                className="hidden"
                disabled={uploadVideoMutation.isPending || !isVideoUploadAvailable}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleVideoUpload}
                disabled={uploadVideoMutation.isPending || !isVideoUploadAvailable}
                title={!isVideoUploadAvailable ? 'Aguardando endpoint no backend' : undefined}
              >
                <Upload className="w-4 h-4" />
                {uploadVideoMutation.isPending ? 'Enviando...' : 'Adicionar Vídeo 360°'}
              </Button>
              {!isVideoUploadAvailable && (
                <div className="ml-2 flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>Aguardando endpoint</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Grid de Cards */}
        {isLoadingList ? (
          <div className="text-center py-8 text-gray-500">Carregando mídia VR...</div>
        ) : activeMediaList.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            {activeTab === 'PHOTO_360' ? (
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            ) : (
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            )}
            <p className="text-gray-600 mb-4">
              Nenhuma {activeTab === 'PHOTO_360' ? 'foto' : 'vídeo'} 360° adicionada ainda
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={activeTab === 'PHOTO_360' ? handlePhotoUpload : handleVideoUpload}
              disabled={activeTab === 'VIDEO_360' && !isVideoUploadAvailable}
            >
              <Upload className="w-4 h-4" />
              Adicionar {activeTab === 'PHOTO_360' ? 'Foto' : 'Vídeo'} 360°
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeMediaList.map((mediaItem) => (
              <VrMediaCard
                key={mediaItem.id}
                mediaItem={mediaItem}
                mediaType={activeTab}
                onSetPrimary={() => handleSetPrimary(mediaItem.id)}
                onDelete={() => handleDelete(mediaItem.id)}
                onPreview={() => handlePreview(mediaItem)}
                isSettingPrimary={false}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      <VrMediaPreviewModal
        isOpen={!!previewMedia}
        onClose={() => setPreviewMedia(null)}
        mediaItem={previewMedia}
        mediaType={activeTab}
        isLoading={isLoadingPreview}
      />
    </div>
  )
}

