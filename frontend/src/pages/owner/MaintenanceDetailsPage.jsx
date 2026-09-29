import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getMaintenanceRequestById,
  updateMaintenanceStatus,
  getMaintenanceWorkers,
  getMaintenanceAssignments,
  createMaintenanceAssignment,
  predictMaintenance,
  formatCategoryLabel,
  formatPriorityLabel,
  formatStatusLabel,
  getPriorityBadgeClass,
  MAINTENANCE_STATUSES,
} from '../../api/maintenanceApi'
import {
  Button,
  StatusBadge,
  EmptyState,
  Loader,
  Input,
  Select,
  Textarea,
} from '../../components/ui'
import {
  ArrowLeft,
  Wrench,
  User,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileCheck,
  Phone,
  HardHat,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShieldAlert,
  Check,
  Activity,
  UserPlus,
  RefreshCw,
  ImageIcon,
  Info,
} from 'lucide-react'

const TIMELINE_STEPS = [
  { key: 'OPEN', label: 'Open' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Resolved' },
]

export default function MaintenanceDetailsPage() {
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(false)

  // Worker Assignment State
  const [assignment, setAssignment] = useState(null)
  const [availableWorkers, setAvailableWorkers] = useState([])
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [assignmentNotes, setAssignmentNotes] = useState('')
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignmentError, setAssignmentError] = useState('')

  // AI Predictive Maintenance State
  const [prediction, setPrediction] = useState(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionError, setPredictionError] = useState('')

  // Load ticket details and associated data
  const loadTicketDetails = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await getMaintenanceRequestById(id)
      setRequest(data)

      // Fetch workers and assignments
      try {
        const [workersData, assignmentsData] = await Promise.allSettled([
          getMaintenanceWorkers(),
          getMaintenanceAssignments(),
        ])

        if (workersData.status === 'fulfilled' && Array.isArray(workersData.value)) {
          setAvailableWorkers(workersData.value)
          if (workersData.value.length > 0 && !selectedWorkerId) {
            setSelectedWorkerId(String(workersData.value[0].workerId || workersData.value[0].id))
          }
        }

        if (assignmentsData.status === 'fulfilled' && Array.isArray(assignmentsData.value)) {
          const match = assignmentsData.value.find(
            (a) =>
              String(a.maintenanceRequest?.requestId || a.maintenanceRequest?.id) === String(id)
          )
          if (match) {
            setAssignment(match)
          }
        }
      } catch (subErr) {
        console.warn('Worker/assignment load warning:', subErr)
      }

      // Fetch AI Predictive Maintenance if propertyId is present
      if (data?.propertyId) {
        loadPrediction(data.propertyId, data.unitId)
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.originalError?.message ||
        `No maintenance ticket matching ID "${id}" could be found.`
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  const loadPrediction = async (propertyId, unitId) => {
    setPredictionLoading(true)
    setPredictionError('')
    try {
      const pred = await predictMaintenance(propertyId, unitId)
      setPrediction(pred)
    } catch (err) {
      setPredictionError(
        'Predictive maintenance telemetry currently unavailable for this property/unit.'
      )
    } finally {
      setPredictionLoading(false)
    }
  }

  useEffect(() => {
    loadTicketDetails()
  }, [id])

  // Status Change Handler with real backend persistence
  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true)
    setSuccessMessage('')
    setErrorMessage('')
    try {
      const updated = await updateMaintenanceStatus(id, newStatus)
      setRequest((prev) => ({
        ...prev,
        status: updated?.status || newStatus,
        completedDate: updated?.completedDate || prev?.completedDate,
      }))
      setSuccessMessage(
        `Ticket #${id} status updated to ${formatStatusLabel(newStatus)}.`
      )
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      const msg =
        err?.message ||
        err?.originalError?.message ||
        'Failed to update maintenance status on backend.'
      setErrorMessage(msg)
    } finally {
      setStatusUpdating(false)
    }
  }

  // Worker Assignment Handler with real backend persistence
  const handleAssignWorker = async (e) => {
    e.preventDefault()
    if (!selectedWorkerId) {
      setAssignmentError('Please select a technician to dispatch.')
      return
    }

    setIsAssigning(true)
    setAssignmentError('')
    setSuccessMessage('')
    try {
      const payload = {
        maintenanceRequest: {
          requestId: Number(id),
        },
        worker: {
          workerId: Number(selectedWorkerId),
        },
        status: 'ASSIGNED',
        notes: assignmentNotes.trim() || undefined,
        estimatedCompletionDate: estimatedCompletionDate || undefined,
      }

      const newAssignment = await createMaintenanceAssignment(payload)
      setAssignment(newAssignment)

      // Automatically transition ticket status to ASSIGNED if currently OPEN or ACCEPTED
      const currentNorm = String(request?.status || '').toUpperCase()
      if (currentNorm === 'OPEN' || currentNorm === 'ACCEPTED') {
        await updateMaintenanceStatus(id, 'ASSIGNED')
        setRequest((prev) => ({ ...prev, status: 'ASSIGNED' }))
      }

      setSuccessMessage('Technician successfully assigned and dispatched!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      const msg =
        err?.message ||
        err?.originalError?.message ||
        'Failed to assign maintenance technician. Please try again.'
      setAssignmentError(msg)
    } finally {
      setIsAssigning(false)
    }
  }

  const currentStatusNorm = String(request?.status || '').toUpperCase()
  const isResolvedOrClosed =
    currentStatusNorm === 'COMPLETED' || currentStatusNorm === 'CANCELLED'

  // Determine current timeline index
  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (s) => s.key === currentStatusNorm
  )

  // Status badge styling helper
  const getStatusBadge = (status) => {
    return <StatusBadge status={formatStatusLabel(status)} size="md" />
  }

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="maintenance"
      pageTitle={request ? `Ticket #${request.requestId || id}` : 'Maintenance Details'}
    >
      <div className="space-y-6">
        {/* Back Navigation Button */}
        <div>
          <Link to="/owner/maintenance">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Maintenance
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-12 shadow-xs flex justify-center">
            <Loader text="Loading maintenance ticket details..." size="md" center />
          </div>
        ) : !request ? (
          /* Not Found State */
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-8 shadow-xs">
            <EmptyState
              icon={<FileCheck className="w-8 h-8" />}
              title="Ticket Not Found"
              message={errorMessage || `No maintenance ticket matching reference ID "${id}" could be found.`}
              action={
                <Link to="/owner/maintenance">
                  <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Back to Maintenance
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {/* Success Alert */}
            {successMessage && (
              <div className="p-4 rounded-xl bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#3F7D58] shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage('')}
                  className="text-[#3F7D58] hover:text-[#2A583B] font-bold px-1"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Error Alert */}
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

            {/* Header Card */}
            <div className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447] font-mono">
                      Ticket #{request.requestId || id}
                    </h1>
                    {getStatusBadge(request.status)}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                        request.priority
                      )}`}
                    >
                      {formatPriorityLabel(request.priority)} Priority
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                      {formatCategoryLabel(request.category)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5B6875] mt-1.5">
                    Property #{request.propertyId || '—'} {request.unitId ? `• Unit #${request.unitId}` : ''}
                    {' '}&bull; Submitted: {request.requestedDate ? new Date(request.requestedDate).toLocaleString() : 'Recent'}
                  </p>
                </div>

                {/* Status Transition Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {currentStatusNorm === 'OPEN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('ACCEPTED')}
                      isLoading={statusUpdating}
                    >
                      Accept Ticket
                    </Button>
                  )}

                  {currentStatusNorm === 'ACCEPTED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('IN_PROGRESS')}
                      isLoading={statusUpdating}
                    >
                      Start Work
                    </Button>
                  )}

                  {currentStatusNorm === 'ASSIGNED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('IN_PROGRESS')}
                      isLoading={statusUpdating}
                    >
                      Mark In Progress
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleStatusChange('COMPLETED')}
                    disabled={isResolvedOrClosed || statusUpdating}
                    isLoading={statusUpdating}
                  >
                    {isResolvedOrClosed ? 'Ticket Resolved' : 'Mark as Resolved'}
                  </Button>

                  {currentStatusNorm !== 'CANCELLED' && currentStatusNorm !== 'COMPLETED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('CANCELLED')}
                      disabled={statusUpdating}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Lifecycle Status Timeline */}
            <div className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#315A7D]" />
                  Ticket Status Lifecycle
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5B6875]">Update Status:</span>
                  <select
                    value={currentStatusNorm}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusUpdating}
                    className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:outline-hidden focus:border-[#315A7D]"
                  >
                    {MAINTENANCE_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {formatStatusLabel(st)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted =
                    currentStepIndex >= 0 && idx < currentStepIndex
                  const isCurrent =
                    currentStepIndex >= 0 && idx === currentStepIndex

                  return (
                    <div
                      key={step.key}
                      className={`p-3.5 rounded-xl border text-center space-y-1.5 transition-colors ${
                        isCurrent
                          ? 'bg-[#EAF2F7] border-[#315A7D] shadow-2xs'
                          : isCompleted
                          ? 'bg-[#EDF7EE] border-[#C6DEC8]'
                          : 'bg-[#F7F8FA] border-[#D9E0E6] opacity-70'
                      }`}
                    >
                      <div className="flex justify-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-[#315A7D] text-white animate-pulse'
                              : isCompleted
                              ? 'bg-[#3F7D58] text-white'
                              : 'bg-[#D9E0E6] text-[#5B6875]'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                      </div>
                      <p
                        className={`text-xs font-semibold ${
                          isCurrent
                            ? 'text-[#315A7D]'
                            : isCompleted
                            ? 'text-[#2A583B]'
                            : 'text-[#5B6875]'
                        }`}
                      >
                        {step.label}
                      </p>
                      <span className="text-[10px] text-[#5B6875] block">
                        {isCurrent
                          ? 'Current'
                          : isCompleted
                          ? 'Completed'
                          : 'Upcoming'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI PREDICTIVE MAINTENANCE & PREVENTIVE RECOMMENDATIONS SECTION */}
            <div className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E6] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#EAF2F7] text-[#315A7D]">
                    <Sparkles className="w-5 h-5 text-[#315A7D]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#243447] flex items-center gap-2">
                      AI Predictive Maintenance Analytics
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                        M5 ML Pipeline
                      </span>
                    </h2>
                    <p className="text-xs text-[#5B6875] mt-0.5">
                      Machine learning degradation forecast for Property #{request.propertyId || '—'} {request.unitId ? `(Unit #${request.unitId})` : ''}
                    </p>
                  </div>
                </div>

                {request.propertyId && (
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${predictionLoading ? 'animate-spin' : ''}`} />}
                    onClick={() => loadPrediction(request.propertyId, request.unitId)}
                    disabled={predictionLoading}
                  >
                    Re-evaluate
                  </Button>
                )}
              </div>

              {predictionLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader text="Synthesizing asset telemetry & risk models..." size="sm" center />
                </div>
              ) : predictionError ? (
                <div className="p-4 rounded-xl bg-[#FEF7EC] border border-[#F4E2B6] text-[#8A5B16] text-xs flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-[#B7791F] shrink-0" />
                  <span>{predictionError}</span>
                </div>
              ) : prediction ? (
                <div className="space-y-4">
                  {/* 4 Quantitative ML Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Metric 1: Maintenance Risk Level */}
                    <div className="p-4 rounded-xl border border-[#D9E0E6] bg-[#F7F8FA] space-y-1.5">
                      <span className="text-xs text-[#5B6875] font-medium flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-[#315A7D]" /> Risk Classification
                      </span>
                      <div className="text-lg font-bold text-[#243447] flex items-center gap-2">
                        <span>
                          {prediction.maintenance_risk?.risk_level || 'Evaluated'}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                            String(prediction.maintenance_risk?.risk_level).toUpperCase() === 'HIGH'
                              ? 'bg-[#FDF2F2] text-[#8A2E2C] border-[#F4B4B4]'
                              : String(prediction.maintenance_risk?.risk_level).toUpperCase() === 'MEDIUM'
                              ? 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]'
                              : 'bg-[#EDF7EE] text-[#2A583B] border-[#C6DEC8]'
                          }`}
                        >
                          {prediction.maintenance_risk?.risk_level || 'Active'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5B6875]">Gradient Boosting ML</p>
                    </div>

                    {/* Metric 2: Failure Probability */}
                    <div className="p-4 rounded-xl border border-[#D9E0E6] bg-[#F7F8FA] space-y-1.5">
                      <span className="text-xs text-[#5B6875] font-medium flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-[#315A7D]" /> Failure Probability
                      </span>
                      <div className="text-xl font-extrabold text-[#315A7D]">
                        {prediction.maintenance_risk?.probability != null
                          ? `${(prediction.maintenance_risk.probability * 100).toFixed(1)}%`
                          : '—'}
                      </div>
                      <p className="text-[11px] text-[#5B6875]">Confidence Score</p>
                    </div>

                    {/* Metric 3: Next Month Incident Forecast */}
                    <div className="p-4 rounded-xl border border-[#D9E0E6] bg-[#F7F8FA] space-y-1.5">
                      <span className="text-xs text-[#5B6875] font-medium flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-[#315A7D]" /> Forecasted Incidents
                      </span>
                      <div className="text-xl font-extrabold text-[#243447]">
                        {prediction.next_month_maintenance_count != null
                          ? `${Number(prediction.next_month_maintenance_count).toFixed(1)}`
                          : '0.0'}
                        <span className="text-xs font-normal text-[#5B6875] ml-1">events/mo</span>
                      </div>
                      <p className="text-[11px] text-[#5B6875]">30-Day Window Horizon</p>
                    </div>

                    {/* Metric 4: Projected Maintenance Cost */}
                    <div className="p-4 rounded-xl border border-[#D9E0E6] bg-[#F7F8FA] space-y-1.5">
                      <span className="text-xs text-[#5B6875] font-medium flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-[#3F7D58]" /> Expected Monthly Cost
                      </span>
                      <div className="text-xl font-extrabold text-[#2A583B]">
                        {prediction.next_month_maintenance_cost != null
                          ? `₹${Number(prediction.next_month_maintenance_cost).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}`
                          : '₹0'}
                      </div>
                      <p className="text-[11px] text-[#5B6875]">HistGradientBoosting Estimate</p>
                    </div>
                  </div>

                  {/* Clearly Separated Actionable Preventive Recommendations */}
                  <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#243447] flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#315A7D]" />
                        Actionable Preventive Guidance
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#5B6875] bg-white px-2 py-0.5 rounded-md border border-[#D9E0E6]">
                        Frontend-Derived Guidance
                      </span>
                    </div>
                    <p className="text-xs text-[#243447] leading-relaxed">
                      {String(prediction.maintenance_risk?.risk_level).toUpperCase() === 'HIGH'
                        ? `Critical preventive notice: Elevated failure risk detected (${(
                            (prediction.maintenance_risk?.probability || 0) * 100
                          ).toFixed(1)}%). We recommend scheduling a certified technician inspection for ${formatCategoryLabel(
                            request.category
                          )} fixtures within 7 days to forestall emergent failures and curb estimated monthly expenses (₹${Number(
                            prediction.next_month_maintenance_cost || 0
                          ).toLocaleString()}).`
                        : String(prediction.maintenance_risk?.risk_level).toUpperCase() === 'MEDIUM'
                        ? `Standard preventive notice: Moderate equipment wear detected. Dispatch regular servicing for ${formatCategoryLabel(
                            request.category
                          )} equipment prior to next billing cycle.`
                        : `Low risk profile: Asset degradation metrics are within healthy nominal limits. Standard periodic maintenance routine recommended.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6] text-xs text-[#5B6875] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#315A7D] shrink-0" />
                  <span>No predictive maintenance data generated yet. Click Re-evaluate above.</span>
                </div>
              )}
            </div>

            {/* Main 2-Column Grid: Issue Details & Worker Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Issue Details */}
              <div className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
                  <Wrench className="w-4 h-4 text-[#315A7D]" />
                  Issue Details
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Category</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                      {formatCategoryLabel(request.category)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Priority Level</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                        request.priority
                      )}`}
                    >
                      {formatPriorityLabel(request.priority)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#5B6875]" /> Leased Property
                    </span>
                    <span className="font-medium text-[#243447] text-right">
                      Property #{request.propertyId || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Unit Number</span>
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                      Unit #{request.unitId || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#5B6875]" /> Tenant ID
                    </span>
                    <span className="font-semibold text-[#243447]">
                      Tenant #{request.tenantId || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5B6875]" /> Requested Date
                    </span>
                    <span className="font-medium text-[#243447]">
                      {request.requestedDate
                        ? new Date(request.requestedDate).toLocaleString()
                        : 'Recent'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#D9E0E6] space-y-1">
                    <span className="text-xs font-semibold text-[#243447] block">
                      Issue Description:
                    </span>
                    <p className="text-xs text-[#243447] leading-relaxed bg-[#F7F8FA] p-3 rounded-xl border border-[#D9E0E6]">
                      {request.description || 'No description provided.'}
                    </p>
                  </div>

                  {request.imageUrl && (
                    <div className="pt-2 border-t border-[#D9E0E6] space-y-1.5">
                      <span className="text-xs font-semibold text-[#243447] block">
                        Attached Issue Photo:
                      </span>
                      <div className="rounded-xl border border-[#D9E0E6] overflow-hidden bg-[#F7F8FA] p-2 flex justify-center max-h-56">
                        <img
                          src={request.imageUrl}
                          alt="Issue attachment"
                          className="w-full h-auto object-contain max-h-52 rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Completed / Maintenance History metadata */}
                  {isResolvedOrClosed && (
                    <div className="pt-3 border-t border-[#D9E0E6] space-y-2">
                      <span className="text-xs font-bold text-[#2A583B] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#3F7D58]" />
                        Resolution & Completion History
                      </span>
                      <div className="p-3 rounded-xl bg-[#EDF7EE] border border-[#C6DEC8] text-xs space-y-1.5 text-[#2A583B]">
                        <div className="flex justify-between">
                          <span>Completed Date:</span>
                          <strong>
                            {request.completedDate
                              ? new Date(request.completedDate).toLocaleString()
                              : 'Marked Completed'}
                          </strong>
                        </div>
                        {request.cost != null && (
                          <div className="flex justify-between">
                            <span>Actual Repair Cost:</span>
                            <strong className="text-sm font-bold">₹{request.cost}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Worker Assignment Section */}
              <div className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                  <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-[#315A7D]" />
                    Assigned Service Technician
                  </h2>
                  {assignment ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EDF7EE] text-[#2A583B] border border-[#C6DEC8]">
                      <CheckCircle2 className="w-3 h-3 text-[#3F7D58]" /> Assigned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FEF7EC] text-[#8A5B16] border border-[#F4E2B6]">
                      <AlertCircle className="w-3 h-3 text-[#B7791F]" /> Unassigned
                    </span>
                  )}
                </div>

                {assignmentError && (
                  <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F4B4B4] text-[#8A2E2C] text-xs">
                    {assignmentError}
                  </div>
                )}

                {/* If already assigned, display technician card */}
                {assignment ? (
                  <div className="p-4 rounded-xl border border-[#D9E0E6] bg-[#F7F8FA] space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF2F7] text-[#315A7D] flex items-center justify-center font-bold text-sm shrink-0">
                        <HardHat className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#243447] text-sm">
                          {assignment.worker?.name || 'Assigned Technician'}
                        </p>
                        <p className="text-xs text-[#5B6875]">
                          {assignment.worker?.specialization || 'Maintenance Specialist'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-2 border-t border-[#D9E0E6]">
                      <div className="flex justify-between">
                        <span className="text-[#5B6875]">Worker ID:</span>
                        <span className="font-medium text-[#243447]">
                          #{assignment.worker?.workerId || assignment.worker?.id || '—'}
                        </span>
                      </div>
                      {assignment.worker?.phone && (
                        <div className="flex justify-between">
                          <span className="text-[#5B6875] flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#5B6875]" /> Phone Contact:
                          </span>
                          <span className="font-medium text-[#315A7D]">
                            {assignment.worker.phone}
                          </span>
                        </div>
                      )}
                      {assignment.worker?.email && (
                        <div className="flex justify-between">
                          <span className="text-[#5B6875]">Email:</span>
                          <span className="font-medium text-[#243447]">
                            {assignment.worker.email}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#5B6875]">Assignment Status:</span>
                        <span className="inline-flex items-center gap-1 font-medium text-[#2A583B]">
                          <CheckCircle2 className="w-3 h-3" />
                          {assignment.status || 'ASSIGNED'}
                        </span>
                      </div>
                      {assignment.assignedAt && (
                        <div className="flex justify-between">
                          <span className="text-[#5B6875]">Assigned Date:</span>
                          <span className="font-medium text-[#243447]">
                            {new Date(assignment.assignedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {assignment.notes && (
                        <div className="pt-2 border-t border-[#D9E0E6]">
                          <span className="text-[#5B6875] block">Dispatch Notes:</span>
                          <p className="text-[#243447] italic mt-0.5">{assignment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Worker Assignment Form (always available to assign or reassign) */}
                <form
                  onSubmit={handleAssignWorker}
                  className="p-4 rounded-xl border border-[#D9E0E6] bg-white space-y-3 text-xs"
                >
                  <p className="font-semibold text-[#243447] text-xs flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-[#315A7D]" />
                    {assignment ? 'Reassign / Dispatch Different Worker' : 'Dispatch Service Worker'}
                  </p>

                  <div>
                    <label className="block mb-1 text-[11px] font-semibold text-[#5B6875]">
                      Select Available Technician
                    </label>
                    {availableWorkers.length > 0 ? (
                      <select
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-[#D9E0E6] text-xs bg-[#F7F8FA] text-[#243447] focus:outline-hidden focus:border-[#315A7D]"
                      >
                        {availableWorkers.map((w) => (
                          <option key={w.workerId || w.id} value={w.workerId || w.id}>
                            {w.name} ({w.specialization || 'Technician'}) - Phone: {w.phone || 'N/A'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-1">
                        <Input
                          placeholder="Worker ID (e.g. 1)"
                          value={selectedWorkerId}
                          onChange={(e) => setSelectedWorkerId(e.target.value)}
                          helperText="Enter technician ID to assign"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] font-semibold text-[#5B6875]">
                      Estimated Completion Date (Optional)
                    </label>
                    <Input
                      type="date"
                      value={estimatedCompletionDate}
                      onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] font-semibold text-[#5B6875]">
                      Assignment Notes / Instructions
                    </label>
                    <Textarea
                      placeholder="e.g. Bring standard 1.5in P-trap replacements and pipe sealant..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isAssigning}
                      leftIcon={<HardHat className="w-3.5 h-3.5" />}
                    >
                      {assignment ? 'Update Assignment' : 'Dispatch Worker'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
