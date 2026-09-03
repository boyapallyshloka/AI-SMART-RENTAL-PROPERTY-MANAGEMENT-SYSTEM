import React, { useState, useMemo } from 'react'
import PropertyFilter from '../../components/properties/PropertyFilter'
import PropertyGrid from '../../components/properties/PropertyGrid'
import PropertyDetailsPage from './PropertyDetailsPage'
import {
  mockProperties,
  filterProperties,
  sortProperties,
} from '../../utils/propertyMockData'
import {
  Sparkles,
  Building2,
  SlidersHorizontal,
  DollarSign,
  TrendingUp,
  Heart,
  Home,
} from 'lucide-react'

/**
 * PropertySearchPage
 * Main tenant browsing experience for discovering and filtering smart rental listings.
 *
 * @param {Object} props
 * @param {Function} [props.onSelectProperty] - Optional callback to handle property selection externally
 */
export default function PropertySearchPage({ onSelectProperty: externalOnSelect }) {
  // Selected property for viewing details (fallback if no router is present)
  const [selectedProperty, setSelectedProperty] = useState(null)

  // Filters state
  const [filters, setFilters] = useState({
    searchQuery: '',
    city: 'All Locations',
    propertyType: 'All Types',
    minRent: '',
    maxRent: '',
    bedrooms: 'all',
    furnishing: 'All Furnishing',
    parking: 'All Parking',
    minAiScore: 0,
  })

  // Sort state
  const [sortBy, setSortBy] = useState('ai_match')

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState(['prop-101'])

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    const matched = filterProperties(mockProperties, filters)
    return sortProperties(matched, sortBy)
  }, [filters, sortBy])

  // Statistics calculation for hero badges
  const stats = useMemo(() => {
    const total = mockProperties.length
    const avgRent = Math.round(
      mockProperties.reduce((acc, curr) => acc + curr.monthlyRent, 0) / total
    )
    const topMatch = Math.max(...mockProperties.map((p) => p.aiMatchScore))
    return { total, avgRent, topMatch }
  }, [])

  const handleToggleFavorite = (id) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      city: 'All Locations',
      propertyType: 'All Types',
      minRent: '',
      maxRent: '',
      bedrooms: 'all',
      furnishing: 'All Furnishing',
      parking: 'All Parking',
      minAiScore: 0,
    })
    setSortBy('ai_match')
  }

  const handleSelectProperty = (property) => {
    if (externalOnSelect) {
      externalOnSelect(property)
    } else {
      setSelectedProperty(property)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // If a property is selected in standalone mode, render the details view
  if (selectedProperty) {
    return (
      <PropertyDetailsPage
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    )
  }

  return (
    <div className="min-h-screen space-y-8 pb-16">
      {/* 1. Header / Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        {/* Background glow effects */}
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>HomeSphere AI Smart Rental Matching</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Find Your Next Perfect Home
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Browse verified rental properties personalized to your preferences, commute, and budget with real-time AI scoring.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex flex-wrap gap-4 sm:gap-6 text-xs text-slate-300 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>
                <strong className="text-white text-sm">{stats.total}</strong> Verified Listings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>
                Avg Rent: <strong className="text-white text-sm">${stats.avgRent}</strong>/mo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                Top AI Match: <strong className="text-white text-sm">{stats.topMatch}%</strong>
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
  )
}
