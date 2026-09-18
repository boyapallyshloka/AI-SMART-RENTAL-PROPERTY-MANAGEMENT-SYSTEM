import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  MOCK_MAINTENANCE_REQUESTS,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  getStoredMaintenanceRequests,
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
  Search,
  RotateCcw,
  Wrench,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
  Info,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export default function MaintenancePage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [noticeMessage, setNoticeMessage] = useState('')

  useEffect(() => {
    // Brief simulated loading to showcase Loader component
    const timer = setTimeout(() => {
      setRequests(getStoredMaintenanceRequests())
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [])

  const handleViewDetails = (ticketNumber) => {
    setNoticeMessage(`Maintenance details for ${ticketNumber} - Coming soon!`)
    setTimeout(() => setNoticeMessage(''), 3500)
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...MAINTENANCE_STATUSES.map((st) => ({ value: st, label: st })),
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    ...MAINTENANCE_PRIORITIES.map((pr) => ({ value: pr, label: pr })),
  ]

  // Filter requests by search, status, and priority
  const filteredRequests = requests.filter((req) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      req.ticketNumber.toLowerCase().includes(query) ||
      req.tenantName.toLowerCase().includes(query) ||
      req.propertyName.toLowerCase().includes(query) ||
      req.unitNumber.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'all' ||
      req.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesPriority =
      priorityFilter === 'all' ||
      req.priority.toLowerCase() === priorityFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  // Priority color-coded badge style helper
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Emergency':
        return 'bg-[#FDF2F2] text-[#8A2E2C] border-[#F4B4B4]'
      case 'High':
        return 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]'
      case 'Medium':
        return 'bg-[#EAF2F7] text-[#315A7D] border-[#D9E0E6]'
      case 'Low':
      default:
        return 'bg-[#F7F8FA] text-[#5B6875] border-[#D9E0E6]'
    }
  }

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="maintenance"
      pageTitle="Maintenance"
    >
      <div className="space-y-6">
        {/* Notice Banner */}
        {noticeMessage && (
          <div className="p-3.5 rounded-xl bg-[#EAF2F7] border border-[#D9E0E6] text-[#243447] text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#315A7D] shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoticeMessage('')}
              className="text-[#5B6875] hover:text-[#243447] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
              Maintenance Requests
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Review and manage tenant repair tickets, issues, and contractor dispatches
            </p>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white rounded-xl border border-[#D9E0E6] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by ticket number, tenant, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[#5B6875]" />}
              />
            </div>

            <div>
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  options={priorityOptions}
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
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
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-12 shadow-xs flex justify-center">
            <Loader text="Loading maintenance tickets..." size="md" center />
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-8 shadow-xs">
            <EmptyState
              icon={<Wrench className="w-8 h-8" />}
              title="No maintenance requests found"
              message="No repair tickets match your current search query or filter selection."
              action={{
                label: 'Reset Filters',
                onClick: resetFilters,
                variant: 'outline',
              }}
            />
          </div>
        ) : (
          /* Requests Table */
          <div className="bg-white rounded-xl border border-[#D9E0E6] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3.5 pl-6 pr-4">Ticket #</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Property & Unit</th>
                    <th className="py-3.5 px-4">Tenant</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-[#F7F8FA]/80 transition-colors"
                    >
                      {/* Ticket Number */}
                      <td className="py-4 pl-6 pr-4 font-mono font-semibold text-[#315A7D] text-xs whitespace-nowrap">
                        <Link
                          to={`/owner/maintenance/${req.id}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          {req.ticketNumber}
                        </Link>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                          <Wrench className="w-3 h-3 text-[#5B6875]" />
                          {req.category}
                        </span>
                      </td>

                      {/* Property & Unit */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <p className="font-semibold text-[#243447] text-xs truncate">
                          {req.propertyName}
                        </p>
                        <span className="text-xs text-[#5B6875]">
                          {req.unitNumber}
                        </span>
                      </td>

                      {/* Tenant Name */}
                      <td className="py-4 px-4 font-medium text-[#243447] whitespace-nowrap">
                        {req.tenantName}
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
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
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={req.status} size="sm" />
                      </td>

                      {/* Actions: View Details */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <Link to={`/owner/maintenance/${req.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View Details
                          </Button>
                        </Link>
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
