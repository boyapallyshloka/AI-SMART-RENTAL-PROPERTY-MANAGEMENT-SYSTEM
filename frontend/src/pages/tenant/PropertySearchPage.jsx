import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import PropertyFilter from '../../components/properties/PropertyFilter'
import PropertyGrid from '../../components/properties/PropertyGrid'
import {
  MOCK_PROPERTIES,
  INITIAL_FILTERS,
  filterProperties,
  sortProperties,
} from '../../utils/propertyMockData'
import { Building2, DollarSign, Sparkles } from 'lucide-react'

export default function PropertySearchPage() {
  const navigate = useNavigate()

  // 1. Filter and Sorting State
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sortBy, setSortBy] = useState('ai_match')
  const [favoriteIds, setFavoriteIds] = useState(['prop-1', 'prop-4'])

  // 2. Filter & Sort Properties
  const filteredProperties = useMemo(() => {
    const filtered = filterProperties(MOCK_PROPERTIES, filters)
    return sortProperties(filtered, sortBy)
  }, [filters, sortBy])

  // 3. Handlers
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS)
  }

  const handleToggleFavorite = (propertyId) => {
    setFavoriteIds((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const handleSelectProperty = (property) => {
    navigate(`/tenant/properties/${property.id}`)
  }

  // Quick statistics for the header
  const stats = useMemo(() => {
    const total = MOCK_PROPERTIES.length
    const avgRent = Math.round(
      MOCK_PROPERTIES.reduce((acc, p) => acc + p.monthlyRent, 0) / (total || 1)
    )
    const topMatch = Math.max(...MOCK_PROPERTIES.map((p) => p.aiMatchScore || 0))
    return { total, avgRent, topMatch }
  }, [])

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="browse"
      pageTitle="Browse Properties"
    >
      <div className="space-y-6 pb-12">
        {/* 1. Header Section */}
        <div className="rounded-lg bg-[#315A7D] p-6 sm:p-8 text-white border border-[#274B68] shadow-xs">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#274B68] text-[#EAF2F7] border border-[#315A7D]">
              <Sparkles className="w-3.5 h-3.5 text-[#EAF2F7]" />
              <span>Tenant Rental Discovery</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
              Available Rental Properties
            </h1>

            <p className="text-xs sm:text-sm text-[#EAF2F7]/90 leading-relaxed">
              Browse verified listings filtered by neighborhood, budget, and specifications with integrated lease qualification scoring.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-3 flex flex-wrap gap-4 sm:gap-6 text-xs text-[#EAF2F7] border-t border-[#274B68]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#EAF2F7]" />
                <span>
                  <strong className="text-white font-semibold">{stats.total}</strong> Active Listings
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#EAF2F7]" />
                <span>
                  Avg Rent: <strong className="text-white font-semibold">${stats.avgRent}</strong>/mo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EAF2F7]" />
                <span>
                  Top Match: <strong className="text-white font-semibold">{stats.topMatch}%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Filter Controls Section */}
        <PropertyFilter
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          totalResults={filteredProperties.length}
        />

        {/* 3. Property Grid & Results */}
        <PropertyGrid
          properties={filteredProperties}
          onSelectProperty={handleSelectProperty}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </DashboardLayout>
  )
}
