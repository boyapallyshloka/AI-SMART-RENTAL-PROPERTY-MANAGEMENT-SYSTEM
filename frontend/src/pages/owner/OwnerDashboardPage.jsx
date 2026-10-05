import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, Loader, EmptyState } from '../../components/ui'
import {
  Building2,
  Users,
  IndianRupee,
  Wrench,
  Plus,
  ArrowRight,
  CreditCard,
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
  RotateCcw,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import { getMyProperties } from '../../api/propertyApi'
import { getMaintenanceRequests } from '../../api/maintenanceApi'
import { getInvoices } from '../../api/invoiceApi'
import { formatCurrency } from '../../utils/currency'

export default function OwnerDashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [properties, setProperties] = useState([])
  const [maintenanceRequests, setMaintenanceRequests] = useState([])
  const [invoices, setInvoices] = useState([])

  const loadDashboardData = async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      const [propsRes, maintRes, invRes] = await Promise.allSettled([
        getMyProperties(),
        getMaintenanceRequests(),
        getInvoices(),
      ])

      const loadedProps =
        propsRes.status === 'fulfilled'
          ? Array.isArray(propsRes.value?.data)
            ? propsRes.value.data
            : Array.isArray(propsRes.value)
            ? propsRes.value
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

      const loadedInvoices =
        invRes.status === 'fulfilled'
          ? Array.isArray(invRes.value?.data)
            ? invRes.value.data
            : Array.isArray(invRes.value)
            ? invRes.value
            : []
          : []

      setProperties(loadedProps)
      setMaintenanceRequests(loadedMaint)
      setInvoices(loadedInvoices)
    } catch (err) {
      console.error('Failed to load owner dashboard data:', err)
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

  // Derived metrics from real backend data
  const totalProperties = properties.length
  const totalUnits = properties.reduce(
    (sum, p) => sum + (Number(p.totalUnits) || 0),
    0
  )
  const openMaintenance = maintenanceRequests.filter((m) =>
    ['OPEN', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS'].includes(
      String(m.status || '').toUpperCase()
    )
  ).length

  const paidInvoices = invoices.filter(
    (inv) => String(inv.status || '').toUpperCase() === 'PAID'
  )
  const totalRevenue = paidInvoices.reduce(
    (sum, inv) => sum + (Number(inv.amount || inv.totalAmount) || 0),
    0
  )

  const ownerDisplayName = user?.name || user?.username || 'Owner'

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="dashboard"
      pageTitle="Owner Dashboard"
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
            <Loader text="Loading property portfolio..." size="md" center />
          </div>
        ) : (
          <>
            {/* Welcome Banner */}
            <div className="rounded-lg bg-[#315A7D] p-6 sm:p-7 text-white border border-[#274B68] shadow-xs">
              <div className="max-w-2xl space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#274B68] text-[#EAF2F7] border border-[#315A7D]">
                  <Building2 className="w-3.5 h-3.5 text-[#EAF2F7]" />
                  <span>Portfolio Overview</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
                  Welcome back, {ownerDisplayName}!
                </h1>
                <p className="text-xs sm:text-sm text-[#EAF2F7]/90">
                  {totalProperties > 0
                    ? `You are managing ${totalProperties} ${
                        totalProperties === 1 ? 'property' : 'properties'
                      } with ${totalUnits} units configured in your portfolio.`
                    : 'Get started by creating your first property listing.'}
                </p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Properties"
                value={`${totalProperties} ${totalProperties === 1 ? 'Property' : 'Properties'}`}
                subtitle={`${totalUnits} units configured`}
                icon={<Building2 className="w-4 h-4 text-[#315A7D]" />}
              />
              <MetricCard
                title="Revenue Collected"
                value={formatCurrency(totalRevenue)}
                subtitle={`${paidInvoices.length} settled invoices`}
                icon={<IndianRupee className="w-4 h-4 text-[#3F7D58]" />}
              />
              <MetricCard
                title="Invoices Issued"
                value={`${invoices.length} Total`}
                subtitle={`${invoices.length - paidInvoices.length} pending settlement`}
                icon={<CreditCard className="w-4 h-4 text-[#315A7D]" />}
              />
              <MetricCard
                title="Open Maintenance"
                value={`${openMaintenance} Tickets`}
                subtitle="Requires service action"
                icon={<Wrench className="w-4 h-4 text-[#B7791F]" />}
              />
            </div>

            {/* Main Grid: Property Status & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Property Status Table Preview */}
              <div className="lg:col-span-2 rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#243447]">
                      My Properties
                    </h2>
                    <p className="text-xs text-[#5B6875]">Current real estate assets</p>
                  </div>
                  <Link to="/owner/properties">
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View All Properties
                    </Button>
                  </Link>
                </div>

                {properties.length === 0 ? (
                  <EmptyState
                    icon={<Building2 className="w-8 h-8 text-[#5B6875]" />}
                    title="No properties registered yet"
                    description="Add your first property to configure buildings, floors, and rental units."
                    action={
                      <Link to="/owner/properties/new">
                        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                          Add Property
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="divide-y divide-[#D9E0E6]">
                    {properties.slice(0, 5).map((prop) => {
                      const propId = prop.propertyId || prop.id
                      const propName = prop.propertyName || prop.name || 'Untitled Property'
                      const addressStr = prop.city
                        ? `${prop.city}${prop.state ? `, ${prop.state}` : ''}`
                        : prop.address || 'Location registered'

                      return (
                        <div key={propId} className="py-3 flex items-center justify-between text-sm">
                          <div>
                            <Link
                              to={`/owner/properties/${propId}`}
                              className="font-semibold text-[#243447] hover:text-[#315A7D] transition-colors"
                            >
                              {propName}
                            </Link>
                            <p className="text-xs text-[#5B6875] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#5B6875]" />
                              <span>{addressStr}</span>
                              {prop.totalUnits != null && (
                                <span>&bull; {prop.totalUnits} units</span>
                              )}
                            </p>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                            {prop.propertyType || prop.type || 'RESIDENTIAL'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Quick Actions Panel */}
              <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#243447]">
                    Quick Actions
                  </h2>
                  <p className="text-xs text-[#5B6875] mt-0.5">Common property tasks</p>
                  <div className="space-y-2.5 mt-3">
                    <Link to="/owner/properties/new" className="block">
                      <Button variant="primary" className="w-full justify-start" leftIcon={<Plus className="w-4 h-4" />}>
                        Add New Property
                      </Button>
                    </Link>
                    <Link to="/owner/agreements/new" className="block">
                      <Button variant="secondary" className="w-full justify-start" leftIcon={<FileText className="w-4 h-4" />}>
                        Create Lease Agreement
                      </Button>
                    </Link>
                    <Link to="/owner/maintenance" className="block">
                      <Button variant="secondary" className="w-full justify-start" leftIcon={<Wrench className="w-4 h-4" />}>
                        View Maintenance Tickets
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D9E0E6]">
                  <div className="p-3 rounded-md bg-[#EAF2F7] border border-[#D9E0E6] text-xs">
                    <p className="font-semibold text-[#243447] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#315A7D]" />
                      Portfolio Status
                    </p>
                    <p className="text-[#5B6875] mt-1 leading-relaxed">
                      {openMaintenance > 0
                        ? `${openMaintenance} maintenance ticket(s) currently open across your properties.`
                        : 'All maintenance requests are resolved or in progress.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Grid: Recent Maintenance & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Maintenance Requests */}
              <div className="lg:col-span-2 rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#243447]">
                      Recent Maintenance Requests
                    </h2>
                    <p className="text-xs text-[#5B6875]">Latest repair tickets from tenants</p>
                  </div>
                  <Link to="/owner/maintenance">
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View All Tickets
                    </Button>
                  </Link>
                </div>

                {maintenanceRequests.length === 0 ? (
                  <EmptyState
                    icon={<Wrench className="w-7 h-7 text-[#5B6875]" />}
                    title="No maintenance requests"
                    description="No tickets have been submitted by tenants yet."
                  />
                ) : (
                  <div className="divide-y divide-[#D9E0E6]">
                    {maintenanceRequests.slice(0, 4).map((ticket) => {
                      const tId = ticket.requestId || ticket.id
                      const dateStr = ticket.requestedDate
                        ? new Date(ticket.requestedDate).toLocaleDateString()
                        : ticket.submittedDate || 'Recent'

                      return (
                        <div key={tId} className="py-3 flex items-start justify-between gap-3 text-sm">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] flex items-center justify-center shrink-0 mt-0.5">
                              <Wrench className="w-3.5 h-3.5 text-[#315A7D]" />
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/owner/maintenance/${tId}`}
                                className="font-medium text-[#243447] text-xs sm:text-sm hover:text-[#315A7D] truncate block"
                              >
                                #{tId} &bull; {ticket.category || 'Maintenance'}: {ticket.description || 'Request details'}
                              </Link>
                              <p className="text-xs text-[#5B6875] mt-0.5">
                                Submitted {dateStr}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={ticket.status || 'OPEN'} size="sm" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Invoices Summary Section */}
              <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#243447]">
                      Rent Invoices
                    </h2>
                    <p className="text-xs text-[#5B6875]">Recent billing records</p>
                  </div>
                  <Link to="/owner/payments">
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Invoices
                    </Button>
                  </Link>
                </div>

                {invoices.length === 0 ? (
                  <EmptyState
                    icon={<FileText className="w-7 h-7 text-[#5B6875]" />}
                    title="No invoices generated"
                    description="Invoices will appear once created for active leases."
                  />
                ) : (
                  <div className="divide-y divide-[#D9E0E6]">
                    {invoices.slice(0, 4).map((inv) => {
                      const invId = inv.invoiceId || inv.id
                      const amount = Number(inv.amount || inv.totalAmount || 0)

                      return (
                        <div key={invId} className="py-3 flex items-start justify-between gap-3 text-sm">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] flex items-center justify-center shrink-0 mt-0.5">
                              <CreditCard className="w-3.5 h-3.5 text-[#3F7D58]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#243447] text-xs">
                                Invoice #{invId}
                              </p>
                              <p className="text-[11px] text-[#5B6875]">
                                Due {inv.dueDate || 'Current cycle'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-xs text-[#243447] block">
                              {formatCurrency(amount)}
                            </span>
                            <StatusBadge status={inv.status || 'PENDING'} size="xs" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function MetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">{title}</span>
        <div className="w-8 h-8 rounded-md bg-[#EAF2F7] flex items-center justify-center shrink-0">{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-[#243447]">{value}</p>
        <p className="text-xs text-[#5B6875] mt-1">{subtitle}</p>
      </div>
    </div>
  )
}
