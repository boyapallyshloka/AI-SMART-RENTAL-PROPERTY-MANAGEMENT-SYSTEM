import React, { useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Building2,
  MapPin,
  DollarSign,
  Bed,
  Sofa,
  Car,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { filterOptions } from '../../utils/propertyMockData'

/**
 * PropertyFilter Component
 * Provides comprehensive filtering controls for tenants browsing properties.
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Callback when any filter changes
 * @param {Function} props.onResetFilters - Callback to reset all filters
 * @param {number} props.totalResults - Number of matched properties
 */
export default function PropertyFilter({
  filters = {},
  onFilterChange,
  onResetFilters,
  totalResults,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Calculate number of active filters (excluding defaults)
  const activeCount = Object.entries(filters).filter(([key, val]) => {
    if (!val) return false
    if (key === 'city' && val === 'All Locations') return false
    if (key === 'propertyType' && val === 'All Types') return false
    if (key === 'bedrooms' && val === 'all') return false
    if (key === 'furnishing' && val === 'All Furnishing') return false
    if (key === 'parking' && val === 'All Parking') return false
    if (key === 'minAiScore' && Number(val) === 0) return false
    return true
  }).length

  const handleTextChange = (e) => {
    onFilterChange({ ...filters, searchQuery: e.target.value })
  }

  const handleFieldChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const clearSearch = () => {
    onFilterChange({ ...filters, searchQuery: '' })
  }

  return (
    <div className="space-y-4">
      {/* Primary Search & Quick Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Query Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={handleTextChange}
              placeholder="Search by neighborhood, city, building name, or keyword..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Dropdown: Location */}
          <div className="relative min-w-[170px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
            <select
              value={filters.city || 'All Locations'}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {filterOptions.cities.map((city) => (
                <option key={city} value={city} className="dark:bg-slate-900">
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Quick Dropdown: Property Type */}
          <div className="relative min-w-[160px]">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
            <select
              value={filters.propertyType || 'All Types'}
              onChange={(e) => handleFieldChange('propertyType', e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {filterOptions.propertyTypes.map((type) => (
                <option key={type} value={type} className="dark:bg-slate-900">
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Toggle Advanced Filters Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileOpen(!isMobileOpen)
                setShowAdvanced(!showAdvanced)
              }}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                activeCount > 0 || showAdvanced
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                  {activeCount}
                </span>
              )}
            </button>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                title="Reset all filters"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filters Drawer / Section */}
        <div
          className={`${
            showAdvanced || isMobileOpen ? 'block' : 'hidden'
          } pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 transition-all`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Budget / Rent Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Monthly Rent
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Min"
                    value={filters.minRent || ''}
                    onChange={(e) => handleFieldChange('minRent', e.target.value)}
                    className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-slate-400 text-xs">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Max"
                    value={filters.maxRent || ''}
                    onChange={(e) => handleFieldChange('maxRent', e.target.value)}
                    className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Bedrooms Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-indigo-500" />
                Bedrooms
              </label>
              <div className="grid grid-cols-3 gap-1">
                {filterOptions.bedrooms.map((bed) => {
                  const isSelected = (filters.bedrooms || 'all') === bed.value
                  return (
                    <button
                      key={bed.value}
                      type="button"
                      onClick={() => handleFieldChange('bedrooms', bed.value)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {bed.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Furnishing Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sofa className="w-3.5 h-3.5 text-indigo-500" />
                Furnishing
              </label>
              <select
                value={filters.furnishing || 'All Furnishing'}
                onChange={(e) => handleFieldChange('furnishing', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                {filterOptions.furnishing.map((f) => (
                  <option key={f} value={f} className="dark:bg-slate-900">
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Parking Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-indigo-500" />
                Parking
              </label>
              <select
                value={filters.parking || 'All Parking'}
                onChange={(e) => handleFieldChange('parking', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                {filterOptions.parking.map((p) => (
                  <option key={p} value={p} className="dark:bg-slate-900">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bonus: AI Match Score Minimum Pill Row */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                AI Match Score Minimum:
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
                {[
                  { label: 'All Matches', value: 0 },
                  { label: '80%+', value: 80 },
                  { label: '90%+ Top Match', value: 90 },
                ].map((tier) => {
                  const isCurrent = Number(filters.minAiScore || 0) === tier.value
                  return (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => handleFieldChange('minAiScore', tier.value)}
                      className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                        isCurrent
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tier.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reset Shortcut */}
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear all filters ({activeCount})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
