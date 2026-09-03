import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getMaintenanceRequestById } from '../../utils/maintenanceMockData'
import {
  Button,
  StatusBadge,
  EmptyState,
  Loader,
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
} from 'lucide-react'

const TIMELINE_STEPS = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']

export default function MaintenanceDetailsPage() {
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Brief simulated loading to showcase Loader component
    const timer = setTimeout(() => {
      const found = getMaintenanceRequestById(id)
      if (found) {
        setRequest(found)
        setCurrentStatus(found.status)
      }
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [id])

  const handleMarkAsResolved = () => {
    setCurrentStatus('Resolved')
    setSuccessMessage(
      `Ticket #${request.ticketNumber} has been successfully marked as resolved.`
    )
  }

  // Priority badge styling helper
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

  // Calculate current stage index for timeline
  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (step) => step.toLowerCase() === currentStatus.toLowerCase()
  )

  const isResolvedOrClosed =
    currentStatus.toLowerCase() === 'resolved' ||
    currentStatus.toLowerCase() === 'closed'

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="maintenance"
      pageTitle={request ? `Ticket: ${request.ticketNumber}` : 'Maintenance Details'}
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Loading maintenance ticket details..." size="md" center />
          </div>
        ) : !request ? (
          /* Not Found State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<FileCheck className="w-8 h-8" />}
              title="Ticket Not Found"
              message={`No maintenance ticket matching reference ID "${id}" could be found.`}
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
            {/* Success Message Alert */}
            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage('')}
                  className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 font-bold px-1"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                      {request.ticketNumber}
                    </h1>
                    <StatusBadge status={currentStatus} size="md" />
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                        request.priority
                      )}`}
                    >
                      {request.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Submitted by <strong className="text-slate-700 dark:text-slate-300">{request.tenantName}</strong> &bull; {request.propertyName} ({request.unitNumber}) &bull; {request.submittedDate}
                  </p>
                </div>

                {/* Mark as Resolved Action */}
                <div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={handleMarkAsResolved}
                    disabled={isResolvedOrClosed}
                  >
                    {isResolvedOrClosed ? 'Ticket Resolved' : 'Mark as Resolved'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Simple Status Timeline: Open → Assigned → In Progress → Resolved → Closed */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Ticket Status Timeline
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex
                  const isCurrent = idx === currentStepIndex
                  const isUpcoming = idx > currentStepIndex

                  return (
                    <div
                      key={step}
                      className={`p-3.5 rounded-xl border text-center space-y-1.5 transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                          : isCompleted
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex justify-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-indigo-600 text-white animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                      </div>
                      <p
                        className={`text-xs font-semibold ${
                          isCurrent
                            ? 'text-indigo-900 dark:text-indigo-200'
                            : isCompleted
                            ? 'text-emerald-900 dark:text-emerald-200'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {step}
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        {isCurrent
                          ? 'Current Status'
                          : isCompleted
                          ? 'Completed'
                          : 'Upcoming'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ticket Details & Description */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Issue Details
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Category</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
                      {request.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Priority Level</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                        request.priority
                      )}`}
                    >
                      {request.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> Property
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white text-right">
                      {request.propertyName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Unit Number</span>
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {request.unitNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Tenant Name
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {request.tenantName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submitted Date
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {request.submittedDate}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Issue Description:
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {request.description || request.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Placeholder Worker-Assignment Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <HardHat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Assigned Service Technician
                </h2>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {request.assignedWorker?.name || 'Carlos Rivera'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {request.assignedWorker?.trade || 'Certified Master Technician'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service Provider:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {request.assignedWorker?.company || 'Apex Home Repairs LLC'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> Phone Contact:
                      </span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {request.assignedWorker?.phone || '(555) 234-8901'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dispatch Status:</span>
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {request.assignedWorker?.status || 'Dispatched on site'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
