import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import PropertyFilter from '../../components/properties/PropertyFilter'
import PropertyGrid from '../../components/properties/PropertyGrid'
import { getPublicProperties, searchPublicProperties } from '../../api/propertyApi'
import { Building2, IndianRupee, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'

const INITIAL_FILTERS = {
  searchQuery: '',
  city: 'All Locations',
  propertyType: 'All Types',
  minRent: '',
  maxRent: '',
  bedrooms: 'all',
  furnishing: 'All Furnishing',
  parking: 'All Parking',
  minAiScore: 0,
}

function filterProperties(properties = [], filters = {}) {
  return properties.filter((prop) => {
    // 1. Search Query filter (matches name, propertyName, description, propertyType, city, address)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim()
      const matches =
        (prop.name && prop.name.toLowerCase().includes(q)) ||
        (prop.propertyName && prop.propertyName.toLowerCase().includes(q)) ||
        (prop.description && prop.description.toLowerCase().includes(q)) ||
        (prop.location && prop.location.toLowerCase().includes(q)) ||
        (prop.city && prop.city.toLowerCase().includes(q)) ||
        (prop.address && prop.address.toLowerCase().includes(q)) ||
        (prop.propertyType && prop.propertyType.toLowerCase().includes(q))
      if (!matches) return false
    }

    // 2. City / Location filter
    if (filters.city && filters.city !== 'All Locations') {
      const cityLower = filters.city.toLowerCase()
      const propCity = (prop.city || '').toLowerCase()
      const propLoc = (prop.location || '').toLowerCase()
      if (propCity || propLoc) {
        if (propCity !== cityLower && !propLoc.includes(cityLower)) {
          return false
        }
      }
    }

    // 3. Property Type filter (case-insensitive enum matching)
    if (filters.propertyType && filters.propertyType !== 'All Types') {
      const filterTypeNorm = filters.propertyType.toUpperCase().replace(/\s+/g, '_')
      const propTypeNorm = (prop.propertyType || prop.type || '').toUpperCase().replace(/\s+/g, '_')
      if (filterTypeNorm !== propTypeNorm) {
        return false
      }
    }

    // 4. Rent filters: only filter when monthlyRent is actually populated on the property (Unit-level)
    if (prop.monthlyRent != null) {
      if (filters.minRent !== undefined && filters.minRent !== null && filters.minRent !== '') {
        if (Number(prop.monthlyRent) < Number(filters.minRent)) return false
      }
      if (filters.maxRent !== undefined && filters.maxRent !== null && filters.maxRent !== '') {
        if (Number(prop.monthlyRent) > Number(filters.maxRent)) return false
      }
    }

    // 5. Bedrooms filter: only filter when bedrooms is populated
    if (prop.bedrooms != null && filters.bedrooms && filters.bedrooms !== 'all') {
      if (filters.bedrooms === '3+' || filters.bedrooms === '4+') {
        const threshold = parseInt(filters.bedrooms, 10)
        if (Number(prop.bedrooms) < threshold) return false
      } else if (String(prop.bedrooms) !== String(filters.bedrooms)) {
        return false
      }
    }

    // 6. Furnishing filter
    if (filters.furnishing && filters.furnishing !== 'All Furnishing') {
      const filterFurnNorm = filters.furnishing.toUpperCase().replace(/[-\s]+/g, '_')
      const propFurnNorm = (prop.furnishingStatus || prop.furnishing || '').toUpperCase().replace(/[-\s]+/g, '_')
      if (filterFurnNorm !== propFurnNorm) {
        if (filterFurnNorm !== 'FURNISHED' || propFurnNorm !== 'FULLY_FURNISHED') {
          return false
        }
      }
    }

    // 7. Parking filter
    if (filters.parking && filters.parking !== 'All Parking') {
      if (filters.parking === 'Any Parking') {
        const hasParking =
          prop.parkingAvailable === true ||
          (prop.parking && prop.parking !== 'None' && prop.parking !== 'No Parking')
        if (!hasParking) return false
      } else {
        const hasParking =
          prop.parkingAvailable === true ||
          (prop.parking && prop.parking !== 'None')
        if (!hasParking) return false
      }
    }

    // 8. AI Score filter
    if (filters.minAiScore && Number(filters.minAiScore) > 0) {
      if (prop.aiMatchScore != null && Number(prop.aiMatchScore) < Number(filters.minAiScore)) {
        return false
      }
    }

    return true
  })
}

function sortProperties(properties = [], sortBy = 'ai_match') {
  const sorted = [...properties]
  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => (a.monthlyRent || 0) - (b.monthlyRent || 0))
    case 'price_desc':
      return sorted.sort((a, b) => (b.monthlyRent || 0) - (a.monthlyRent || 0))
    case 'bedrooms_desc':
      return sorted.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0))
    case 'area_desc':
      return sorted.sort((a, b) => (b.totalArea || b.area || 0) - (a.totalArea || a.area || 0))
    case 'ai_match':
    default:
      return sorted.sort((a, b) => {
        if (b.aiMatchScore != null && a.aiMatchScore != null) {
          return b.aiMatchScore - a.aiMatchScore
        }
        return (b.propertyId || b.id || 0) - (a.propertyId || a.id || 0)
      })
  }
}

export default function PropertySearchPage() {
  const navigate = useNavigate()

  const [rawProperties, setRawProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sortBy, setSortBy] = useState('ai_match')
  const [favoriteIds, setFavoriteIds] = useState([])
  const isFirstRender = useRef(true)

  const hasActiveBackendFilters = (f) => {
    return Boolean(
      (f.searchQuery && f.searchQuery.trim()) ||
      (f.city && f.city !== 'All Locations') ||
      (f.propertyType && f.propertyType !== 'All Types') ||
      (f.furnishing && f.furnishing !== 'All Furnishing') ||
      (f.parking && f.parking !== 'All Parking') ||
      (f.minRent !== undefined && f.minRent !== null && f.minRent !== '') ||
      (f.maxRent !== undefined && f.maxRent !== null && f.maxRent !== '') ||
      (f.bedrooms && f.bedrooms !== 'all')
    )
  }

  const loadProperties = useCallback(async (currentFilters = filters) => {
    setIsLoading(true)
    setError(null)
    try {
      let list = []
      if (hasActiveBackendFilters(currentFilters)) {
        list = await searchPublicProperties(currentFilters)
      } else {
        list = await getPublicProperties()
      }
      setRawProperties(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Failed to load available properties from backend:', err)
      const errorMsg =
        err?.isAuthError || err?.status === 401
          ? 'Authentication required or session expired. Please sign in to view properties.'
          : err?.isForbidden || err?.status === 403
          ? 'Access restricted: Please log in with a tenant account to browse available properties.'
          : err?.message || 'Unable to load rental properties. Please try again.'
      setError(errorMsg)
      setRawProperties([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      loadProperties(INITIAL_FILTERS)
      return
    }

    const timer = setTimeout(() => {
      loadProperties(filters)
    }, 350)
    return () => clearTimeout(timer)
  }, [filters, loadProperties])

  // Filter & Sort Properties
  const filteredProperties = useMemo(() => {
    const filtered = filterProperties(rawProperties, filters)
    return sortProperties(filtered, sortBy)
  }, [rawProperties, filters, sortBy])

  // Handlers
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
    const propertyId = property.propertyId ?? property.id
    navigate(`/tenant/properties/${propertyId}`)
  }

  // Quick statistics for the header
  const stats = useMemo(() => {
    const total = rawProperties.length
    const propsWithRent = rawProperties.filter(
      (p) => p.monthlyRent != null && Number(p.monthlyRent) > 0
    )
    const avgRent =
      propsWithRent.length > 0
        ? Math.round(
            propsWithRent.reduce((acc, p) => acc + Number(p.monthlyRent), 0) /
              propsWithRent.length
          )
        : null
    const propsWithScore = rawProperties.filter((p) => p.aiMatchScore != null)
    const topMatch =
      propsWithScore.length > 0
        ? Math.max(...propsWithScore.map((p) => p.aiMatchScore))
        : null
    return { total, avgRent, topMatch }
  }, [rawProperties])

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="find-properties"
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
              {stats.avgRent != null && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#EAF2F7]" />
                  <span>
                    Avg Rent: <strong className="text-white font-semibold">₹{stats.avgRent}</strong>/mo
                  </span>
                </div>
              )}
              {stats.topMatch != null && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#EAF2F7]" />
                  <span>
                    Top Match: <strong className="text-white font-semibold">{stats.topMatch}%</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert Box (API Failure / Authentication Failure) */}
        {error && (
          <div className="rounded-lg bg-[#FDF2F2] border border-[#F8B4B4] p-4 text-[#9B1C1C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#E02424] shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadProperties(filters)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E02424] text-white text-xs font-semibold hover:bg-[#C81E1E] transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

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
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  )
}
