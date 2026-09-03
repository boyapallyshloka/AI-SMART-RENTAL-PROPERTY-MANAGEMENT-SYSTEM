import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getApplicationById,
  updateApplicationStatus,
} from '../../utils/applicationMockData'
import {
  Button,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  ArrowLeft,
  User,
  Building2,
  DollarSign,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileCheck,
  AlertCircle,
} from 'lucide-react'

export default function ApplicationDetailsPage() {
  const { id } = useParams()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState(null) // 'approve' | 'reject' | null

  useEffect(() => {
    // Brief simulated loading to demonstrate Loader component
    const timer = setTimeout(() => {
      const found = getApplicationById(id)
      if (found) {
        setApplication(found)
        setCurrentStatus(found.status)
      }
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [id])

  const handleStartApprove = () => {
    setSuccessMessage('')
    setConfirmAction('approve')
  }

  const handleStartReject = () => {
    setSuccessMessage('')
    setConfirmAction('reject')
  }

  const handleConfirmApprove = () => {
    updateApplicationStatus(application.id, 'Approved')
    setCurrentStatus('Approved')
    setConfirmAction(null)
    setSuccessMessage(
      `Application for ${application.applicantName} has been approved successfully.`
    )
  }

  const handleConfirmReject = () => {
    updateApplicationStatus(application.id, 'Rejected')
    setCurrentStatus('Rejected')
    setConfirmAction(null)
    setSuccessMessage(
      `Application for ${application.applicantName} has been rejected.`
    )
  }

  const isDecided = currentStatus === 'Approved' || currentStatus === 'Rejected'

  // Sample uploaded documents
  const sampleDocuments = [
    {
      id: 'doc-1',
      title: 'ID Proof',
      subtitle: 'Government-Issued Photo ID / Driver License',
      size: '2.1 MB',
    },
    {
      id: 'doc-2',
      title: 'Income Proof',
      subtitle: 'Recent 3-Month Paystubs & W-2 Summary',
      size: '1.4 MB',
    },
    {
      id: 'doc-3',
      title: 'Rental History',
      subtitle: 'Previous Landlord Reference & Verification Letter',
      size: '890 KB',
    },
  ]

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="applications"
      pageTitle={application ? `Application: ${application.applicantName}` : 'Application Details'}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <div>
          <Link to="/owner/applications">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Applications
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Loading application details..." size="md" center />
          </div>
        ) : !application ? (
          /* Empty / Not Found State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<FileCheck className="w-8 h-8" />}
              title="Application Not Found"
              message={`No rental application matching reference ID "${id}" could be located.`}
              action={
                <Link to="/owner/applications">
                  <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Back to Applications
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {/* Success Message Banner */}
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

            {/* Confirmation Panel for Approve */}
            {confirmAction === 'approve' && (
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/90 dark:bg-emerald-950/50 space-y-3 shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-100 font-semibold text-sm">
                  <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Confirm Approval</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-200/90">
                  Are you sure you want to approve the rental application for <strong>{application.applicantName}</strong> for <strong>{application.propertyName} ({application.unit})</strong>? This status change will be saved.
                </p>
                <div className="flex items-center gap-2.5 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={handleConfirmApprove}
                  >
                    Yes, Confirm Approval
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmAction(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Confirmation Panel for Reject */}
            {confirmAction === 'reject' && (
              <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-800/80 bg-rose-50/90 dark:bg-rose-950/50 space-y-3 shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-100 font-semibold text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Confirm Rejection</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-800/90 dark:text-rose-200/90">
                  Are you sure you want to reject the rental application for <strong>{application.applicantName}</strong>? This decision will be permanently recorded.
                </p>
                <div className="flex items-center gap-2.5 pt-1">
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<XCircle className="w-4 h-4" />}
                    onClick={handleConfirmReject}
                  >
                    Yes, Confirm Rejection
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmAction(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {application.applicantName}
                    </h1>
                    <StatusBadge status={currentStatus} size="md" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Application ID: <span className="font-mono text-slate-700 dark:text-slate-300">{application.id}</span> &bull; Submitted on {application.submittedDate}
                  </p>
                </div>

                {/* Approve / Reject Actions (Disabled after final decision) */}
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<XCircle className="w-4 h-4" />}
                    onClick={handleStartReject}
                    disabled={isDecided || confirmAction !== null}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={handleStartApprove}
                    disabled={isDecided || confirmAction !== null}
                  >
                    Approve
                  </Button>
                  {isDecided && (
                    <span className="text-xs text-slate-400 font-medium ml-1">
                      Final decision recorded
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Applicant Information Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Applicant Information
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Full Name</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {application.applicantName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {application.email || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {application.phone || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Monthly Income
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ${Number(application.monthlyIncome || 0).toLocaleString()} / month
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Employment Status
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {application.employmentStatus || 'Employed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Property & Application Details Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Property & Application Details
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Applied Property</span>
                    <span className="font-medium text-slate-900 dark:text-white text-right">
                      {application.propertyName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Unit Number</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {application.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submission Date
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {application.submittedDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Current Status</span>
                    <StatusBadge status={currentStatus} size="sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Uploaded Documents
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {sampleDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3"
                  >
                    <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {doc.subtitle}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                        <span className="text-[11px] text-slate-400">&bull; {doc.size}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
