import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import {
  getAgreements,
  getAgreementDocument,
  updateAgreementStatus,
  AGREEMENT_STATUSES,
} from '../../api/agreementApi'
import { getOwnerApplications, getAllApplications } from '../../api/applicationApi'
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
  IndianRupee,
  User,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  RefreshCw,
  Clock,
  Shield,
  FileCheck,
} from 'lucide-react'

// Date formatter
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return String(dateStr)
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return String(dateStr)
  }
}

export default function AgreementsPage() {
  const location = useLocation()
  const { user } = useAuth()

  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ''
  )
  const [errorMessage, setErrorMessage] = useState(
    location.state?.errorMessage || ''
  )
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Load real agreements and enrich with application metadata
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // 1. Fetch real agreements and applications concurrently
      const [agreementsRes, appsRes] = await Promise.allSettled([
        getAgreements(),
        user?.role === 'SUPER_ADMIN'
          ? getAllApplications()
          : getOwnerApplications(),
      ])

      if (agreementsRes.status === 'rejected') {
        throw agreementsRes.reason
      }

      const rawAgreements = Array.isArray(agreementsRes.value)
        ? agreementsRes.value
        : agreementsRes.value?.data || []

      const rawApps =
        appsRes.status === 'fulfilled'
          ? Array.isArray(appsRes.value)
            ? appsRes.value
            : appsRes.value?.data || []
          : []

      // 2. Build lookup map for application details (tenant name, property, unit)
      const appMap = new Map()
      rawApps.forEach((a) => {
        if (a && a.applicationId) {
          appMap.set(Number(a.applicationId), a)
        }
      })

      // 3. Enrich agreements with real display data
      const enriched = rawAgreements.map((agr) => {
        const app = agr.applicationId ? appMap.get(Number(agr.applicationId)) : null
        return {
          ...agr,
          id: agr.agreementId,
          agreementNumber: `AGR-${String(agr.agreementId).padStart(4, '0')}`,
          tenantName:
            app?.tenantName ||
            (agr.tenantId ? `Tenant #${agr.tenantId}` : 'Tenant'),
          tenantEmail: app?.tenantEmail || '',
          propertyName: app?.propertyName || 'Property',
          unit: app?.unitNumber
            ? `Unit #${app.unitNumber}`
            : agr.unitId
            ? `Unit #${agr.unitId}`
            : '—',
          status: agr.status || 'DRAFT',
        }
      })

      setAgreements(enriched)
    } catch (err) {
      console.error('Failed to load lease agreements:', err)
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load lease agreements from server.'
      )
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [user?.role])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle document download
  const handleDownloadDocument = async (agreementId) => {
    try {
      setActionLoadingId(agreementId)
      const blob = await getAgreementDocument(agreementId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rental-agreement-${agreementId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to download agreement document:', err)
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to download agreement document.'
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handle status update (e.g. Activate draft agreement)
  const handleStatusChange = async (agreementId, newStatus) => {
    try {
      setActionLoadingId(agreementId)
      await updateAgreementStatus(agreementId, newStatus)
      setSuccessMessage(
        `Agreement #${agreementId} status successfully changed to ${newStatus}.`
      )
      await loadData(true)
    } catch (err) {
      console.error('Failed to update agreement status:', err)
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update agreement status.'
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'TERMINATED', label: 'Terminated' },
  ]

  const filteredAgreements = useMemo(() => {
    return agreements.filter((agr) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        query === '' ||
        String(agr.agreementNumber || '').toLowerCase().includes(query) ||
        String(agr.tenantName || '').toLowerCase().includes(query) ||
        String(agr.tenantEmail || '').toLowerCase().includes(query) ||
        String(agr.propertyName || '').toLowerCase().includes(query) ||
        String(agr.unit || '').toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'all' ||
        String(agr.status || '').toUpperCase() === statusFilter.toUpperCase()

      return matchesSearch && matchesStatus
    })
  }, [agreements, searchQuery, statusFilter])

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
        {/* Success Banner */}
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

        {/* Error Message Banner from Navigation State */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-amber-800 hover:text-amber-950 font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
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

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={() => loadData(true)}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>

            <Link to="/owner/agreements/new">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Create Agreement
              </Button>
            </Link>
          </div>
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

        {/* Content Section */}
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
              message={
                hasActiveFilters
                  ? 'No agreements match your search or filter criteria. Try clearing filters.'
                  : 'No lease agreements have been created yet. Generate an agreement from an approved rental application.'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Link to="/owner/agreements/new">
                    <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                      Create Agreement
                    </Button>
                  </Link>
                )
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
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm">
                  {filteredAgreements.map((agr) => {
                    const isDraft =
                      String(agr.status).toUpperCase() === 'DRAFT'
                    const isUpdating = actionLoadingId === agr.agreementId

                    return (
                      <tr
                        key={agr.agreementId}
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
                            <div>
                              <span>{agr.tenantName}</span>
                              {agr.tenantEmail && (
                                <p className="text-[11px] text-[#5B6875] font-normal truncate max-w-[150px]">
                                  {agr.tenantEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Property & Unit */}
                        <td className="py-4 px-4 min-w-[180px]">
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
                              {formatDate(agr.startDate)} &rarr;{' '}
                              {formatDate(agr.endDate)}
                            </span>
                          </div>
                        </td>

                        {/* Monthly Rent */}
                        <td className="py-4 px-4 whitespace-nowrap font-bold text-[#243447]">
                          ₹{Number(agr.monthlyRent || 0).toLocaleString('en-IN')}/mo
                        </td>

                        {/* Security Deposit */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-[#5B6875]">
                          ₹{Number(agr.securityDeposit || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <StatusBadge status={agr.status} size="sm" />
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap text-xs">
                          <div className="flex items-center justify-end gap-2">
                            {isDraft && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleStatusChange(agr.agreementId, 'ACTIVE')
                                }
                                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EDF7EE] text-[#2A583B] border border-[#C6DEC8] hover:bg-[#d9eedb] transition-colors"
                                title="Activate lease agreement"
                              >
                                Activate
                              </button>
                            )}

                            {agr.agreementDocument && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleDownloadDocument(agr.agreementId)
                                }
                                className="p-1.5 rounded-md text-[#5B6875] hover:text-[#315A7D] hover:bg-[#EAF2F7] transition-colors"
                                title="Download Agreement PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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
