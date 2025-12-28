import { api } from '@shared/lib/axiosInstance'
import type { CategoryTour, TagTour } from '../types/taxonomy'

/**
 * Serviços para taxonomia de tours (categorias e tags)
 */

export const taxonomyService = {
  /**
   * Lista todas as categorias de tours
   * @param includeInactive - Incluir categorias inativas (default: false)
   */
  listCategories: async (includeInactive = false): Promise<CategoryTour[]> => {
    try {
      const response = await api.get<CategoryTour[]>('/api/v1/admin/tours/categories', {
        params: {
          include_inactive: includeInactive,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error listing tour categories:', error)
      throw error
    }
  },

  /**
   * Lista todas as tags de tours
   * @param group - Filtrar por grupo (mood, audience, time, profile)
   * @param includeInactive - Incluir tags inativas (default: false)
   */
  listTags: async (group?: string | null, includeInactive = false): Promise<TagTour[]> => {
    try {
      const response = await api.get<TagTour[]>('/api/v1/admin/tours/tags', {
        params: {
          ...(group ? { group } : {}),
          include_inactive: includeInactive,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error listing tour tags:', error)
      throw error
    }
  },
}

export const listTourCategories = taxonomyService.listCategories
export const listTourTags = taxonomyService.listTags

