import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, Loader, EmptyState } from '../../components/ui'
import {
  Building2,
  CreditCard,
  Wrench,
  CheckCircle2,
  FileText,
  Search,
  RotateCcw,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { resolveTenantRentalContext } from '../../utils/tenantRentalHelper'
import { getMyInvoices } from '../../api/invoiceApi'
import { getMaintenanceRequests } from '../../api/maintenanceApi'
import { formatCurrency } from '../../utils/currency'

export default function TenantDashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [myRental, setMyRental] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [maintenanceRequests, setMaintenanceRequests] = useState([])

  const loadDashboardData = async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      const [rentalRes, invRes, maintRes] = await Promise.allSettled([
        resolveTenantRentalContext(),
        getMyInvoices(),
        getMaintenanceRequests(),
      ])

      if (rentalRes.status === 'fulfilled' && rentalRes.value) {
        setMyRental(rentalRes.value.myRental || null)
      } else {
        setMyRental(null)
      }

      const loadedInvoices =
        invRes.status === 'fulfilled'
          ? Array.isArray(invRes.value?.data)
            ? invRes.value.data
            : Array.isArray(invRes.value)
            ? invRes.value
            : []
          : []

      const loadedMaint =
        maintRes.status === 'fulfilled'
          ? Array.isArray(maintRes.value?.data)
            ? maintRes.value.data
            : Array.isArray(maintRes.value)
            ? maintRes.value
            : []
          : []

      setInvoices(loadedInvoices)
      setMaintenanceRequests(loadedMaint)
    } catch (err) {
      console.error('Failed to load tenant dashboard data:', err)
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load dashboard data. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Derived metrics from real data
  const tenantDisplayName = user?.name || user?.username || 'Tenant'
  const activeProperty = myRental?.property?.name || myRental?.property?.propertyName || null
  const activeUnit = myRental?.leaseSummary?.unitNumber || null
  const leaseStatus = myRental?.leaseSummary?.status || null

  const openMaintenanceCount = maintenanceRequests.filter((m) =>
    ['OPEN', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS'].includes(
      String(m.status || '').toUpperCase()
    )
  ).length

  const pendingInvoices = invoices.filter(
    (inv) => String(inv.status || '').toUpperCase() !== 'PAID'
  )
  const pendingBalance = pendingInvoices.reduce(
    (sum, inv) => sum + (Number(inv.balanceDue ?? inv.amount ?? 0)),
    0
  )

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="dashboard"
      pageTitle="Tenant Dashboard"
    >
      <div className="space-y-6">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 rounded-lg bg-[#FDF2F2] border border-[#F4B4B4] text-[#8A2E2C] text-xs sm:text-sm flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#8A2E2C] shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadDashboardData}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-12 shadow-2xs flex justify-center">
            <Loader text="Loading tenancy dashboard..." size="md" center />
          </div>
        ) : (
          <>
            {/* Tenant Welcome Banner */}
            <div className="rounded-lg bg-[#315A7D] p-6 sm:p-8 text-white border border-[#274B68] shadow-xs">
              <div className="max-w-xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#274B68] text-[#EAF2F7] border border-[#315A7D]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#EAF2F7]" />
                  <span>
                    {activeUnit
                      ? `Active Tenancy • Unit ${activeUnit}`
                      : 'Tenancy Overview'}
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
                  Welcome back, {tenantDisplayName}!
                </h1>
                <p className="text-xs sm:text-sm text-[#EAF2F7]/90">
                  {activeProperty
                    ? `Leasing at ${activeProperty}${
                        pendingBalance > 0
                          ? `. Outstanding balance: ${formatCurrency(pendingBalance)}.`
                          : '. All current invoices are up to date.'
                      }`
                    : 'Browse available listings to apply for your next rental home.'}
                </p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Current Residence"
                value={activeUnit ? `Unit ${activeUnit}` : 'No Lease'}
                subtitle={activeProperty || 'No active rental agreement'}
                change={leaseStatus ? `Status: ${leaseStatus}` : 'Available for leasing'}
                icon={<Building2 className="w-4 h-4 text-[#315A7D]" />}
              />
              <MetricCard
                title="Billing Status"
                value={pendingBalance > 0 ? formatCurrency(pendingBalance) : 'Settled'}
                subtitle={
                  pendingInvoices.length > 0
                    ? `${pendingInvoices.length} unpaid invoice(s)`
                    : 'No outstanding balance'
                }
                change={invoices.length > 0 ? `${invoices.length} total invoice records` : 'No invoices on record'}
                icon={<CreditCard className="w-4 h-4 text-[#3F7D58]" />}
              />
              <MetricCard
                title="Maintenance"
                value={`${openMaintenanceCount} Open`}
                subtitle={
                  openMaintenanceCount > 0
                    ? 'Repair tickets in progress'
                    : 'All service tickets resolved'
                }
                change={`${maintenanceRequests.length} total requests submitted`}
                icon={<Wrench className="w-4 h-4 text-[#5B6875]" />}
              />
            </div>

            {/* Recent Records & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment / Invoice History */}
              <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#243447]">
                      Rent Invoices
                    </h2>
                    <p className="text-xs text-[#5B6875]">Recent statements and payment records</p>
                  </div>
                  <Link to="/tenant/payments">
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Payments
                    </Button>
                  </Link>
                </div>

                {invoices.length === 0 ? (
                  <EmptyState
                    icon={<CreditCard className="w-7 h-7 text-[#5B6875]" />}
                    title="No invoices found"
                    description="You do not have any rent invoices issued to your account."
                  />
                ) : (
                  <div className="space-y-2.5">
                    {invoices.slice(0, 4).map((inv) => {
                      const invId = inv.invoiceId || inv.id
                      const amount = Number(inv.amount || inv.totalAmount || 0)
                      const isPaid = String(inv.status || '').toUpperCase() === 'PAID'

                      return (
                        <div
                          key={invId}
                          className="flex items-center justify-between p-3 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-xs"
                        >
                          <div>
                            <p className="font-semibold text-[#243447]">
                              Invoice #{invId}
                            </p>
                            <p className="text-[#5B6875]">
                              Due: {inv.dueDate || 'Current cycle'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#243447]">
                              {formatCurrency(amount)}
                            </p>
                            <StatusBadge status={inv.status || 'PENDING'} size="xs" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Tenant Actions Panel */}
              <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
                <div className="border-b border-[#D9E0E6] pb-3">
                  <h2 className="text-base font-semibold text-[#243447]">
                    Tenant Actions
                  </h2>
                  <p className="text-xs text-[#5B6875]">Quick access to tenancy services</p>
                </div>
                <div className="space-y-2.5">
                  <Link to="/tenant/maintenance/new" className="block">
                    <Button
                      variant="primary"
                      className="w-full justify-start"
                      leftIcon={<Wrench className="w-4 h-4" />}
                    >
                      Submit Maintenance Request
                    </Button>
                  </Link>
                  <Link to="/tenant/agreement" className="block">
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                      leftIcon={<FileText className="w-4 h-4" />}
                    >
                      View Signed Lease Document
                    </Button>
                  </Link>
                  <Link to="/tenant/properties" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<Search className="w-4 h-4" />}
                    >
                      Explore Available Listings
                    </Button>
                  </Link>
                </div>

                <div className="pt-3 border-t border-[#D9E0E6]">
                  <div className="p-3 rounded-md bg-[#EAF2F7] border border-[#D9E0E6] text-xs">
                    <p className="font-semibold text-[#243447] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#315A7D]" />
                      Maintenance Status
                    </p>
                    <p className="text-[#5B6875] mt-1 leading-relaxed">
                      {openMaintenanceCount > 0
                        ? `You have ${openMaintenanceCount} active service request(s) open.`
                        : 'No pending maintenance issues reported.'}
                    </p>
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

function MetricCard({ title, value, subtitle, change, icon }) {
  return (
    <div className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
          {title}
        </span>
        <div className="w-8 h-8 rounded-md bg-[#EAF2F7] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-[#243447]">{value}</p>
        <p className="text-xs text-[#5B6875] mt-0.5">{subtitle}</p>
      </div>
      <div className="pt-2 border-t border-[#D9E0E6]">
        <span className="text-[11px] font-medium text-[#315A7D]">{change}</span>
      </div>
    </div>
  )
}
