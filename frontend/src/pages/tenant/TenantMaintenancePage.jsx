import React, { useState, useEffect } from 'react'
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
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [noticeMessage, setNoticeMessage] = useState('')

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
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 font-semibold'
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800'
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      case 'low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }
  }

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="maintenance"
      pageTitle="Maintenance"
    >
      <div className="space-y-6">
        {/* Notice Message Banner */}
        {noticeMessage && (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoticeMessage('')}
              className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-100 font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Maintenance Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track repairs, schedule service dispatches, and review technician resolution status
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleCreateRequest}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Maintenance Request
          </Button>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by ticket #, category, title, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
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
                {filteredRequests.length}
              </strong>{' '}
              of {requests.length} maintenance tickets
            </span>
            {hasActiveFilters && (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Loading your maintenance requests..." size="md" center />
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<Wrench className="w-8 h-8" />}
              title="No maintenance requests found"
              message={
                hasActiveFilters
                  ? 'No tickets match your search or filter criteria. Try resetting filters.'
                  : 'You do not have any open or previous maintenance repair requests on record.'
              }
              action={
                <Button
                  variant="primary"
                  onClick={handleCreateRequest}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Maintenance Request
                </Button>
              }
            />
          </div>
        ) : (
          /* Maintenance Requests Table */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 pl-6 pr-4">Ticket #</th>
                    <th className="py-3.5 px-4">Property & Unit</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Ticket Number */}
                      <td className="py-4 pl-6 pr-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400 text-xs whitespace-nowrap">
                        <div>
                          <span>{req.ticketNumber}</span>
                          {req.title && (
                            <p className="font-sans font-normal text-slate-500 dark:text-slate-400 text-xs truncate max-w-xs mt-0.5">
                              {req.title}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Property & Unit */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {req.propertyName}
                            </p>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {req.unitNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {req.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getPriorityBadgeClass(
                            req.priority
                          )}`}
                        >
                          {req.priority}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
