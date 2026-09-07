import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  MOCK_INVOICES,
  PAYMENT_STATUSES,
} from '../../utils/paymentMockData'
import {
  Button,
  Input,
  Select,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  Search,
  RotateCcw,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Building2,
  Calendar,
  Info,
} from 'lucide-react'

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [noticeMessage, setNoticeMessage] = useState('')

  useEffect(() => {
    // Brief simulated loading to demonstrate Loader component
    const timer = setTimeout(() => {
      setInvoices(MOCK_INVOICES)
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [])

  const handleViewReceipt = (invoiceNumber) => {
    setNoticeMessage(`Receipt for ${invoiceNumber} - Coming soon!`)
    setTimeout(() => setNoticeMessage(''), 3500)
  }

  // Calculate summary metrics
  const totalCollected = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)

  const pendingRent = invoices
    .filter((inv) => inv.status === 'Pending')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)

  const overdueRent = invoices
    .filter((inv) => inv.status === 'Overdue')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...PAYMENT_STATUSES.map((st) => ({ value: st, label: st })),
  ]

  // Filter invoices by search and status
  const filteredInvoices = invoices.filter((inv) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      inv.tenantName.toLowerCase().includes(query) ||
      inv.propertyName.toLowerCase().includes(query) ||
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.unitNumber.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'all' ||
      inv.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="payments"
      pageTitle="Payments"
    >
      <div className="space-y-6">
        {/* Notice Banner */}
        {noticeMessage && (
          <div className="p-3.5 rounded-xl bg-[#EAF2F7] border border-[#D9E0E6] text-[#315A7D] text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
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

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
              Rent Payments & Invoices
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Track collected rent, pending dues, and overdue tenant balances
            </p>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Collected Rent */}
          <div className="rounded-2xl border border-[#D9E0E6] bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                Total Collected Rent
              </span>
              <div className="p-2.5 rounded-xl bg-[#EDF7EE] text-[#3F7D58]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#243447] tracking-tight">
                ${totalCollected.toLocaleString()}
              </p>
              <p className="text-xs text-[#5B6875] mt-0.5">
                Paid invoices this period
              </p>
            </div>
          </div>

          {/* Pending Rent */}
          <div className="rounded-2xl border border-[#D9E0E6] bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                Pending Rent
              </span>
              <div className="p-2.5 rounded-xl bg-[#FEF7EC] text-[#B7791F]">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#B7791F] tracking-tight">
                ${pendingRent.toLocaleString()}
              </p>
              <p className="text-xs text-[#5B6875] mt-0.5">
                Awaiting tenant settlement
              </p>
            </div>
          </div>

          {/* Overdue Rent */}
          <div className="rounded-2xl border border-[#D9E0E6] bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                Overdue Rent
              </span>
              <div className="p-2.5 rounded-xl bg-[#FDF2F2] text-[#B94A48]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#B94A48] tracking-tight">
                ${overdueRent.toLocaleString()}
              </p>
              <p className="text-xs text-[#5B6875] mt-0.5">
                Requires payment follow-up
              </p>
            </div>
          </div>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#D9E0E6] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by tenant name, property, or invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[#5B6875]" />}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  title="Reset filters"
                  aria-label="Reset filters"
                  className="p-2.5 rounded-lg border border-[#D9E0E6] text-[#5B6875] hover:text-[#243447] hover:bg-[#F7F8FA] transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B6875] pt-1 border-t border-[#D9E0E6]">
            <span>
              Showing{' '}
              <strong className="text-[#243447]">
                {filteredInvoices.length}
              </strong>{' '}
              of {invoices.length} invoices
            </span>
            {hasActiveFilters && (
              <span className="text-[#315A7D] font-medium">
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-12 shadow-xs flex justify-center">
            <Loader text="Loading payment invoices..." size="md" center />
          </div>
        ) : filteredInvoices.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-8 shadow-xs">
            <EmptyState
              icon={<Receipt className="w-8 h-8 text-[#315A7D]" />}
              title="No invoices found"
              message="No rent invoice records match your current search query or status filter."
              action={{
                label: 'Reset Filters',
                onClick: resetFilters,
                variant: 'outline',
              }}
            />
          </div>
        ) : (
          /* Invoices Table */
          <div className="bg-white rounded-2xl border border-[#D9E0E6] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3.5 pl-6 pr-4">Invoice #</th>
                    <th className="py-3.5 px-4">Tenant</th>
                    <th className="py-3.5 px-4">Property</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#F7F8FA] transition-colors"
                    >
                      {/* Invoice Number */}
                      <td className="py-4 pl-6 pr-4 font-mono font-semibold text-[#315A7D] text-xs whitespace-nowrap">
                        <Link
                          to={`/owner/payments/${inv.id}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </td>

                      {/* Tenant Name */}
                      <td className="py-4 px-4 font-semibold text-[#243447] whitespace-nowrap">
                        {inv.tenantName}
                      </td>

                      {/* Property Name */}
                      <td className="py-4 px-4 text-[#243447] min-w-[180px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span className="truncate">{inv.propertyName}</span>
                        </div>
                      </td>

                      {/* Unit Number */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                          {inv.unitNumber}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#5B6875]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span>{inv.dueDate}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 whitespace-nowrap font-bold text-[#243447]">
                        ${Number(inv.amount || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>

                      {/* Actions: View Receipt (Coming Soon) */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Receipt className="w-3.5 h-3.5" />}
                          onClick={() => handleViewReceipt(inv.invoiceNumber)}
                        >
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
