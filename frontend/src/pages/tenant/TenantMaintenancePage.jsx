import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getStoredMaintenanceRequests,
  MAINTENANCE_STATUSES,
} from '../../utils/maintenanceMockData'
import {
  Button,
  Input,
  Select,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  Wrench,
  Plus,
  Search,
  RotateCcw,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Info,
} from 'lucide-react'

export default function TenantMaintenancePage() {
  const { user } = useAuth()
  const location = useLocation()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ''
  )

  const tenantEmail = (user?.email || 'tenant@homesphere.com').toLowerCase().trim()
  const tenantName = (user?.name || 'Elena Rostova').toLowerCase().trim()

  useEffect(() => {
    // Read from shared maintenance requests storage
    const timer = setTimeout(() => {
      const allRequests = getStoredMaintenanceRequests()
      const myRequests = allRequests.filter((req) => {
        const emailMatch = (req.tenantEmail || '').toLowerCase().trim() === tenantEmail
        const nameMatch = (req.tenantName || '').toLowerCase().trim() === tenantName
        return emailMatch || nameMatch
      })
      setRequests(myRequests)
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [tenantEmail, tenantName])

  const handleCreateRequest = () => {
    setNoticeMessage('Create Maintenance Request form - Coming soon!')
    setTimeout(() => {
      setNoticeMessage('')
    }, 3500)
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...MAINTENANCE_STATUSES.map((st) => ({ value: st, label: st })),
  ]

  // Filtered requests based on search and status
  const filteredRequests = requests.filter((req) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      req.ticketNumber.toLowerCase().includes(query) ||
      req.propertyName.toLowerCase().includes(query) ||
      req.unitNumber.toLowerCase().includes(query) ||
      req.category.toLowerCase().includes(query) ||
      (req.title && req.title.toLowerCase().includes(query))

    const matchesStatus =
      statusFilter === 'all' ||
      req.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'emergency':
        return 'bg-[#FDF2F2] text-[#8A2E2C] border-[#F4B4B4] font-semibold'
      case 'high':
        return 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]'
      case 'medium':
        return 'bg-[#EAF2F7] text-[#315A7D] border-[#C2D8E8]'
      case 'low':
      default:
        return 'bg-[#F7F8FA] text-[#5B6875] border-[#D9E0E6]'
    }
  }

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="maintenance"
      pageTitle="Maintenance"
    >
      <div className="space-y-6">
        {/* Success Message Banner */}
        {successMessage && (
          <div className="p-4 rounded-lg bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#3F7D58] shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="text-[#2A583B] hover:text-[#1D3E2A] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Notice Message Banner */}
        {noticeMessage && (
          <div className="p-4 rounded-lg bg-[#EAF2F7] border border-[#C2D8E8] text-[#315A7D] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[#315A7D] shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoticeMessage('')}
              className="text-[#315A7D] hover:text-[#274B68] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243447]">
              Maintenance Requests
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Track repairs, schedule service dispatches, and review technician resolution status
            </p>
          </div>

          <Link to="/tenant/maintenance/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create Maintenance Request
            </Button>
          </Link>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by ticket #, category, title, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[#5B6875]" />}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  title="Reset filters"
                  aria-label="Reset filters"
                  className="p-2.5 rounded-lg border border-[#D9E0E6] text-[#5B6875] hover:text-[#243447] hover:bg-[#F7F8FA] transition-colors shrink-0"
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
                {filteredRequests.length}
              </strong>{' '}
              of {requests.length} maintenance tickets
            </span>
            {hasActiveFilters && (
              <span className="text-[#315A7D] font-medium">
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-12 shadow-2xs flex justify-center">
            <Loader text="Loading your maintenance requests..." size="md" center />
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-8 shadow-2xs">
            <EmptyState
              icon={<Wrench className="w-8 h-8" />}
              title="No maintenance requests found"
              message={
                hasActiveFilters
                  ? 'No tickets match your search or filter criteria. Try resetting filters.'
                  : 'You do not have any open or previous maintenance repair requests on record.'
              }
              action={
                <Link to="/tenant/maintenance/new">
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Create Maintenance Request
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          /* Maintenance Requests Table */
          <div className="bg-white rounded-lg border border-[#D9E0E6] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3.5 pl-6 pr-4">Ticket #</th>
                    <th className="py-3.5 px-4">Property & Unit</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-[#F7F8FA] transition-colors"
                    >
                      {/* Ticket Number */}
                      <td className="py-4 pl-6 pr-4 font-mono font-semibold text-[#315A7D] text-xs whitespace-nowrap">
                        <div>
                          <span>{req.ticketNumber}</span>
                          {req.title && (
                            <p className="font-sans font-normal text-[#5B6875] text-xs truncate max-w-xs mt-0.5">
                              {req.title}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Property & Unit */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#5B6875] shrink-0" />
                          <div>
                            <p className="font-semibold text-[#243447] text-xs">
                              {req.propertyName}
                            </p>
                            <span className="text-xs text-[#5B6875]">
                              {req.unitNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                          {req.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border ${getPriorityBadgeClass(
                            req.priority
                          )}`}
                        >
                          {req.priority}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#5B6875]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span>{req.submittedDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <StatusBadge status={req.status} size="sm" />
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
