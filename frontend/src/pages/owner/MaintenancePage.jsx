import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getMaintenanceRequests,
  MAINTENANCE_STATUSES,
  MAINTENANCE_PRIORITIES,
  formatCategoryLabel,
  formatPriorityLabel,
  formatStatusLabel,
  getPriorityBadgeClass,
} from '../../api/maintenanceApi'
import {
  getMyProperties,
  getPropertyDetails,
} from '../../api/propertyApi'
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
  History,
  DollarSign,
} from 'lucide-react'

/**
 * Normalizes property names into Title Case for clean user-facing presentation.
 * Example: "sri sai residency" -> "Sri Sai Residency"
 */
const formatPropertyName = (name) => {
  if (!name || typeof name !== 'string') return ''
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed
    .split(/\s+/)
    .map((word) =>
      word
        .split('-')
        .map((part) =>
          part
            ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            : ''
        )
        .join('-')
    )
    .join(' ')
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'history' | 'all'
  const [errorMessage, setErrorMessage] = useState('')

  // Cache/lookup maps for Property Name and Unit Number
  const [propertyMap, setPropertyMap] = useState({}) // { [propertyId]: propertyName }
  const [unitMap, setUnitMap] = useState({})         // { [unitId]: unitNumber }

  // Batch-resolve human-readable property names and unit numbers
  const enrichPropertiesAndUnits = async (tickets) => {
    if (!Array.isArray(tickets) || tickets.length === 0) return

    const uniquePropertyIds = [
      ...new Set(tickets.map((t) => t.propertyId).filter(Boolean)),
    ]

    const newPropertyMap = {}
    const newUnitMap = {}
    const ownedPropertyIdSet = new Set()

    // 1. Pre-populate from ticket fields if already provided by backend
    tickets.forEach((t) => {
      if (t.propertyId && t.propertyName) {
        newPropertyMap[String(t.propertyId)] = t.propertyName
      }
      if (t.unitId && t.unitNumber) {
        newUnitMap[String(t.unitId)] = String(t.unitNumber)
      }
    })

    // 2. Query GET /api/owner/properties (getMyProperties) as the reliable source for owner's properties
    try {
      const propRes = await getMyProperties()
      const propList = Array.isArray(propRes?.data)
        ? propRes.data
        : Array.isArray(propRes)
        ? propRes
        : []
      propList.forEach((p) => {
        const pid = p.propertyId || p.id
        const pname = p.propertyName || p.name || p.title
        if (pid && pname) {
          newPropertyMap[String(pid)] = pname
          ownedPropertyIdSet.add(String(pid))
        }
      })
    } catch (err) {
      console.warn('Could not load properties list for maintenance lookup:', err)
    }

    // Immediately update property names from getMyProperties()
    setPropertyMap((prev) => ({ ...prev, ...newPropertyMap }))

    // 3. For properties confirmed to be owned by this owner, fetch property details to resolve Unit Number
    // Traverse: Property -> Buildings -> Floors -> Units
    // Do NOT query properties not owned by the authenticated owner (prevents 404/403 errors)
    const targetPropertyIds = uniquePropertyIds.filter((pid) =>
      ownedPropertyIdSet.has(String(pid))
    )

    if (targetPropertyIds.length > 0) {
      await Promise.allSettled(
        targetPropertyIds.map(async (propertyId) => {
          try {
            const details = await getPropertyDetails(propertyId)

            if (details) {
              // Traverse Property -> Buildings -> Floors -> Units
              if (Array.isArray(details?.buildings)) {
                for (const b of details.buildings) {
                  if (Array.isArray(b?.floors)) {
                    for (const f of b.floors) {
                      if (Array.isArray(f?.units)) {
                        for (const u of f.units) {
                          if (u?.unitId != null && u?.unitNumber) {
                            newUnitMap[String(u.unitId)] = String(u.unitNumber)
                          }
                        }
                      }
                    }
                  }
                }
              }

              // Check flat units array if provided
              if (Array.isArray(details?.units)) {
                for (const u of details.units) {
                  if (u?.unitId != null && u?.unitNumber) {
                    newUnitMap[String(u.unitId)] = String(u.unitNumber)
                  }
                }
              }
            }
          } catch (err) {
            console.warn(`Could not load details for property ${propertyId}:`, err)
          }
        })
      )
    }

    setPropertyMap((prev) => ({ ...prev, ...newPropertyMap }))
    setUnitMap((prev) => ({ ...prev, ...newUnitMap }))
  }

  const fetchTickets = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await getMaintenanceRequests()
      if (Array.isArray(data)) {
        setRequests(data)
        enrichPropertiesAndUnits(data)
      } else {
        setRequests([])
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.originalError?.message ||
        'Unable to load maintenance requests from the server.'
      setErrorMessage(msg)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  /**
   * Helper to format human-readable Property and Unit display for a maintenance ticket.
   * Example: "Sri Sai Residency • Unit 101"
   * Fallback: "Property #16 • Unit #83"
   */
  const getDisplayLocation = (req) => {
    if (!req.propertyId && !req.unitId) return null

    // 1. Property Name Resolution
    const rawPropName = propertyMap[String(req.propertyId)] || req.propertyName
    const propDisplay = rawPropName
      ? formatPropertyName(rawPropName)
      : req.propertyId
      ? `Property #${req.propertyId}`
      : ''

    // 2. Unit Number Resolution
    const rawUnitNum = unitMap[String(req.unitId)] || req.unitNumber
    let unitDisplay = ''
    if (rawUnitNum != null && String(rawUnitNum).trim()) {
      const clean = String(rawUnitNum).trim()
      unitDisplay = clean.toLowerCase().startsWith('unit') ? clean : `Unit ${clean}`
    } else if (req.unitId) {
      unitDisplay = `Unit #${req.unitId}`
    }

    // 3. Combined display
    return [propDisplay, unitDisplay].filter(Boolean).join(' • ')
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...MAINTENANCE_STATUSES.map((st) => ({
      value: st,
      label: formatStatusLabel(st),
    })),
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    ...MAINTENANCE_PRIORITIES.map((pr) => ({
      value: pr,
      label: `${formatPriorityLabel(pr)} Priority`,
    })),
  ]

  // Filter requests by Tab (Active vs. History/Past vs. All), Search, Status, and Priority
  const filteredRequests = requests.filter((req) => {
    const reqStatus = String(req.status || '').toUpperCase()
    const isPastRecord = reqStatus === 'COMPLETED' || reqStatus === 'CANCELLED'

    // Tab filtering
    if (activeTab === 'active' && isPastRecord) return false
    if (activeTab === 'history' && !isPastRecord) return false

    // Search query
    const query = searchQuery.toLowerCase().trim()
    const ticketStr = String(req.requestId || req.id || req.ticketNumber || '').toLowerCase()
    const desc = (req.description || '').toLowerCase()
    const cat = (req.category || '').toLowerCase()

    const matchesSearch =
      query === '' ||
      ticketStr.includes(query) ||
      desc.includes(query) ||
      cat.includes(query)

    // Status filter
    const matchesStatus =
      statusFilter === 'all' || reqStatus === statusFilter.toUpperCase()

    // Priority filter
    const reqPriority = String(req.priority || '').toUpperCase()
    const matchesPriority =
      priorityFilter === 'all' || reqPriority === priorityFilter.toUpperCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  const activeCount = requests.filter(
    (r) => String(r.status || '').toUpperCase() !== 'COMPLETED' && String(r.status || '').toUpperCase() !== 'CANCELLED'
  ).length

  const historyCount = requests.filter(
    (r) => String(r.status || '').toUpperCase() === 'COMPLETED' || String(r.status || '').toUpperCase() === 'CANCELLED'
  ).length

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="maintenance"
      pageTitle="Maintenance"
    >
      <div className="space-y-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F4B4B4] text-[#8A2E2C] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#8A2E2C] shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button size="xs" variant="outline" onClick={fetchTickets}>
              Retry
            </Button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
              Maintenance Requests
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Review and manage tenant repair tickets, issues, worker dispatches, and maintenance history
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchTickets}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Navigation Tabs: Active vs. Maintenance History vs. All */}
        <div className="flex items-center gap-2 border-b border-[#D9E0E6] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-[#315A7D] text-white shadow-xs'
                : 'text-[#5B6875] hover:text-[#243447] hover:bg-[#F7F8FA]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Tickets</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-[#EAF2F7] text-[#315A7D]'
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#315A7D] text-white shadow-xs'
                : 'text-[#5B6875] hover:text-[#243447] hover:bg-[#F7F8FA]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Maintenance History</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-[#EDF7EE] text-[#2A583B]'
              }`}
            >
              {historyCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-[#315A7D] text-white shadow-xs'
                : 'text-[#5B6875] hover:text-[#243447] hover:bg-[#F7F8FA]'
            }`}
          >
            <span>All Records</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-[#F7F8FA] text-[#5B6875]'
              }`}
            >
              {requests.length}
            </span>
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white rounded-xl border border-[#D9E0E6] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by ticket number, category, description..."
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
              of {requests.length} maintenance records
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
            <Loader text="Loading maintenance records..." size="md" center />
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-8 shadow-xs">
            <EmptyState
              icon={activeTab === 'history' ? <History className="w-8 h-8" /> : <Wrench className="w-8 h-8" />}
              title={
                activeTab === 'history'
                  ? 'No completed maintenance history'
                  : 'No maintenance requests found'
              }
              message={
                hasActiveFilters
                  ? 'No records match your search query or filter selection.'
                  : activeTab === 'history'
                  ? 'No maintenance tickets have been resolved or closed yet.'
                  : 'There are currently no active maintenance tickets reported.'
              }
              action={
                hasActiveFilters
                  ? {
                      label: 'Reset Filters',
                      onClick: resetFilters,
                      variant: 'outline',
                    }
                  : undefined
              }
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
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    {activeTab === 'history' && (
                      <>
                        <th className="py-3.5 px-4">Completed Date</th>
                        <th className="py-3.5 px-4">Cost</th>
                      </>
                    )}
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm">
                  {filteredRequests.map((req) => {
                    const ticketId = req.requestId || req.id || req.ticketNumber
                    const submittedDateStr = req.requestedDate
                      ? new Date(req.requestedDate).toLocaleDateString()
                      : req.submittedDate || '—'
                    const completedDateStr = req.completedDate
                      ? new Date(req.completedDate).toLocaleDateString()
                      : '—'

                    return (
                      <tr
                        key={ticketId || Math.random()}
                        className="hover:bg-[#F7F8FA]/80 transition-colors"
                      >
                        {/* Ticket Number */}
                        <td className="py-4 pl-6 pr-4 font-mono font-semibold text-[#315A7D] text-xs whitespace-nowrap">
                          <Link
                            to={`/owner/maintenance/${ticketId}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            #{ticketId}
                          </Link>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                            <Wrench className="w-3 h-3 text-[#5B6875]" />
                            {formatCategoryLabel(req.category)}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-4 px-4 min-w-[200px] max-w-xs">
                          <p className="font-medium text-[#243447] text-xs truncate">
                            {req.description || 'No description provided'}
                          </p>
                          {getDisplayLocation(req) && (
                            <span className="text-[11px] text-[#5B6875] block mt-0.5">
                              {getDisplayLocation(req)}
                            </span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                              req.priority
                            )}`}
                          >
                            {formatPriorityLabel(req.priority)}
                          </span>
                        </td>

                        {/* Submitted Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-[#5B6875]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                            <span>{submittedDateStr}</span>
                          </div>
                        </td>

                        {/* Completed Date (History Tab) */}
                        {activeTab === 'history' && (
                          <>
                            <td className="py-4 px-4 whitespace-nowrap text-xs text-[#2A583B]">
                              {completedDateStr}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-[#243447]">
                              {req.cost != null ? `₹${req.cost}` : '—'}
                            </td>
                          </>
                        )}

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={formatStatusLabel(req.status)} size="sm" />
                        </td>

                        {/* Actions: View Details */}
                        <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                          <Link to={`/owner/maintenance/${ticketId}`}>
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
