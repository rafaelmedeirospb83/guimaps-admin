import { Navigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

