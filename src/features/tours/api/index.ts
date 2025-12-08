import { api } from '@shared/lib/axiosInstance'

export type City = {
  id: string
  name: string
  state: string
  country: string
}

export type Tour = {
  id: string
  slug: string
  title: string
  description: string
  duration_minutes: number
  base_city: string
  price_cents: number
  currency: string
  category?: string | null
  has_3d: boolean
  plan_mode: string
  include: string[]
  not_include: string[]
  rating_avg?: number | null
  rating_count: number
  city?: City | null
}

export type TourCreateRequest = {
  title: string
  description: string
  duration_minutes: number
  base_city: string
  price_cents: number
  currency: string
  category?: string | null
  has_3d?: boolean
  plan_mode?: string
  include?: string[]
  not_include?: string[]
  city_id?: string | null
}

export type TourUpdateRequest = {
  title?: string
  description?: string
  duration_minutes?: number
  base_city?: string
  price_cents?: number
  currency?: string
  category?: string | null
  has_3d?: boolean
  plan_mode?: string
  include?: string[]
  not_include?: string[]
  city_id?: string | null
}

export const toursService = {
  list: async (): Promise<Tour[]> => {
    try {
      const response = await api.get<Tour[]>('/api/v1/tours')
      return response.data
    } catch (error) {
      console.error('Error listing tours:', error)
      throw error
    }
  },

  getById: async (tourId: string): Promise<Tour> => {
    try {
      const response = await api.get<Tour>(`/api/v1/tours/${tourId}`)
      return response.data
    } catch (error) {
      console.error('Error getting tour:', error)
      throw error
    }
  },

  create: async (data: TourCreateRequest): Promise<Tour> => {
    try {
      const response = await api.post<Tour>('/api/v1/tours', data)
      return response.data
    } catch (error) {
      console.error('Error creating tour:', error)
      throw error
    }
  },

  update: async (tourId: string, data: TourUpdateRequest): Promise<Tour> => {
    try {
      const response = await api.put<Tour>(`/api/v1/tours/${tourId}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating tour:', error)
      throw error
    }
  },

  delete: async (tourId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/tours/${tourId}`)
    } catch (error) {
      console.error('Error deleting tour:', error)
      throw error
    }
  },
}

export type TourPhoto = {
  id: string
  tour_id: string
  url: string
  file_key?: string | null
  photo_type: string
  is_primary: boolean
}

export type TourPhotoUploadRequest = {
  file: File
  photo_type?: string
  is_primary?: boolean
}

export const tourPhotosService = {
  list: async (tourId: string): Promise<TourPhoto[]> => {
    try {
      const response = await api.get<TourPhoto[]>(`/api/v1/tours/${tourId}/photos`)
      return response.data
    } catch (error) {
      console.error('Error listing tour photos:', error)
      throw error
    }
  },

  upload: async (tourId: string, data: TourPhotoUploadRequest): Promise<TourPhoto> => {
    try {
      const formData = new FormData()
      formData.append('file', data.file)
      if (data.photo_type) {
        formData.append('photo_type', data.photo_type)
      }
      if (data.is_primary !== undefined) {
        formData.append('is_primary', data.is_primary.toString())
      }
      const response = await api.post<TourPhoto>(`/api/v1/tours/${tourId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error uploading tour photo:', error)
      throw error
    }
  },

  delete: async (tourId: string, photoId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/tours/${tourId}/photos/${photoId}`)
    } catch (error) {
      console.error('Error deleting tour photo:', error)
      throw error
    }
  },

  setPrimary: async (tourId: string, photoId: string): Promise<TourPhoto> => {
    try {
      const response = await api.put<TourPhoto>(`/api/v1/tours/${tourId}/photos/${photoId}/set-primary`)
      return response.data
    } catch (error) {
      console.error('Error setting primary photo:', error)
      throw error
    }
  },
}

export const listTours = toursService.list
export const getTourById = toursService.getById
export const createTour = toursService.create
export const updateTour = toursService.update
export const deleteTour = toursService.delete
export const listTourPhotos = tourPhotosService.list
export const uploadTourPhoto = tourPhotosService.upload
export const deleteTourPhoto = tourPhotosService.delete
export const setPrimaryTourPhoto = tourPhotosService.setPrimary

