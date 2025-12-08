import axios, { AxiosError } from 'axios'

import { appConfig } from '@shared/config/appConfig'
import { showToast } from '@shared/components/Toast'

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('guimaps_admin_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(error)
    }

    if (error.response.status === 401) {
      localStorage.removeItem('guimaps_admin_access_token')
      localStorage.removeItem('guimaps_admin_refresh_token')
      localStorage.removeItem('guimaps_admin_user')
      const currentPath = window.location.pathname
      if (!currentPath.includes('/login')) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    const errorData = error.response?.data as { message?: string } | undefined
    const message = errorData?.message || error.message
    if (message) {
      setTimeout(() => {
        showToast(message, 'error')
      }, 100)
    }

    return Promise.reject(error)
  }
)

export default api

