import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { ROLES } from '../../utils/roles'
import {
  getMaintenanceRequests,
  updateMaintenanceStatus,
  getMaintenanceWorkers,
  getMaintenanceAssignments,
  createMaintenanceAssignment,
  predictMaintenance,
  MAINTENANCE_STATUSES,
  MAINTENANCE_PRIORITIES,
  formatCategoryLabel,
  formatPriorityLabel,
  formatStatusLabel,
  getPriorityBadgeClass,
} from '../../api/maintenanceApi'
import {
  Button,
  Input,
  Select,
  StatusBadge,
  EmptyState,
  Loader,
  Textarea,
} from '../../components/ui'
import {
  Wrench,
  ArrowLeft,
  Building2,
  ListFilter,
  CheckCircle2,
  Users,
  History,
  Info,
  Layers,
  Search,
  RotateCcw,
  Calendar,
  AlertCircle,
  Eye,
  Clock,
  HardHat,
  Sparkles,
  DollarSign,
  Activity,
  X,
  UserPlus,
} from 'lucide-react'

export default function ManagerMaintenancePage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'history' | 'all'
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Worker assignment inside manager modal
  const [availableWorkers, setAvailableWorkers] = useState([])
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [assignmentNotes, setAssignmentNotes] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignmentError, setAssignmentError] = useState('')
  const [ticketAssignments, setTicketAssignments] = useState({})

  // Predictive analytics state inside manager modal
  const [modalPrediction, setModalPrediction] = useState(null)
  const [predictionLoading, setPredictionLoading] = useState(false)

  const fetchTickets = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const [ticketsData, workersData, assignmentsData] = await Promise.allSettled([
        getMaintenanceRequests(),
        getMaintenanceWorkers(),
        getMaintenanceAssignments(),
      ])

      if (ticketsData.status === 'fulfilled' && Array.isArray(ticketsData.value)) {
        setRequests(ticketsData.value)
      } else {
        setRequests([])
      }

      if (workersData.status === 'fulfilled' && Array.isArray(workersData.value)) {
        setAvailableWorkers(workersData.value)
        if (workersData.value.length > 0) {
          setSelectedWorkerId(String(workersData.value[0].workerId || workersData.value[0].id))
        }
      }

      if (assignmentsData.status === 'fulfilled' && Array.isArray(assignmentsData.value)) {
        const map = {}
        assignmentsData.value.forEach((a) => {
          const reqId = a.maintenanceRequest?.requestId || a.maintenanceRequest?.id
          if (reqId) map[reqId] = a
        })
        setTicketAssignments(map)
      }
    } catch (err) {
      setErrorMessage(
        err?.message || 'Unable to retrieve maintenance requests from backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleOpenTicketModal = async (ticket) => {
    setSelectedTicket(ticket)
    setModalPrediction(null)
    setAssignmentError('')
    if (ticket?.propertyId) {
      setPredictionLoading(true)
      try {
        const pred = await predictMaintenance(ticket.propertyId, ticket.unitId)
        setModalPrediction(pred)
      } catch (e) {
        // Silently ignore if prediction telemetry unavailable
      } finally {
        setPredictionLoading(false)
      }
    }
  }

  const handleModalStatusChange = async (newStatus) => {
    if (!selectedTicket) return
    const ticketId = selectedTicket.requestId || selectedTicket.id
    try {
      await updateMaintenanceStatus(ticketId, newStatus)
      setSelectedTicket((prev) => ({ ...prev, status: newStatus }))
      setRequests((prev) =>
        prev.map((r) =>
          (r.requestId || r.id) === ticketId ? { ...r, status: newStatus } : r
        )
      )
      setSuccessMessage(`Ticket #${ticketId} status updated to ${formatStatusLabel(newStatus)}.`)
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to update status.')
    }
  }

  const handleModalAssignWorker = async (e) => {
    e.preventDefault()
    if (!selectedTicket || !selectedWorkerId) return

    const ticketId = selectedTicket.requestId || selectedTicket.id
    setIsAssigning(true)
    setAssignmentError('')
    try {
      const payload = {
        maintenanceRequest: { requestId: Number(ticketId) },
        worker: { workerId: Number(selectedWorkerId) },
        status: 'ASSIGNED',
        notes: assignmentNotes.trim() || undefined,
      }
      const newAssignment = await createMaintenanceAssignment(payload)
      setTicketAssignments((prev) => ({ ...prev, [ticketId]: newAssignment }))

      // Transition ticket status to ASSIGNED if needed
      await updateMaintenanceStatus(ticketId, 'ASSIGNED')
      setSelectedTicket((prev) => ({ ...prev, status: 'ASSIGNED' }))
      setRequests((prev) =>
        prev.map((r) =>
          (r.requestId || r.id) === ticketId ? { ...r, status: 'ASSIGNED' } : r
        )
      )

      setSuccessMessage('Technician dispatched successfully.')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      setAssignmentError(err?.message || 'Failed to dispatch technician.')
    } finally {
      setIsAssigning(false)
    }
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

  const filteredRequests = requests.filter((req) => {
    const reqStatus = String(req.status || '').toUpperCase()
    const isPast = reqStatus === 'COMPLETED' || reqStatus === 'CANCELLED'

    if (activeTab === 'active' && isPast) return false
    if (activeTab === 'history' && !isPast) return false

    const query = searchQuery.toLowerCase().trim()
    const ticketStr = String(req.requestId || req.id || '').toLowerCase()
    const desc = (req.description || '').toLowerCase()
    const cat = (req.category || '').toLowerCase()

    const matchesSearch =
      query === '' ||
      ticketStr.includes(query) ||
      desc.includes(query) ||
      cat.includes(query)

    const matchesStatus =
      statusFilter === 'all' || reqStatus === statusFilter.toUpperCase()

    const reqPriority = String(req.priority || '').toUpperCase()
    const matchesPriority =
      priorityFilter === 'all' || reqPriority === priorityFilter.toUpperCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

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
      defaultRole={ROLES.PROPERTY_MANAGER}
      activeItem="maintenance"
      pageTitle="Maintenance & Service Requests"
    >
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              to="/manager/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315A7D] hover:text-[#274B68] transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243447]">
                Maintenance & Service Requests
              </h1>
              <span className="font-mono text-xs font-bold text-[#315A7D] bg-[#EAF2F7] px-2.5 py-0.5 rounded-md border border-[#D9E0E6]">
                Operational
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5B6875]">
              Monitor repairs, assign service contractors, and track maintenance history across assigned properties.
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
            <Link to="/manager/properties">
              <Button variant="secondary" size="sm" leftIcon={<Building2 className="w-3.5 h-3.5" />}>
                Assigned Properties
              </Button>
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#3F7D58] shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="text-[#3F7D58] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F4B4B4] text-[#8A2E2C] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#8A2E2C] shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-[#8A2E2C] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Tab Selection */}
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

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#D9E0E6] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search ticket #, description, category..."
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
              <button
                type="button"
                onClick={resetFilters}
                title="Reset filters"
                className="p-2.5 rounded-lg border border-[#D9E0E6] text-[#5B6875] hover:text-[#243447] hover:bg-[#F7F8FA] transition-colors shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table / Results */}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-12 shadow-xs flex justify-center">
            <Loader text="Loading maintenance tickets..." size="md" center />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-8 shadow-xs">
            <EmptyState
              icon={<Wrench className="w-8 h-8" />}
              title="No maintenance tickets found"
              message="No service requests match your criteria."
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#D9E0E6] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3.5 pl-6 pr-4">Ticket #</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Property & Unit</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Assigned Worker</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm">
                  {filteredRequests.map((req) => {
                    const ticketId = req.requestId || req.id
                    const assignmentObj = ticketAssignments[ticketId]

                    return (
                      <tr key={ticketId} className="hover:bg-[#F7F8FA]/80 transition-colors">
                        <td className="py-4 pl-6 pr-4 font-mono font-semibold text-[#315A7D] text-xs">
                          #{ticketId}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-xs font-medium">
                          {formatCategoryLabel(req.category)}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          Property #{req.propertyId || 'ΓÇö'} {req.unitId ? `ΓÇó Unit #${req.unitId}` : ''}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                              req.priority
                            )}`}
                          >
                            {formatPriorityLabel(req.priority)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs whitespace-nowrap">
                          {assignmentObj?.worker ? (
                            <span className="inline-flex items-center gap-1 font-medium text-[#243447]">
                              <HardHat className="w-3.5 h-3.5 text-[#315A7D]" />
                              {assignmentObj.worker.name}
                            </span>
                          ) : (
                            <span className="text-[#8A5B16] bg-[#FEF7EC] px-2 py-0.5 rounded-full text-[11px] font-semibold border border-[#F4E2B6]">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={formatStatusLabel(req.status)} size="sm" />
                        </td>
                        <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenTicketModal(req)}
                          >
                            Manage
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manager Ticket Action & Assignment Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-[#D9E0E6] shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-[#D9E0E6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-[#243447] font-mono">
                    Ticket #{selectedTicket.requestId || selectedTicket.id}
                  </h3>
                  <StatusBadge status={formatStatusLabel(selectedTicket.status)} size="sm" />
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                      selectedTicket.priority
                    )}`}
                  >
                    {formatPriorityLabel(selectedTicket.priority)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded-md text-[#5B6875] hover:text-[#243447]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#243447]">
                {/* Issue Details */}
                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6] space-y-2">
                  <span className="font-bold text-xs text-[#5B6875] uppercase tracking-wider block">
                    Description & Property Context
                  </span>
                  <p className="text-xs leading-relaxed">{selectedTicket.description || 'No description.'}</p>
                  <div className="flex gap-4 pt-1 text-[11px] text-[#5B6875]">
                    <span>Property: #{selectedTicket.propertyId || 'ΓÇö'}</span>
                    <span>Unit: #{selectedTicket.unitId || 'ΓÇö'}</span>
                    <span>Tenant ID: #{selectedTicket.tenantId || 'ΓÇö'}</span>
                  </div>
                </div>

                {/* AI Prediction Quick Strip if Available */}
                {modalPrediction && (
                  <div className="p-3.5 rounded-xl bg-[#EAF2F7] border border-[#D9E0E6] space-y-1 text-xs">
                    <span className="font-bold text-[#315A7D] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#315A7D]" /> AI Risk Forecast (M5 Model):
                    </span>
                    <p className="text-[#243447]">
                      Risk Level: <strong>{modalPrediction.maintenance_risk?.risk_level}</strong> &bull; Failure Probability: <strong>{((modalPrediction.maintenance_risk?.probability || 0) * 100).toFixed(1)}%</strong> &bull; Forecasted Cost: <strong>Γé╣{Number(modalPrediction.next_month_maintenance_cost || 0).toLocaleString()}</strong>
                    </p>
                  </div>
                )}

                {/* Status Update Actions */}
                <div className="p-4 rounded-xl border border-[#D9E0E6] space-y-2">
                  <span className="font-bold text-xs text-[#5B6875] uppercase tracking-wider block">
                    Operational Status Transition
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {MAINTENANCE_STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleModalStatusChange(st)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          String(selectedTicket.status).toUpperCase() === st
                            ? 'bg-[#315A7D] text-white border-[#315A7D]'
                            : 'bg-[#F7F8FA] text-[#243447] border-[#D9E0E6] hover:bg-[#EAF2F7]'
                        }`}
                      >
                        {formatStatusLabel(st)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Worker Assignment Form */}
                <form
                  onSubmit={handleModalAssignWorker}
                  className="p-4 rounded-xl border border-[#D9E0E6] space-y-3"
                >
                  <span className="font-bold text-xs text-[#5B6875] uppercase tracking-wider block flex items-center gap-1.5">
                    <HardHat className="w-4 h-4 text-[#315A7D]" />
                    Dispatch Technician / Contractor
                  </span>

                  {assignmentError && (
                    <p className="text-xs text-[#8A2E2C]">{assignmentError}</p>
                  )}

                  <div>
                    <label className="block mb-1 font-semibold text-[#5B6875]">Select Technician</label>
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#D9E0E6] text-xs bg-[#F7F8FA]"
                    >
                      {availableWorkers.map((w) => (
                        <option key={w.workerId || w.id} value={w.workerId || w.id}>
                          {w.name} ({w.specialization || 'General'}) - {w.phone || 'No phone'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#5B6875]">Assignment Notes</label>
                    <Textarea
                      placeholder="Special instructions for service contractor..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isAssigning}
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    Confirm Dispatch & Assignment
                  </Button>
                </form>
              </div>

              <div className="p-4 border-t border-[#D9E0E6] bg-[#F7F8FA] flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
