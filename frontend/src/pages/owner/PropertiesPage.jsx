import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import PropertySummaryCard from '../../components/properties/PropertySummaryCard'
import OwnerPropertyTable from '../../components/properties/OwnerPropertyTable'
import {
  getMockProperties,
  deleteMockProperty,
  PROPERTY_TYPES,
  STATUS_OPTIONS,
} from '../../utils/ownerPropertyMockData'
import { Button, Input, Select } from '../../components/ui'
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  Building2,
} from 'lucide-react'

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState('')

  const loadProperties = () => {
    const list = getMockProperties()
    setProperties(list)
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const handleDelete = (id) => {
    deleteMockProperty(id)
    loadProperties()
    setToastMessage('Property deleted successfully.')
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Filtered properties
  const filteredProperties = properties.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      typeFilter === 'all' || item.type.toLowerCase() === typeFilter.toLowerCase()

    const matchesStatus =
      statusFilter === 'all' ||
      item.status.toLowerCase() === statusFilter.toLowerCase()

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
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage('')}
              className="text-emerald-500 hover:text-emerald-700"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Properties
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage real estate listings, occupancy rates, and rental units
            </p>
          </div>
          <Link to="/owner/properties/add">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Property
            </Button>
          </Link>
        </div>

        {/* Portfolio KPI Summary */}
        <PropertySummaryCard properties={properties} />

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by property name, address, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
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
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              Showing{' '}
              <strong className="text-slate-900 dark:text-white">
                {filteredProperties.length}
              </strong>{' '}
              of {properties.length} properties
            </span>
            {hasActiveFilters && (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* Properties Table */}
        <OwnerPropertyTable
          properties={filteredProperties}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  )
}
