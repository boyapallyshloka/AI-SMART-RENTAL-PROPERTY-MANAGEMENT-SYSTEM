import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { MOCK_USERS, USER_ROLES } from '../../utils/adminMockData'
import {
  Input,
  Select,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  Users,
  Search,
  RotateCcw,
  Shield,
  Building2,
  User,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(MOCK_USERS)
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  const roleOptions = USER_ROLES.map((role) => ({
    value: role,
    label: role,
  }))

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)

    const matchesRole =
      roleFilter === 'All Roles' ||
      u.role.toLowerCase() === roleFilter.toLowerCase()

    return matchesSearch && matchesRole
  })

  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'All Roles'

  const resetFilters = () => {
    setSearchQuery('')
    setRoleFilter('All Roles')
  }

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return <Building2 className="w-3.5 h-3.5 text-emerald-500" />
      case 'tenant':
        return <User className="w-3.5 h-3.5 text-cyan-500" />
      case 'manager':
        return <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-purple-500" />
      default:
        return <User className="w-3.5 h-3.5 text-slate-400" />
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      case 'tenant':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800'
      case 'manager':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }
  }

  return (
    <DashboardLayout
      defaultRole="admin"
      activeItem="users"
      pageTitle="User Management"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              User Directory & Accounts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse, filter, and inspect registered owners, tenants, property managers, and administrators
            </p>
          </div>
        </div>

        {/* Search & Role Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by name or email address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  options={roleOptions}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  title="Reset filters"
                  aria-label="Reset filters"
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              Showing{' '}
              <strong className="text-slate-900 dark:text-white">
                {filteredUsers.length}
              </strong>{' '}
              of {users.length} registered platform users
            </span>
            {hasActiveFilters && (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                Filtered view
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Loading user directory..." size="md" center />
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No users match your criteria"
              message="Try adjusting your search query or switching role filter to view all users."
            />
          </div>
        ) : (
          /* Responsive Table */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 pl-6 pr-4">User Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-4 pl-6 pr-4 font-semibold text-slate-900 dark:text-white min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <span className="truncate">{u.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {u.email}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border font-medium ${getRoleBadgeClass(
                            u.role
                          )}`}
                        >
                          {getRoleIcon(u.role)}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={u.accountStatus} size="sm" />
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
                            u.verificationStatus === 'Verified'
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                              : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {u.verificationStatus === 'Verified' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          <span>{u.verificationStatus}</span>
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {u.joinDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
