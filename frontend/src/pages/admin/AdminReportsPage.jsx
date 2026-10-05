import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import AdminApiUnavailableCard from '../../components/common/AdminApiUnavailableCard'
import { getInvoices } from '../../api/invoiceApi'
import { Button, EmptyState, Loader } from '../../components/ui'
import { AlertCircle, FileBarChart, RefreshCw, TrendingUp } from 'lucide-react'

const unwrapList = (response) => {
  const value = response?.data ?? response
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.content)) return value.content
  if (Array.isArray(value?.invoices)) return value.invoices
  return []
}

const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const REPORT_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/reports/summary',
    auth: 'ROLE_SUPER_ADMIN, ROLE_PROPERTY_OWNER',
    description:
      'Retrieve high-level financial aggregate KPIs (total invoiced, total collections, outstanding rent, maintenance expenses, and platform profit).',
  },
  {
    method: 'GET',
    path: '/api/reports/income-trend',
    auth: 'ROLE_SUPER_ADMIN, ROLE_PROPERTY_OWNER',
    description:
      'Fetch monthly income and collection trends over a designated period.',
    params: ['months (e.g. 6 or 12)'],
  },
  {
    method: 'GET',
    path: '/api/reports/occupancy-trend',
    auth: 'ROLE_SUPER_ADMIN, ROLE_PROPERTY_OWNER',
    description:
      'Retrieve monthly platform occupancy rate, vacant unit count, and average lease turnaround time.',
    params: ['months (e.g. 6 or 12)'],
  },
  {
    method: 'GET',
    path: '/api/reports/property-performance',
    auth: 'ROLE_SUPER_ADMIN, ROLE_PROPERTY_OWNER',
    description:
      'Breakdown of individual property revenue, vacancy cost, maintenance spend, and net yield.',
  },
  {
    method: 'POST',
    path: '/api/reports/export',
    auth: 'ROLE_SUPER_ADMIN',
    description:
      'Asynchronously stream or trigger generation of comprehensive audit reports in PDF or CSV format.',
    body: '{\n  "reportType": "FINANCIAL_SUMMARY",\n  "format": "PDF",\n  "startDate": "2026-01-01",\n  "endDate": "2026-10-01"\n}',
  },
]

const REPORT_REQUIREMENTS = [
  'Raw invoice records are currently retrieved from RentInvoiceController (GET /api/rent-invoices) as shown below.',
  'To support enterprise executive dashboards, create ReportController and ReportService in Spring Boot.',
  'Implement SQL aggregation queries joining rent_invoices, payments, expenses, and units to calculate historical occupancy and yield.',
]

export default function AdminReportsPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getInvoices()
      setInvoices(unwrapList(res))
    } catch (err) {
      setInvoices([])
      setError(err?.message || 'Could not load invoice records from backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const summary = useMemo(
    () =>
      invoices.reduce(
        (result, invoice) => {
          result.totalInvoiced += Number(
            invoice.totalAmount ?? invoice.rentAmount ?? 0
          )
          result.totalPaid += Number(invoice.totalPaid ?? 0)
          result.outstanding += Number(invoice.remainingAmount ?? 0)
          return result
        },
        { totalInvoiced: 0, totalPaid: 0, outstanding: 0 }
      ),
    [invoices]
  )

  return (
    <DashboardLayout
      defaultRole="admin"
      activeItem="reports"
      pageTitle="Platform Reports"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#243447]">
              Platform Billing & Financial Reports
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#5B6875]">
              Real transaction totals calculated directly from live backend rent-invoices, and specifications for platform analytics endpoints.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadReports}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh Data
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-md border border-[#F4B4B4] bg-[#FDF2F2] p-3 text-xs sm:text-sm text-[#8A2E2C]"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </span>
            <Button size="sm" variant="outline" onClick={loadReports}>
              Retry
            </Button>
          </div>
        )}

        {/* Section 1: Live Billing & Invoices Report */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#243447]">
                Live Platform Invoicing & Collections
              </h2>
              <p className="text-xs text-[#5B6875]">
                Aggregated from live backend endpoint <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D9E0E6]">GET /api/rent-invoices</code>
              </p>
            </div>
            {!loading && invoices.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                {invoices.length} Invoices Recorded
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center rounded-lg border border-[#D9E0E6] bg-white p-12 shadow-2xs">
              <Loader text="Loading live invoice reports from backend..." size="md" center />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-[#D9E0E6] bg-white p-8 shadow-2xs">
              <EmptyState
                icon={<FileBarChart className="h-8 w-8 text-[#8A2E2C]" />}
                title="Report data unavailable"
                message="The live invoice report could not be loaded from the backend."
              />
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-lg border border-[#D9E0E6] bg-white p-8 shadow-2xs">
              <EmptyState
                icon={<FileBarChart className="h-8 w-8 text-[#5B6875]" />}
                title="No invoice records found"
                message="The backend returned zero rent invoices, so no billing totals can be calculated at this time."
              />
            </div>
          ) : (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['Total Invoices', invoices.length.toLocaleString('en-IN')],
                  ['Total Invoiced', money(summary.totalInvoiced)],
                  ['Total Collections', money(summary.totalPaid)],
                  ['Outstanding Balance', money(summary.outstanding)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6875]">
                      {label}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-[#243447]">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Invoices Table */}
              <div className="overflow-hidden rounded-lg border border-[#D9E0E6] bg-white shadow-2xs">
                <div className="border-b border-[#D9E0E6] p-4 bg-[#F7F8FA] flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#243447]">
                    Recent Rent Invoice Records
                  </h3>
                  <span className="text-xs text-[#5B6875]">
                    Showing up to 50 latest records
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F7F8FA] text-[11px] uppercase tracking-wider text-[#5B6875] border-b border-[#D9E0E6]">
                      <tr>
                        <th className="p-3">Invoice #</th>
                        <th className="p-3">Tenant ID</th>
                        <th className="p-3">Billing Period / Due</th>
                        <th className="p-3">Invoiced</th>
                        <th className="p-3">Paid</th>
                        <th className="p-3">Remaining</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E0E6]">
                      {invoices.slice(0, 50).map((invoice, index) => (
                        <tr
                          key={invoice.invoiceId ?? invoice.id ?? index}
                          className="hover:bg-[#F7F8FA]/60 transition-colors"
                        >
                          <td className="p-3 font-mono font-medium text-[#243447]">
                            {invoice.invoiceNumber ||
                              `#${invoice.invoiceId ?? invoice.id ?? '—'}`}
                          </td>
                          <td className="p-3 text-[#5B6875]">
                            {invoice.tenantId ? `Tenant #${invoice.tenantId}` : '—'}
                          </td>
                          <td className="p-3 text-[#5B6875]">
                            {invoice.billingMonth && invoice.billingYear
                              ? `${invoice.billingMonth}/${invoice.billingYear}`
                              : invoice.dueDate || '—'}
                          </td>
                          <td className="p-3 font-medium text-[#243447]">
                            {money(invoice.totalAmount ?? invoice.rentAmount)}
                          </td>
                          <td className="p-3 text-[#2A583B]">
                            {money(invoice.totalPaid)}
                          </td>
                          <td className="p-3 text-[#8A5B16]">
                            {money(invoice.remainingAmount)}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                invoice.status === 'PAID'
                                  ? 'bg-[#EDF7EE] text-[#2A583B] border-[#C6DEC8]'
                                  : invoice.status === 'PARTIALLY_PAID'
                                  ? 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]'
                                  : 'bg-[#FDF2F2] text-[#8A2E2C] border-[#F4B4B4]'
                              }`}
                            >
                              {invoice.status || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Section 2: Advanced Analytics & Exports (Unavailable State) */}
        <div className="space-y-4 pt-4 border-t border-[#D9E0E6]">
          <div>
            <h2 className="text-base font-bold text-[#243447]">
              Aggregated Analytics & Export Engine
            </h2>
            <p className="text-xs text-[#5B6875]">
              System-wide financial trends, occupancy projections, and regulatory PDF/CSV export jobs.
            </p>
          </div>

          <AdminApiUnavailableCard
            title="Aggregated Reporting & Export API Unavailable"
            subtitle="Dedicated Analytics Controller Not Implemented in Backend"
            icon={<TrendingUp className="h-5 w-5 text-[#8A5B16]" />}
            description="While raw transaction records are queried directly from the invoices controller above, high-level reporting endpoints (/api/reports/*) for aggregated trend analytics, portfolio occupancy curves, and server-side PDF exports have not yet been implemented in Spring Boot. In adherence to zero-mock standards, no fake charts or synthetic projections are generated."
            endpoints={REPORT_ENDPOINTS}
            backendRequirements={REPORT_REQUIREMENTS}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
