type AppConfig = {
  apiBaseUrl: string
  getAuthToken?: () => string | null
  onUnauthorized?: () => void
}

export const appConfig: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
}

