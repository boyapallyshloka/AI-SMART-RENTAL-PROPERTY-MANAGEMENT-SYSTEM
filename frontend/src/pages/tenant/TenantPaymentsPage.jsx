import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getStoredInvoices } from '../../utils/paymentMockData'
import {
  Button,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Building2,
  Calendar,
  Info,
} from 'lucide-react'

export default function TenantPaymentsPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [bannerNotice, setBannerNotice] = useState('')

  const tenantEmail = (user?.email || 'tenant@homesphere.com').toLowerCase().trim()
  const tenantName = (user?.name || 'Elena Rostova').toLowerCase().trim()

  useEffect(() => {
    // Read from shared invoices storage
    const timer = setTimeout(() => {
      const allInvoices = getStoredInvoices()
      const tenantInvoices = allInvoices.filter((inv) => {
        const emailMatch = (inv.tenantEmail || '').toLowerCase().trim() === tenantEmail
        const nameMatch = (inv.tenantName || '').toLowerCase().trim() === tenantName
        return emailMatch || nameMatch
      })
      setInvoices(tenantInvoices)
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [tenantEmail, tenantName])

  const handlePayNow = () => {
    setBannerNotice('Payment gateway coming soon.')
    setTimeout(() => {
      setBannerNotice('')
    }, 3500)
  }

  const handleViewReceipt = () => {
    setBannerNotice('Receipt coming soon.')
    setTimeout(() => {
      setBannerNotice('')
    }, 3500)
  }

  // Summary Card calculations
  const pendingInvoices = invoices.filter(
    (inv) => inv.status === 'Pending' || inv.status === 'Overdue'
  )
  const paidInvoices = invoices.filter((inv) => inv.status === 'Paid')

  const totalPendingAmount = pendingInvoices.reduce(
    (sum, inv) => sum + (Number(inv.amount) || 0),
    0
  )

  const totalPaidAmount = paidInvoices.reduce(
    (sum, inv) => sum + (Number(inv.amount) || 0),
    0
  )

  // Upcoming due: earliest pending/overdue due date or pending amount
  const upcomingInvoice = [...pendingInvoices].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  )[0]

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="payments"
      pageTitle="Payments"
    >
      <div className="space-y-6">
        {/* Banner Notice for Pay Now / View Receipt */}
        {bannerNotice && (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{bannerNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerNotice('')}
              className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-100 font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Rent Payments & Invoices
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review your monthly rent billing, payment history, and pending dues
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Loading your payments and billing invoices..." size="md" center />
          </div>
        ) : invoices.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<CreditCard className="w-8 h-8" />}
              title="No Payment Invoices Found"
              message="You do not currently have any active or past rent invoices associated with your account."
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 3 Summary Cards: Upcoming Due, Pending Amount, Total Paid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Upcoming Due */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Upcoming Due
                  </span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {upcomingInvoice
                      ? `$${Number(upcomingInvoice.amount).toLocaleString()}`
                      : '$0'}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    {upcomingInvoice
                      ? `Due: ${upcomingInvoice.dueDate}`
                      : 'No upcoming dues'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              {/* Pending Amount */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Pending Amount
                  </span>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                    ${totalPendingAmount.toLocaleString()}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    {pendingInvoices.length} outstanding {pendingInvoices.length === 1 ? 'bill' : 'bills'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              {/* Total Paid */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Total Paid
                  </span>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ${totalPaidAmount.toLocaleString()}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    {paidInvoices.length} settled {paidInvoices.length === 1 ? 'invoice' : 'invoices'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Displaying{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {invoices.length}
                  </strong>{' '}
                  billing records for {user?.name || 'Elena Rostova'}
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {tenantEmail}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 pl-6 pr-4">Invoice #</th>
                      <th className="py-3.5 px-4">Property & Unit</th>
                      <th className="py-3.5 px-4">Due Date</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 pl-4 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Invoice Number */}
                        <td className="py-4 pl-6 pr-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400 text-xs whitespace-nowrap">
                          {inv.invoiceNumber}
                        </td>

                        {/* Property & Unit */}
                        <td className="py-4 px-4 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                {inv.propertyName}
                              </p>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {inv.unitNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{inv.dueDate}</span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          ${Number(inv.amount || 0).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={inv.status} size="sm" />
                        </td>

                        {/* Action Buttons: Pay Now (Pending/Overdue) or View Receipt (Paid) */}
                        <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                          {inv.status === 'Paid' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleViewReceipt}
                              leftIcon={<Receipt className="w-3.5 h-3.5" />}
                            >
                              View Receipt
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={handlePayNow}
                              leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                            >
                              Pay Now
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
