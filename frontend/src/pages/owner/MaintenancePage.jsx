import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  MOCK_MAINTENANCE_REQUESTS,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
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
      setRequests(MOCK_MAINTENANCE_REQUESTS)
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
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60'
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60'
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60'
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
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
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoticeMessage('')}
              className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200 font-bold px-1"
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
              Review and manage tenant repair tickets, issues, and contractor dispatches
            </p>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by ticket number, tenant, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
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
            <Loader text="Loading maintenance tickets..." size="md" center />
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Ticket Number */}
                      <td className="py-4 pl-6 pr-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400 text-xs whitespace-nowrap">
                        {req.ticketNumber}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
                          <Wrench className="w-3 h-3 text-slate-400" />
                          {req.category}
                        </span>
                      </td>

                      {/* Property & Unit */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                          {req.propertyName}
                        </p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {req.unitNumber}
                        </span>
                      </td>

                      {/* Tenant Name */}
                      <td className="py-4 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
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
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{req.submittedDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={req.status} size="sm" />
                      </td>

                      {/* Actions: View Details (Coming Soon) */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => handleViewDetails(req.ticketNumber)}
                        >
                          View Details
                        </Button>
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
