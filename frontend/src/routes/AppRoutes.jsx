import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

// Owner & Manager Dashboard Pages
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage'
import PropertiesPage from '../pages/owner/PropertiesPage'
import AddPropertyPage from '../pages/owner/AddPropertyPage'
import PropertyDetailsPage from '../pages/owner/PropertyDetailsPage'
import EditPropertyPage from '../pages/owner/EditPropertyPage'
import ApplicationsPage from '../pages/owner/ApplicationsPage'
import ApplicationDetailsPage from '../pages/owner/ApplicationDetailsPage'
import PaymentsPage from '../pages/owner/PaymentsPage'
import PaymentDetailsPage from '../pages/owner/PaymentDetailsPage'
import MaintenancePage from '../pages/owner/MaintenancePage'
import MaintenanceDetailsPage from '../pages/owner/MaintenanceDetailsPage'
import ReportsPage from '../pages/owner/ReportsPage'
import AIInsightsPage from '../pages/owner/AIInsightsPage'

// Tenant Dashboard Pages
import TenantDashboardPage from '../pages/tenant/TenantDashboardPage'
import TenantApplicationsPage from '../pages/tenant/TenantApplicationsPage'
import SubmitApplicationPage from '../pages/tenant/SubmitApplicationPage'

// UI Showcase Page
import UIShowcasePage from '../pages/UIShowcasePage'

// Route Guards
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

/**
 * Root Redirector: Sends authenticated user to their role dashboard or /login
 * Note: Manager goes to /owner/dashboard temporarily per requirements
 */
function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const destination =
    user.role === 'owner' || user.role === 'manager'
      ? '/owner/dashboard'
      : '/tenant/dashboard'

  return <Navigate to={destination} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root entry */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Standalone UI Component Showcase */}
      <Route path="/ui-showcase" element={<UIShowcasePage />} />

      {/* Protected Owner & Manager Routes */}
      <Route
        path="/owner/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole={['owner', 'manager']}>
              <Routes>
                <Route path="dashboard" element={<OwnerDashboardPage />} />
                <Route path="properties" element={<PropertiesPage />} />
                <Route path="properties/add" element={<AddPropertyPage />} />
                <Route path="properties/:id" element={<PropertyDetailsPage />} />
                <Route path="properties/:id/edit" element={<EditPropertyPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="applications/:id" element={<ApplicationDetailsPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="payments/:id" element={<PaymentDetailsPage />} />
                <Route path="maintenance" element={<MaintenancePage />} />
                <Route path="maintenance/:id" element={<MaintenanceDetailsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="ai-insights" element={<AIInsightsPage />} />
                <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
              </Routes>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Protected Tenant Routes */}
      <Route
        path="/tenant/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="tenant">
              <Routes>
                <Route path="dashboard" element={<TenantDashboardPage />} />
                <Route path="applications" element={<TenantApplicationsPage />} />
                <Route path="applications/new" element={<SubmitApplicationPage />} />
                <Route path="*" element={<Navigate to="/tenant/dashboard" replace />} />
              </Routes>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
