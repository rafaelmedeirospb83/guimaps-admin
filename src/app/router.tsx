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
import { UsersListPage } from '@features/users/pages/UsersListPage'
import { UserDetailPage } from '@features/users/pages/UserDetailPage'
import { SettingsLayout } from '@features/settings/pages/SettingsLayout'
import { PaymentsSettingsPage } from '@features/settings/pages/PaymentsSettingsPage'
import { PaymentSplitsPage } from '@features/settings/pages/PaymentSplitsPage'
import { PaymentWebhooksPage } from '@features/settings/pages/PaymentWebhooksPage'
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
        children: [
          {
            index: true,
            element: <UsersListPage />,
          },
          {
            path: ':id',
            element: <UserDetailPage />,
          },
        ],
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
            path: ':id',
            element: <PartnerDetailPage />,
          },
        ],
      },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="payments" replace />,
          },
          {
            path: 'payments',
            element: <PaymentsSettingsPage />,
          },
          {
            path: 'payments/splits',
            element: <PaymentSplitsPage />,
          },
          {
            path: 'payments/webhooks',
            element: <PaymentWebhooksPage />,
          },
        ],
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

