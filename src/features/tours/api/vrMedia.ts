import { api } from '@shared/lib/axiosInstance'

/**
 * Tipos para mídia VR 360
 */
export type VrMediaType = 'PHOTO_360' | 'VIDEO_360'

export interface TourVrMediaItem {
  id: string
  tour_id: string
  media_type: VrMediaType
  is_primary: boolean
  expires_in: number
  signed_url: string
  // Campos opcionais que podem vir do backend
  thumbnail_url?: string | null
  poster_url?: string | null
  file_key?: string | null
  created_at?: string
}

export interface ListVrMediaParams {
  media_type?: VrMediaType
  expires_in?: number // 60-3600 segundos
}

/**
 * Serviço para gerenciar mídia VR 360 de tours
 */
export const tourVrMediaService = {
  /**
   * Lista todas as mídias VR de um tour
   */
  list: async (tourId: string, params?: ListVrMediaParams): Promise<TourVrMediaItem[]> => {
    try {
      const response = await api.get<TourVrMediaItem[]>(`/api/v1/tours/${tourId}/vr-media`, {
        params: {
          ...(params?.media_type && { media_type: params.media_type }),
          ...(params?.expires_in && { expires_in: params.expires_in }),
        },
      })
      return response.data
    } catch (error) {
      console.error('Error listing tour VR media:', error)
      throw error
    }
  },


  /**
   * Upload de foto VR 360
   * Reusa o endpoint de fotos com photo_type=vr_360
   */
  uploadPhoto360: async (tourId: string, file: File, options?: { is_primary?: boolean }): Promise<TourVrMediaItem> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('photo_type', 'vr_360')
      if (options?.is_primary !== undefined) {
        formData.append('is_primary', options.is_primary.toString())
      }

      const response = await api.post<TourVrMediaItem>(`/api/v1/tours/${tourId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error uploading VR photo 360:', error)
      throw error
    }
  },

  /**
   * Upload de vídeo VR 360
   * TODO: Implementar quando o endpoint estiver disponível no backend
   */
  uploadVideo360: async (tourId: string, file: File, options?: { is_primary?: boolean }): Promise<TourVrMediaItem> => {
    // TODO: Implementar quando endpoint POST /api/v1/tours/{tour_id}/vr-videos estiver disponível
    // Parâmetros serão usados quando o endpoint estiver disponível
    void tourId
    void file
    void options
    throw new Error('Upload de vídeo VR 360 ainda não está disponível. Aguardando endpoint no backend.')
  },

  /**
   * Deleta mídia VR
   * TODO: Verificar se existe endpoint DELETE /api/v1/tours/{tour_id}/vr-media/{media_id}
   */
  delete: async (tourId: string, mediaId: string): Promise<void> => {
    // Por enquanto, se for foto, tenta deletar via endpoint de fotos
    // Se for vídeo, precisa do endpoint específico
    try {
      await api.delete(`/api/v1/tours/${tourId}/photos/${mediaId}`)
    } catch (error) {
      // Se o endpoint de fotos não funcionar, pode ser vídeo
      // TODO: Adicionar endpoint específico quando disponível
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } }
        if (apiError.response?.status === 404) {
          throw new Error('Endpoint de exclusão de mídia VR não encontrado. Verifique se o item é uma foto ou aguarde implementação no backend.')
        }
      }
      console.error('Error deleting VR media:', error)
      throw error
    }
  },
}

// Exports nomeados para facilitar uso
export const listTourVrMedia = tourVrMediaService.list
export const uploadTourVrPhoto360 = tourVrMediaService.uploadPhoto360
export const uploadTourVrVideo360 = tourVrMediaService.uploadVideo360
export const deleteTourVrMedia = tourVrMediaService.delete

