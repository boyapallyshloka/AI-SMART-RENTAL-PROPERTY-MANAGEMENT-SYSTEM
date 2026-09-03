import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getPendingOwners } from '../../utils/adminMockData'
import {
  Button,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react'

export default function OwnerVerificationPage() {
  const [pendingOwners, setPendingOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionNotice, setActionNotice] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setPendingOwners(getPendingOwners())
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  const handleApprove = (ownerId, ownerName) => {
    setPendingOwners((prev) =>
      prev.map((owner) =>
        owner.id === ownerId
          ? { ...owner, verificationStatus: 'Approved', accountStatus: 'Active' }
          : owner
      )
    )
    setActionNotice(
      `Owner verification for ${ownerName} approved successfully. Account status set to Active.`
    )
    setTimeout(() => setActionNotice(''), 4000)
  }

  const handleReject = (ownerId, ownerName) => {
    setPendingOwners((prev) =>
      prev.map((owner) =>
        owner.id === ownerId
          ? { ...owner, verificationStatus: 'Rejected', accountStatus: 'Rejected' }
          : owner
      )
    )
    setActionNotice(
      `Owner verification for ${ownerName} rejected. Notification sent to applicant.`
    )
    setTimeout(() => setActionNotice(''), 4000)
  }

  return (
    <DashboardLayout
      defaultRole="admin"
      activeItem="owner-verification"
      pageTitle="Owner Verification"
    >
      <div className="space-y-6">
        {/* Action Notice Banner */}
        {actionNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice('')}
              className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Pending Owner Verifications
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Action Required
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Verify property ownership titles, business registration certificates, and identity documents
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Loading pending owner submissions..." size="md" center />
          </div>
        ) : pendingOwners.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<ShieldCheck className="w-8 h-8" />}
              title="All owner verifications up to date"
              message="There are no pending owner accounts awaiting document verification or identity approval."
            />
          </div>
        ) : (
          /* Verification Queue Table */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Displaying{' '}
                <strong className="text-slate-900 dark:text-white">
                  {pendingOwners.length}
                </strong>{' '}
                property owner verification {pendingOwners.length === 1 ? 'request' : 'requests'}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Admin Review Queue
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 pl-6 pr-4">Owner / Company</th>
                    <th className="py-3.5 px-4">Contact Email</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Document Status</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Verification Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {pendingOwners.map((owner) => {
                    const isDecided =
                      owner.verificationStatus === 'Approved' ||
                      owner.verificationStatus === 'Rejected'

                    return (
                      <tr
                        key={owner.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Owner / Company Name */}
                        <td className="py-4 pl-6 pr-4 font-semibold text-slate-900 dark:text-white min-w-[220px]">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>{owner.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs font-mono text-slate-600 dark:text-slate-300">
                          {owner.email}
                        </td>

                        {/* Submitted Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{owner.submittedDate}</span>
                          </div>
                        </td>

                        {/* Document Status */}
                        <td className="py-4 px-4 min-w-[220px]">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{owner.documentStatus}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={owner.verificationStatus} size="sm" />
                        </td>

                        {/* Approve and Reject Buttons */}
                        <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                          {isDecided ? (
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                                owner.verificationStatus === 'Approved'
                                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                                  : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800'
                              }`}
                            >
                              Decision Recorded
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleApprove(owner.id, owner.name)}
                                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(owner.id, owner.name)}
                                leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
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
