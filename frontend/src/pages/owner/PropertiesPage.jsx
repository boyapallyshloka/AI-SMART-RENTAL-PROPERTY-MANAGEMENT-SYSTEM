import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import PropertySummaryCard from '../../components/properties/PropertySummaryCard'
import OwnerPropertyTable from '../../components/properties/OwnerPropertyTable'
import {
  getMyProperties,
  deleteProperty,
  updatePropertyStatus,
} from '../../api/propertyApi'
import {
  PROPERTY_TYPES,
  STATUS_OPTIONS,
} from '../../utils/ownerPropertyMockData'
import { Button, Input, Select, Loader } from '../../components/ui'
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  Building,
  Building2,
  AlertCircle,
} from 'lucide-react'

/**
 * Maps Spring Boot PropertyResponse to the shape expected by UI components
 * Backend fields:
 * - propertyId -> id, propertyId
 * - propertyName -> name, propertyName
 * - propertyType -> type, propertyType
 * - description -> description
 * - totalArea -> area, totalArea
 * - bedrooms -> bedrooms
 * - bathrooms -> bathrooms
 * - furnishingStatus -> furnishing, furnishingStatus
 * - parkingAvailable -> parking, parkingAvailable
 * - monthlyRent -> monthlyRent
 * - securityDeposit -> deposit, securityDeposit
 * - status -> status
 * - ownerId, ownerName, createdAt, updatedAt
 *
 * NOTE: Address fields are left in fallback/empty state until Phase 4 Address integration.
 * DO NOT invent fake address fields.
 */
export const mapBackendPropertyToUi = (prop) => {
  if (!prop) return null

  const id =
    prop.propertyId != null
      ? String(prop.propertyId)
      : prop.id != null
      ? String(prop.id)
      : ''
  const name = prop.propertyName || prop.name || 'Unnamed Property'
  const type = prop.propertyType || prop.type || 'APARTMENT'

  return {
    ...prop,
    id,
    propertyId: prop.propertyId ?? prop.id,
    name,
    propertyName: prop.propertyName ?? prop.name,
    type,
    propertyType: prop.propertyType ?? prop.type,
    // Address fields: keep in current fallback/empty state until Phase 4 Address integration
    address: prop.address || '',
    city: prop.city || '',
    state: prop.state || '',
    zipCode: prop.zipCode || '',
    // Specs
    bedrooms: prop.bedrooms != null ? Number(prop.bedrooms) : 0,
    bathrooms: prop.bathrooms != null ? Number(prop.bathrooms) : 0,
    area:
      prop.totalArea != null
        ? Number(prop.totalArea)
        : prop.area != null
        ? Number(prop.area)
        : 0,
    totalArea:
      prop.totalArea != null
        ? Number(prop.totalArea)
        : prop.area != null
        ? Number(prop.area)
        : 0,
    furnishing: prop.furnishingStatus || prop.furnishing || 'UNFURNISHED',
    furnishingStatus: prop.furnishingStatus || prop.furnishing || 'UNFURNISHED',
    parking:
      prop.parkingAvailable != null
        ? prop.parkingAvailable
          ? 'Available'
          : 'None'
        : prop.parking || 'None',
    parkingAvailable:
      prop.parkingAvailable != null
        ? Boolean(prop.parkingAvailable)
        : prop.parking === 'Available' || Boolean(prop.parking),
    // Financials
    monthlyRent: prop.monthlyRent != null ? Number(prop.monthlyRent) : 0,
    deposit:
      prop.securityDeposit != null
        ? Number(prop.securityDeposit)
        : prop.deposit != null
        ? Number(prop.deposit)
        : 0,
    securityDeposit:
      prop.securityDeposit != null
        ? Number(prop.securityDeposit)
        : prop.deposit != null
        ? Number(prop.deposit)
        : 0,
    // Status & details
    status: prop.status || 'AVAILABLE',
    description: prop.description || '',
    // Units metrics (backend PropertyResponse does not have nested building/units)
    totalUnits: prop.totalUnits != null ? Number(prop.totalUnits) : 1,
    occupiedUnits:
      prop.occupiedUnits != null
        ? Number(prop.occupiedUnits)
        : prop.status === 'OCCUPIED'
        ? 1
        : 0,
    images: Array.isArray(prop.images) && prop.images.length > 0 ? prop.images : [],
    amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
    ownerId: prop.ownerId,
    ownerName: prop.ownerName,
    createdAt: prop.createdAt,
    updatedAt: prop.updatedAt,
  }
}

export default function PropertiesPage() {
  const location = useLocation()
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState(
    location.state?.toastMessage || ''
  )
  const [deletingId, setDeletingId] = useState(null)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)

  useEffect(() => {
    if (location.state?.toastMessage) {
      setToastMessage(location.state.toastMessage)
      const timer = setTimeout(() => setToastMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  const loadProperties = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getMyProperties()
      const data = Array.isArray(response) ? response : response?.data || []
      const mapped = data.map(mapBackendPropertyToUi)
      setProperties(mapped)
    } catch (err) {
      console.error('Failed to load properties from backend:', err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load properties from server. Please try again.'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const handleDelete = async (id) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await deleteProperty(id)
      setProperties((prev) =>
        prev.filter((item) => item.id !== id && item.propertyId !== id)
      )
      setToastMessage('Property deleted successfully.')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to delete property:', err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete property. Please try again.'
      setError(errorMsg)
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    if (updatingStatusId) return
    setUpdatingStatusId(id)
    try {
      await updatePropertyStatus(id, newStatus)
      setProperties((prev) =>
        prev.map((item) =>
          item.id === id || item.propertyId === id
            ? { ...item, status: newStatus }
            : item
        )
      )
      setToastMessage(`Property status updated to ${newStatus}.`)
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to update property status:', err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update property status. Please try again.'
      setError(errorMsg)
    } finally {
      setUpdatingStatusId(null)
    }
  }

  // Filtered properties
  const filteredProperties = properties.filter((item) => {
    const name = (item.name || '').toLowerCase()
    const address = (item.address || '').toLowerCase()
    const city = (item.city || '').toLowerCase()
    const query = searchQuery.trim().toLowerCase()

    const matchesSearch =
      query === '' ||
      name.includes(query) ||
      address.includes(query) ||
      city.includes(query)

    const matchesType =
      typeFilter === 'all' ||
      (item.type || '').toLowerCase() === typeFilter.toLowerCase()

    const matchesStatus =
      statusFilter === 'all' ||
      (item.status || '').toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const hasActiveFilters =
    searchQuery !== '' || typeFilter !== 'all' || statusFilter !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  const typeOptions = [
    { value: 'all', label: 'All Property Types' },
    ...PROPERTY_TYPES.map((t) => ({ value: t, label: t })),
  ]

  const statusFilterOptions = [
    { value: 'all', label: 'All Statuses' },
    ...STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
  ]

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="properties"
      pageTitle="Properties"
    >
      <div className="space-y-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage('')}
              className="text-[#2A583B] hover:text-[#1d3d29]"
            >
              &times;
            </button>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadProperties}
              className="text-xs font-semibold underline text-red-700 hover:text-red-900 ml-4 shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
              Properties
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Manage real estate listings, occupancy rates, and rental units
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/owner/buildings">
              <Button variant="outline" leftIcon={<Building className="w-4 h-4 text-[#315A7D]" />}>
                View Buildings
              </Button>
            </Link>
            <Link to="/owner/properties/add">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Add Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Portfolio KPI Summary */}
        <PropertySummaryCard properties={properties} />

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#D9E0E6] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by property name, address, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[#5B6875]" />}
              />
            </div>

            <div>
              <Select
                options={typeOptions}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  options={statusFilterOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  title="Reset all filters"
                  aria-label="Reset all filters"
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
                {filteredProperties.length}
              </strong>{' '}
              of {properties.length} properties
            </span>
            {hasActiveFilters && (
              <span className="text-[#315A7D] font-medium">
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* Properties Table / Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-12 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <Loader size="lg" text="Loading properties..." center />
          </div>
        ) : (
          <OwnerPropertyTable
            properties={filteredProperties}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            deletingId={deletingId}
            updatingStatusId={updatingStatusId}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
