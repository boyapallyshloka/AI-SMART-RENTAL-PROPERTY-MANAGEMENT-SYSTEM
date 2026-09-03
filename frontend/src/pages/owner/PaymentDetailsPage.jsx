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
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{noticeMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNoticeMessage('')}
                  className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200 font-bold px-1"
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
                      {invoice.invoiceNumber}
                    </h1>
                    <StatusBadge status={invoice.status} size="md" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Issued to <strong className="text-slate-700 dark:text-slate-300">{invoice.tenantName}</strong> &bull; {invoice.propertyName} ({invoice.unitNumber})
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Payment Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Step 1: Invoice Created */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Invoice Created
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                    {invoice.invoiceCreatedDate || '2026-08-15'}
                  </p>
                </div>

                {/* Step 2: Due Date */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Due Date
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                    {invoice.dueDate}
                  </p>
                </div>

                {/* Step 3: Paid or Overdue */}
                <div
                  className={`p-4 rounded-xl border space-y-1.5 relative ${
                    invoice.status === 'Paid'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
                      : invoice.status === 'Overdue'
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80'
                      : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 ${
                        invoice.status === 'Paid'
                          ? 'bg-emerald-600'
                          : invoice.status === 'Overdue'
                          ? 'bg-rose-600'
                          : 'bg-amber-500'
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
                          ? 'text-emerald-900 dark:text-emerald-100'
                          : invoice.status === 'Overdue'
                          ? 'text-rose-900 dark:text-rose-100'
                          : 'text-amber-900 dark:text-amber-100'
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
                        ? 'text-emerald-700/80 dark:text-emerald-300/80'
                        : invoice.status === 'Overdue'
                        ? 'text-rose-700/80 dark:text-rose-300/80'
                        : 'text-amber-700/80 dark:text-amber-300/80'
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Tenant & Property Information
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Tenant Name</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {invoice.tenantName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> Property
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white text-right">
                      {invoice.propertyName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Unit Number</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {invoice.unitNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due Date
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {invoice.dueDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Payment Status</span>
                    <StatusBadge status={invoice.status} size="sm" />
                  </div>
                </div>
              </div>

              {/* Financial & Fee Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Financial Breakdown
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Monthly Rent</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${Number(invoice.monthlyRent || invoice.amount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Late Fee</span>
                    <span
                      className={`font-medium ${
                        Number(invoice.lateFee || 0) > 0
                          ? 'text-rose-600 dark:text-rose-400 font-semibold'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      ${Number(invoice.lateFee || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Total Amount Due
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      ${Number(invoice.amount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Payment Date</span>
                    <span className="font-medium text-slate-900 dark:text-white">
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
