import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/ui/Loader'

/**
 * Route wrapper that enforces role-based access
 * Allows managers to access owner routes temporarily per requirements
 * @param {Object} props
 * @param {'owner' | 'tenant' | 'manager' | string[]} props.allowedRole
 * @param {React.ReactNode} [props.children]
 */
export default function RoleRoute({ allowedRole, children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader size="lg" text="Checking permissions..." center />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Manager is permitted on owner routes temporarily
  const isAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(user.role) || (allowedRole.includes('owner') && user.role === 'manager')
    : user.role === allowedRole || (allowedRole === 'owner' && user.role === 'manager')

  if (!isAllowed) {
    // Redirect unauthorized user to their respective valid dashboard
    const fallbackPath =
      user.role === 'admin' || user.role === 'superadmin'
        ? '/admin/dashboard'
        : user.role === 'owner' || user.role === 'manager'
        ? '/owner/dashboard'
        : '/tenant/dashboard'
    return <Navigate to={fallbackPath} replace />
  }

  return children ? children : <Outlet />
}
