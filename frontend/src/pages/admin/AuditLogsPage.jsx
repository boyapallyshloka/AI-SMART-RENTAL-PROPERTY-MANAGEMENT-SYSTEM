import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  MOCK_AUDIT_LOGS,
  AUDIT_MODULES,
  AUDIT_RESULTS,
} from '../../utils/adminMockData'
import {
  Input,
  Select,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  History,
  Search,
  RotateCcw,
  Clock,
} from 'lucide-react'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('All Modules')
  const [resultFilter, setResultFilter] = useState('All Results')

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs(MOCK_AUDIT_LOGS)
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  const moduleOptions = AUDIT_MODULES.map((mod) => ({
    value: mod,
    label: mod,
  }))

  const resultOptions = AUDIT_RESULTS.map((res) => ({
    value: res,
    label: res,
  }))

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      log.userName.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.module.toLowerCase().includes(query)

    const matchesModule =
      moduleFilter === 'All Modules' ||
      log.module.toLowerCase() === moduleFilter.toLowerCase()

    const matchesResult =
      resultFilter === 'All Results' ||
      log.result.toLowerCase() === resultFilter.toLowerCase()

    return matchesSearch && matchesModule && matchesResult
  })

  const hasActiveFilters =
    searchQuery !== '' ||
    moduleFilter !== 'All Modules' ||
    resultFilter !== 'All Results'

  const resetFilters = () => {
    setSearchQuery('')
    setModuleFilter('All Modules')
    setResultFilter('All Results')
  }

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-[#EAF2F7] text-[#315A7D] border-[#D9E0E6]'
      case 'owner':
        return 'bg-[#EDF7EE] text-[#2A583B] border-[#C6DEC8]'
      case 'manager':
        return 'bg-[#F0F4F7] text-[#5B6875] border-[#D9E0E6]'
      case 'tenant':
      default:
        return 'bg-[#EAF2F7] text-[#274B68] border-[#D9E0E6]'
    }
  }

  const getModuleBadgeClass = (module) => {
    switch (module?.toLowerCase()) {
      case 'authentication':
        return 'bg-[#F0F4F7] text-[#5B6875] border-[#D9E0E6]'
      case 'properties':
        return 'bg-[#EDF7EE] text-[#2A583B] border-[#C6DEC8]'
      case 'payments':
        return 'bg-[#EDF7EE] text-[#2A583B] border-[#C6DEC8]'
      case 'applications':
        return 'bg-[#EAF2F7] text-[#315A7D] border-[#D9E0E6]'
      case 'maintenance':
        return 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]'
      case 'owner verification':
        return 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]'
      default:
        return 'bg-[#F0F4F7] text-[#5B6875] border-[#D9E0E6]'
    }
  }

  return (
    <DashboardLayout
      defaultRole="admin"
      activeItem="audit-logs"
      pageTitle="Audit Logs"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                Platform Audit Logs
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                Compliance Record
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Immutable telemetry record of administrative actions, authentication attempts, and operational events
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by user, action, or module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[#5B6875]" />}
              />
            </div>

            <div>
              <Select
                options={moduleOptions}
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  options={resultOptions}
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
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
                {filteredLogs.length}
              </strong>{' '}
              of {logs.length} logged audit events
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
            <Loader text="Loading audit event telemetry..." size="md" center />
          </div>
        ) : filteredLogs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-8 shadow-2xs">
            <EmptyState
              icon={<History className="w-8 h-8" />}
              title="No audit entries found"
              message="No recorded system actions match your current search query or filter selections."
            />
          </div>
        ) : (
          /* Responsive Table */
          <div className="bg-white rounded-lg border border-[#D9E0E6] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3 pl-6 pr-4">Timestamp</th>
                    <th className="py-3 px-4">User / Actor</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action / Event</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 pl-4 pr-6 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm bg-white">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-[#F7F8FA] transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 pl-6 pr-4 whitespace-nowrap font-mono text-xs text-[#5B6875]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* User / Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#243447]">
                        {log.userName}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium ${getRoleBadgeClass(
                            log.role
                          )}`}
                        >
                          {log.role}
                        </span>
                      </td>

                      {/* Action / Event */}
                      <td className="py-3.5 px-4 text-xs font-medium text-[#243447] min-w-[260px]">
                        {log.action}
                      </td>

                      {/* Module */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium ${getModuleBadgeClass(
                            log.module
                          )}`}
                        >
                          {log.module}
                        </span>
                      </td>

                      {/* Result */}
                      <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                        <StatusBadge status={log.result} size="sm" />
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
