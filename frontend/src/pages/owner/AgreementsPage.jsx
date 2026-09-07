import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getStoredAgreements,
  AGREEMENT_STATUSES,
} from '../../utils/agreementMockData'
import {
  Button,
  Input,
  Select,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  FileText,
  Plus,
  Search,
  RotateCcw,
  Building2,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
} from 'lucide-react'

export default function AgreementsPage() {
  const location = useLocation()
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ''
  )

  useEffect(() => {
    // Read from localStorage data source
    const timer = setTimeout(() => {
      const list = getStoredAgreements()
      setAgreements(list)
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...AGREEMENT_STATUSES.map((st) => ({ value: st, label: st })),
  ]

  const filteredAgreements = agreements.filter((agr) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      agr.agreementNumber.toLowerCase().includes(query) ||
      agr.tenantName.toLowerCase().includes(query) ||
      agr.propertyName.toLowerCase().includes(query) ||
      agr.unit.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'all' ||
      agr.status.toLowerCase() === statusFilter.toLowerCase()

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
      activeItem="agreements"
      pageTitle="Agreements"
    >
      <div className="space-y-6">
        {/* Success Banner (e.g. from CreateAgreementPage redirect) */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#3F7D58] shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="text-[#2A583B] hover:text-[#1d3d29] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
              Lease Agreements
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Manage residential contracts, lease terms, rent schedules, and tenant signatures
            </p>
          </div>

          <Link to="/owner/agreements/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create Agreement
            </Button>
          </Link>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#D9E0E6] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by agreement #, tenant, property, or unit..."
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
                {filteredAgreements.length}
              </strong>{' '}
              of {agreements.length} lease agreements
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
            <Loader text="Loading lease agreements..." size="md" center />
          </div>
        ) : filteredAgreements.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-8 shadow-xs">
            <EmptyState
              icon={<FileText className="w-8 h-8 text-[#315A7D]" />}
              title="No lease agreements found"
              message="No agreements match your search or filter criteria. Create a new lease agreement to get started."
              action={
                <Link to="/owner/agreements/new">
                  <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                    Create Agreement
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          /* Table */
          <div className="bg-white rounded-2xl border border-[#D9E0E6] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3.5 pl-6 pr-4">Agreement #</th>
                    <th className="py-3.5 px-4">Tenant</th>
                    <th className="py-3.5 px-4">Property & Unit</th>
                    <th className="py-3.5 px-4">Term Dates</th>
                    <th className="py-3.5 px-4">Monthly Rent</th>
                    <th className="py-3.5 px-4">Deposit</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm">
                  {filteredAgreements.map((agr) => (
                    <tr
                      key={agr.id}
                      className="hover:bg-[#F7F8FA] transition-colors"
                    >
                      {/* Agreement Number */}
                      <td className="py-4 pl-6 pr-4 font-mono font-semibold text-[#315A7D] text-xs whitespace-nowrap">
                        {agr.agreementNumber}
                      </td>

                      {/* Tenant */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-[#243447]">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span>{agr.tenantName}</span>
                        </div>
                      </td>

                      {/* Property & Unit */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <p className="font-semibold text-[#243447] text-xs truncate">
                          {agr.propertyName}
                        </p>
                        <span className="text-xs text-[#5B6875]">
                          {agr.unit}
                        </span>
                      </td>

                      {/* Term Dates */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#5B6875]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span>
                            {agr.startDate} &rarr; {agr.endDate}
                          </span>
                        </div>
                      </td>

                      {/* Monthly Rent */}
                      <td className="py-4 px-4 whitespace-nowrap font-bold text-[#243447]">
                        ${Number(agr.monthlyRent || 0).toLocaleString()}/mo
                      </td>

                      {/* Security Deposit */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#5B6875]">
                        ${Number(agr.securityDeposit || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <StatusBadge status={agr.status} size="sm" />
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
