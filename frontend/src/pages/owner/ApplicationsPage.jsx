import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  MOCK_APPLICATIONS,
  APPLICATION_STATUSES,
  getStoredApplications,
} from '../../utils/applicationMockData'
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
  FileCheck,
  Building2,
  DollarSign,
  Calendar,
  Eye,
  Info,
} from 'lucide-react'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [noticeMessage, setNoticeMessage] = useState('')

  useEffect(() => {
    // Load from stored applications so newly submitted applications appear
    const timer = setTimeout(() => {
      setApplications(getStoredApplications())
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [])

  const handleViewDetails = (appName) => {
    setNoticeMessage(`Application details for ${appName} - Coming soon!`)
    setTimeout(() => setNoticeMessage(''), 3500)
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...APPLICATION_STATUSES.map((st) => ({ value: st, label: st })),
  ]

  // Filter applications by search and status
  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      app.applicantName.toLowerCase().includes(query) ||
      app.propertyName.toLowerCase().includes(query) ||
      app.unit.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'all' ||
      app.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="applications"
      pageTitle="Applications"
    >
      <div className="space-y-6">
        {/* Coming Soon Notice Banner */}
        {noticeMessage && (
          <div className="p-3.5 rounded-xl bg-[#EAF2F7] border border-[#D9E0E6] text-[#315A7D] text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#315A7D] shrink-0" />
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
              Rental Applications
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Review prospective tenants, submission details, and application status
            </p>
          </div>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#D9E0E6] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by applicant name, property name, or unit..."
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
                {filteredApplications.length}
              </strong>{' '}
              of {applications.length} applications
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
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-12 shadow-xs flex justify-center">
            <Loader text="Loading rental applications..." size="md" center />
          </div>
        ) : filteredApplications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-8 shadow-xs">
            <EmptyState
              icon={<FileCheck className="w-8 h-8 text-[#315A7D]" />}
              title="No applications found"
              message="No rental application records match your current search query or status filter."
              action={{
                label: 'Reset Filters',
                onClick: resetFilters,
                variant: 'outline',
              }}
            />
          </div>
        ) : (
          /* Responsive Table */
          <div className="bg-white rounded-2xl border border-[#D9E0E6] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3.5 pl-6 pr-4">Applicant</th>
                    <th className="py-3.5 px-4">Property Name</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Monthly Income</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm">
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-[#F7F8FA] transition-colors"
                    >
                      {/* Applicant Name */}
                      <td className="py-4 pl-6 pr-4 font-semibold text-[#243447] whitespace-nowrap">
                        {app.applicantName}
                      </td>

                      {/* Property Name */}
                      <td className="py-4 px-4 text-[#243447] min-w-[200px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span className="truncate">{app.propertyName}</span>
                        </div>
                      </td>

                      {/* Unit */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                          {app.unit}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#5B6875]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span>{app.submittedDate}</span>
                        </div>
                      </td>

                      {/* Monthly Income */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-[#243447]">
                        ${Number(app.monthlyIncome || 0).toLocaleString()}
                        <span className="text-xs text-[#5B6875] font-normal"> / mo</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </td>

                      {/* Actions: View Details */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <Link to={`/owner/applications/${app.id}`}>
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
