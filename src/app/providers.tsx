import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { AuthProvider } from '@shared/contexts/AuthContext'
import { ToastContainer } from '@shared/components/Toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} position="right" />}
      </AuthProvider>
    </QueryClientProvider>
  )
}

