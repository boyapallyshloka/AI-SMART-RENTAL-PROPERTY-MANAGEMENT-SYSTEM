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
          <div className="p-3.5 rounded-md bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3F7D58] shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice('')}
              className="text-[#2A583B] hover:text-[#243447] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                Pending Owner Verifications
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FEF7EC] text-[#8A5B16] border border-[#F4E2B6] shadow-2xs">
                Action Required
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1 font-normal">
              Verify property ownership titles, business registration certificates, and identity documents
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-12 shadow-2xs flex justify-center">
            <Loader text="Loading pending owner submissions..." size="md" center />
          </div>
        ) : pendingOwners.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-8 shadow-2xs">
            <EmptyState
              icon={<ShieldCheck className="w-8 h-8" />}
              title="All owner verifications up to date"
              message="There are no pending owner accounts awaiting document verification or identity approval."
            />
          </div>
        ) : (
          /* Verification Queue Table */
          <div className="bg-white rounded-lg border border-[#D9E0E6] shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#D9E0E6] flex items-center justify-between bg-white">
              <span className="text-xs text-[#5B6875]">
                Displaying{' '}
                <strong className="text-[#243447]">
                  {pendingOwners.length}
                </strong>{' '}
                property owner verification {pendingOwners.length === 1 ? 'request' : 'requests'}
              </span>
              <span className="text-xs font-semibold text-[#8A5B16] bg-[#FEF7EC] border border-[#F4E2B6] px-2 py-0.5 rounded">
                Admin Review Queue
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3 pl-6 pr-4">Owner / Company</th>
                    <th className="py-3 px-4">Contact Email</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Document Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 pr-6 text-right">Verification Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm bg-white">
                  {pendingOwners.map((owner) => {
                    const isDecided =
                      owner.verificationStatus === 'Approved' ||
                      owner.verificationStatus === 'Rejected'

                    return (
                      <tr
                        key={owner.id}
                        className="hover:bg-[#F7F8FA] transition-colors"
                      >
                        {/* Owner / Company Name */}
                        <td className="py-4 pl-6 pr-4 font-semibold text-[#243447] min-w-[220px]">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#315A7D] shrink-0" />
                            <span>{owner.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs font-mono text-[#5B6875]">
                          {owner.email}
                        </td>

                        {/* Submitted Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-[#5B6875]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                            <span>{owner.submittedDate}</span>
                          </div>
                        </td>

                        {/* Document Status */}
                        <td className="py-4 px-4 min-w-[220px]">
                          <div className="flex items-center gap-1.5 text-xs text-[#243447] font-medium">
                            <FileText className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
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
                              className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                                owner.verificationStatus === 'Approved'
                                  ? 'text-[#2A583B] bg-[#EDF7EE] border-[#C6DEC8]'
                                  : 'text-[#8A2E2C] bg-[#FDF2F2] border-[#EFC8C7]'
                              }`}
                            >
                              Decision Recorded
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2.5">
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
                                variant="danger"
                                onClick={() => handleReject(owner.id, owner.name)}
                                leftIcon={<XCircle className="w-3.5 h-3.5 text-[#B94A48]" />}
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
