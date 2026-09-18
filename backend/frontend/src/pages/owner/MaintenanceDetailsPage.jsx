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
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-12 shadow-xs flex justify-center">
            <Loader text="Loading maintenance ticket details..." size="md" center />
          </div>
        ) : !request ? (
          /* Not Found State */
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-8 shadow-xs">
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

            {/* Header Card */}
            <div className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447] font-mono">
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
                  <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
                    Submitted by <strong className="text-[#243447]">{request.tenantName}</strong> &bull; {request.propertyName} ({request.unitNumber}) &bull; {request.submittedDate}
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
            <div className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
                <Clock className="w-4 h-4 text-[#315A7D]" />
                Ticket Status Timeline
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex
                  const isCurrent = idx === currentStepIndex

                  return (
                    <div
                      key={step}
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
                            <CheckCircle2 className="w-3.5 h-3.5" />
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
                        {step}
                      </p>
                      <span className="text-[10px] text-[#5B6875] block">
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
              <div className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
                  <Wrench className="w-4 h-4 text-[#315A7D]" />
                  Issue Details
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Category</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                      {request.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Priority Level</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                        request.priority
                      )}`}
                    >
                      {request.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#5B6875]" /> Property
                    </span>
                    <span className="font-medium text-[#243447] text-right">
                      {request.propertyName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Unit Number</span>
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                      {request.unitNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#5B6875]" /> Tenant Name
                    </span>
                    <span className="font-semibold text-[#243447]">
                      {request.tenantName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5B6875]" /> Submitted Date
                    </span>
                    <span className="font-medium text-[#243447]">
                      {request.submittedDate}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#D9E0E6] space-y-1">
                    <span className="text-xs font-semibold text-[#243447] block">
                      Issue Description:
                    </span>
                    <p className="text-xs text-[#243447] leading-relaxed bg-[#F7F8FA] p-3 rounded-xl border border-[#D9E0E6]">
                      {request.description || request.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Worker-Assignment Section */}
              <div className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
                  <HardHat className="w-4 h-4 text-[#315A7D]" />
                  Assigned Service Technician
                </h2>

                <div className="p-4 rounded-xl border border-[#D9E0E6] bg-[#F7F8FA] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF2F7] text-[#315A7D] flex items-center justify-center font-bold text-sm shrink-0">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#243447] text-sm">
                        {request.assignedWorker?.name || 'Carlos Rivera'}
                      </p>
                      <p className="text-xs text-[#5B6875]">
                        {request.assignedWorker?.trade || 'Certified Master Technician'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-1 border-t border-[#D9E0E6]">
                    <div className="flex justify-between">
                      <span className="text-[#5B6875]">Service Provider:</span>
                      <span className="font-medium text-[#243447]">
                        {request.assignedWorker?.company || 'Apex Home Repairs LLC'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6875] flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#5B6875]" /> Phone Contact:
                      </span>
                      <span className="font-medium text-[#315A7D]">
                        {request.assignedWorker?.phone || '(555) 234-8901'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6875]">Dispatch Status:</span>
                      <span className="inline-flex items-center gap-1 font-medium text-[#2A583B]">
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
