import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from '@features/auth/pages/LoginPage'
import { DashboardPage } from '@features/dashboard/pages/DashboardPage'
import { ToursListPage } from '@features/tours/pages/ToursListPage'
import { TourFormPage } from '@features/tours/pages/TourFormPage'
import { BookingsListPage } from '@features/bookings/pages/BookingsListPage'
import { BookingDetailPage } from '@features/bookings/pages/BookingDetailPage'
import { PartnersListPage } from '@features/partners/pages/PartnersListPage'
import { PartnerFormPage } from '@features/partners/pages/PartnerFormPage'
import { PartnerDetailPage } from '@features/partners/pages/PartnerDetailPage'
import { GuidesListPage } from '@features/guides/pages/GuidesListPage'
import { ProtectedRoute } from '@shared/components/ProtectedRoute'
import { DashboardLayout } from './layout/DashboardLayout'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600 mt-2">Gerenciamento de usuários em breve...</p>
          </div>
        ),
      },
      {
        path: 'tours',
        children: [
          {
            index: true,
            element: <ToursListPage />,
          },
          {
            path: 'new',
            element: <TourFormPage />,
          },
          {
            path: ':id/edit',
            element: <TourFormPage />,
          },
        ],
      },
      {
        path: 'guides',
        element: <GuidesListPage />,
      },
      {
        path: 'bookings',
        children: [
          {
            index: true,
            element: <BookingsListPage />,
          },
          {
            path: ':id',
            element: <BookingDetailPage />,
          },
        ],
      },
      {
        path: 'partners',
        children: [
          {
            index: true,
            element: <PartnersListPage />,
          },
          {
            path: 'new',
            element: <PartnerFormPage />,
          },
          {
            path: ':slug',
            element: <PartnerDetailPage />,
          },
        ],
      },
      {
        path: 'settings',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-2">Configurações do sistema em breve...</p>
          </div>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-gray-600 mb-4">Página não encontrada</p>
          <a href="/dashboard" className="text-primary hover:underline">
            Voltar ao dashboard
          </a>
        </div>
      </div>
    ),
  },
])

