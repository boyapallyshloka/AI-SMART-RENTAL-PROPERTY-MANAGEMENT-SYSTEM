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
        return <Building2 className="w-3.5 h-3.5 text-[#3F7D58]" />
      case 'tenant':
        return <User className="w-3.5 h-3.5 text-[#315A7D]" />
      case 'manager':
        return <Briefcase className="w-3.5 h-3.5 text-[#5B6875]" />
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-[#315A7D]" />
      default:
        return <User className="w-3.5 h-3.5 text-[#5B6875]" />
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return 'bg-[#EDF7EE] text-[#2A583B] border-[#C6DEC8]'
      case 'tenant':
        return 'bg-[#EAF2F7] text-[#274B68] border-[#D9E0E6]'
      case 'manager':
        return 'bg-[#F0F4F7] text-[#5B6875] border-[#D9E0E6]'
      case 'admin':
        return 'bg-[#EAF2F7] text-[#315A7D] border-[#D9E0E6]'
      default:
        return 'bg-[#F0F4F7] text-[#5B6875] border-[#D9E0E6]'
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
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
              User Directory & Accounts
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Browse, filter, and inspect registered owners, tenants, property managers, and administrators
            </p>
          </div>
        </div>

        {/* Search & Role Filter */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by name or email address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[#5B6875]" />}
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
                  className="p-2 rounded-md border border-[#D9E0E6] text-[#5B6875] hover:text-[#243447] hover:bg-[#EAF2F7] transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B6875] pt-1 border-t border-[#D9E0E6]">
            <span>
              Showing{' '}
              <strong className="text-[#243447]">
                {filteredUsers.length}
              </strong>{' '}
              of {users.length} registered platform users
            </span>
            {hasActiveFilters && (
              <span className="text-[#315A7D] font-semibold">
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-12 shadow-2xs flex justify-center">
            <Loader text="Loading user directory..." size="md" center />
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-8 shadow-2xs">
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No users match your criteria"
              message="Try adjusting your search query or switching role filter to view all users."
            />
          </div>
        ) : (
          /* Responsive Table */
          <div className="bg-white rounded-lg border border-[#D9E0E6] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3 pl-6 pr-4">User Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 pl-4 pr-6 text-right">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm bg-white">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[#F7F8FA] transition-colors"
                    >
                      {/* Name */}
                      <td className="py-3.5 pl-6 pr-4 font-semibold text-[#243447] min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EAF2F7] border border-[#D9E0E6] flex items-center justify-center font-bold text-xs text-[#315A7D] shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <span className="truncate">{u.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-xs font-mono text-[#5B6875] whitespace-nowrap">
                        {u.email}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border font-medium ${getRoleBadgeClass(
                            u.role
                          )}`}
                        >
                          {getRoleIcon(u.role)}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={u.accountStatus} size="sm" />
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${
                            u.verificationStatus === 'Verified'
                              ? 'text-[#2A583B] bg-[#EDF7EE] border-[#C6DEC8]'
                              : 'text-[#8A5B16] bg-[#FEF7EC] border-[#F4E2B6]'
                          }`}
                        >
                          {u.verificationStatus === 'Verified' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7D58]" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-[#B7791F]" />
                          )}
                          <span>{u.verificationStatus}</span>
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap text-xs text-[#5B6875] font-mono">
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
