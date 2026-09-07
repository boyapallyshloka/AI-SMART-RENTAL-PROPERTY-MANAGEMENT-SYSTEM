import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getInvoiceById } from '../../utils/paymentMockData'
import {
  Button,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  ArrowLeft,
  Receipt,
  User,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  Info,
} from 'lucide-react'

export default function PaymentDetailsPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noticeMessage, setNoticeMessage] = useState('')

  useEffect(() => {
    // Brief simulated loading to demonstrate Loader component
    const timer = setTimeout(() => {
      const found = getInvoiceById(id)
      if (found) {
        setInvoice(found)
      }
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [id])

  const handleDownloadReceipt = () => {
    setNoticeMessage('Receipt download coming soon.')
    setTimeout(() => setNoticeMessage(''), 3500)
  }

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="payments"
      pageTitle={invoice ? `Invoice: ${invoice.invoiceNumber}` : 'Payment Details'}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <div>
          <Link to="/owner/payments">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Payments
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Loading payment invoice details..." size="md" center />
          </div>
        ) : !invoice ? (
          /* Not Found State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<FileCheck className="w-8 h-8" />}
              title="Invoice Not Found"
              message={`No payment invoice record matching ID "${id}" could be located.`}
              action={
                <Link to="/owner/payments">
                  <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Back to Payments
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {/* Notice Banner */}
            {noticeMessage && (
              <div className="p-4 rounded-xl bg-[#EAF2F7] border border-[#D9E0E6] text-[#315A7D] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#315A7D] shrink-0" />
                  <span>{noticeMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNoticeMessage('')}
                  className="text-[#315A7D] hover:text-[#274B68] font-bold px-1"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447] font-mono">
                      {invoice.invoiceNumber}
                    </h1>
                    <StatusBadge status={invoice.status} size="md" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
                    Issued to <strong className="text-[#243447]">{invoice.tenantName}</strong> &bull; {invoice.propertyName} ({invoice.unitNumber})
                  </p>
                </div>

                {/* Actions: Download Receipt */}
                <div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={handleDownloadReceipt}
                  >
                    Download Receipt
                  </Button>
                </div>
              </div>
            </div>

            {/* Simple Payment Timeline */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
                <Clock className="w-4 h-4 text-[#315A7D]" />
                Payment Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Step 1: Invoice Created */}
                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6] space-y-1.5 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#3F7D58] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-[#243447]">
                      Invoice Created
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6875] pl-8">
                    {invoice.invoiceCreatedDate || '2026-08-15'}
                  </p>
                </div>

                {/* Step 2: Due Date */}
                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6] space-y-1.5 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#315A7D] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-[#243447]">
                      Due Date
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6875] pl-8">
                    {invoice.dueDate}
                  </p>
                </div>

                {/* Step 3: Paid or Overdue */}
                <div
                  className={`p-4 rounded-xl border space-y-1.5 relative ${
                    invoice.status === 'Paid'
                      ? 'bg-[#EDF7EE] border-[#C6DEC8]'
                      : invoice.status === 'Overdue'
                      ? 'bg-[#FDF2F2] border-[#F4B4B4]'
                      : 'bg-[#FEF7EC] border-[#F4E2B6]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 ${
                        invoice.status === 'Paid'
                          ? 'bg-[#3F7D58]'
                          : invoice.status === 'Overdue'
                          ? 'bg-[#B94A48]'
                          : 'bg-[#B7791F]'
                      }`}
                    >
                      {invoice.status === 'Paid' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : invoice.status === 'Overdue' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        invoice.status === 'Paid'
                          ? 'text-[#2A583B]'
                          : invoice.status === 'Overdue'
                          ? 'text-[#8A2E2C]'
                          : 'text-[#8A5B16]'
                      }`}
                    >
                      {invoice.status === 'Paid'
                        ? 'Payment Received'
                        : invoice.status === 'Overdue'
                        ? 'Payment Overdue'
                        : 'Awaiting Payment'}
                    </span>
                  </div>
                  <p
                    className={`text-xs pl-8 ${
                      invoice.status === 'Paid'
                        ? 'text-[#2A583B]'
                        : invoice.status === 'Overdue'
                        ? 'text-[#8A2E2C]'
                        : 'text-[#8A5B16]'
                    }`}
                  >
                    {invoice.status === 'Paid'
                      ? `Paid on ${invoice.paymentDate}`
                      : invoice.status === 'Overdue'
                      ? `Payment is past due since ${invoice.dueDate}`
                      : `Scheduled due on ${invoice.dueDate}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tenant & Property Information */}
              <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
                  <User className="w-4 h-4 text-[#315A7D]" />
                  Tenant & Property Information
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Tenant Name</span>
                    <span className="font-semibold text-[#243447]">
                      {invoice.tenantName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#5B6875]" /> Property
                    </span>
                    <span className="font-medium text-[#243447] text-right">
                      {invoice.propertyName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Unit Number</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                      {invoice.unitNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5B6875]" /> Due Date
                    </span>
                    <span className="font-medium text-[#243447]">
                      {invoice.dueDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Payment Status</span>
                    <StatusBadge status={invoice.status} size="sm" />
                  </div>
                </div>
              </div>

              {/* Financial & Fee Breakdown */}
              <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
                  <DollarSign className="w-4 h-4 text-[#3F7D58]" />
                  Financial Breakdown
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Monthly Rent</span>
                    <span className="font-medium text-[#243447]">
                      ${Number(invoice.monthlyRent || invoice.amount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Late Fee</span>
                    <span
                      className={`font-medium ${
                        Number(invoice.lateFee || 0) > 0
                          ? 'text-[#B94A48] font-semibold'
                          : 'text-[#243447]'
                      }`}
                    >
                      ${Number(invoice.lateFee || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D9E0E6]">
                    <span className="text-xs font-semibold text-[#243447]">
                      Total Amount Due
                    </span>
                    <span className="text-lg font-bold text-[#243447]">
                      ${Number(invoice.amount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6875]">Payment Date</span>
                    <span className="font-medium text-[#243447]">
                      {invoice.paymentDate || 'Pending Settlement'}
                    </span>
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
