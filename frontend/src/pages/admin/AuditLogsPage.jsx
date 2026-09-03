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
  Shield,
  Building2,
  User,
  Briefcase,
  Layers,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
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
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
      case 'owner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      case 'manager':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
      case 'tenant':
      default:
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800'
    }
  }

  const getModuleBadgeClass = (module) => {
    switch (module?.toLowerCase()) {
      case 'authentication':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      case 'properties':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'payments':
        return 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'applications':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
      case 'maintenance':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
      case 'owner verification':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Platform Audit Logs
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Security & Compliance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Immutable telemetry record of administrative actions, authentication attempts, and operational events
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by user, action, or module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
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
                {filteredLogs.length}
              </strong>{' '}
              of {logs.length} logged audit events
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
            <Loader text="Loading audit event telemetry..." size="md" center />
          </div>
        ) : filteredLogs.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<History className="w-8 h-8" />}
              title="No audit entries found"
              message="No recorded system actions match your current search query or filter selections."
            />
          </div>
        ) : (
          /* Responsive Table */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 pl-6 pr-4">Timestamp</th>
                    <th className="py-3.5 px-4">User / Actor</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Action / Event</th>
                    <th className="py-3.5 px-4">Module</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-4 pl-6 pr-4 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* User / Actor */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                        {log.userName}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${getRoleBadgeClass(
                            log.role
                          )}`}
                        >
                          {log.role}
                        </span>
                      </td>

                      {/* Action / Event */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 min-w-[260px]">
                        {log.action}
                      </td>

                      {/* Module */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${getModuleBadgeClass(
                            log.module
                          )}`}
                        >
                          {log.module}
                        </span>
                      </td>

                      {/* Result */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
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
