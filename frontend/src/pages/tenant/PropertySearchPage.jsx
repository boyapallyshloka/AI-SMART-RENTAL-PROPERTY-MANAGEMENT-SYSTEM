import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import PropertyFilter from '../../components/properties/PropertyFilter'
import PropertyGrid from '../../components/properties/PropertyGrid'
import PropertyCard from '../../components/properties/PropertyCard'
import { getPublicProperties, searchPublicProperties } from '../../api/propertyApi'
import { getPropertyRecommendations } from '../../api/aiApi'
import { getMyTenantProfile } from '../../api/tenantApi'
import { useAuth } from '../../context/AuthContext'
import { isTenant } from '../../utils/roles'
import { Building2, IndianRupee, Sparkles, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Map real Spring Boot M2RecommendationItem to PropertyCard-compatible object.
 * Strictly adheres to NO FAKE AI policy:
 * - Real recommendationScore is formatted only when returned by the backend.
 * - Match criteria tags (City, Budget, Bedrooms, Type, etc.) are included ONLY when backend returns 1.
 * - Real approxDistanceKm is displayed ONLY when provided and greater than 0.
 * - Real availableUnits count is displayed ONLY when present.
 * - Spring Boot propertyDetails (property, address, images, etc.) are reused directly.
 */
function mapRecommendationToProperty(item) {
  if (!item) return null

  const details = item.propertyDetails || {}
  const prop = details.property || {}
  const addr = details.address || {}
  const images = details.images || []

  // Real recommendation score formatted only from backend recommendationScore
  let aiScore = undefined
  if (item.recommendationScore != null && !isNaN(Number(item.recommendationScore))) {
    const rawScore = Number(item.recommendationScore)
    aiScore = rawScore <= 1.0 ? Math.round(rawScore * 100) : Math.round(rawScore)
  }

  // Real match criteria pills strictly from backend match flags
  const matchCriteria = []
  if (item.cityMatch === 1) matchCriteria.push('City')
  if (item.budgetMatch === 1) matchCriteria.push('Budget')
  if (item.bedroomMatch === 1) matchCriteria.push('Bedrooms')
  if (item.propertyTypeMatch === 1) matchCriteria.push('Type')
  if (item.furnishingMatch === 1) matchCriteria.push('Furnishing')
  if (item.parkingMatch === 1) matchCriteria.push('Parking')
  if (item.amenityMatch === 1) matchCriteria.push('Amenities')

  const propertyId = item.propertyId || prop.propertyId || prop.id
  const monthlyRent = item.monthlyRent != null ? item.monthlyRent : prop.monthlyRent
  const bedrooms = item.propertyBedrooms != null ? item.propertyBedrooms : prop.bedrooms
  const city = item.propertyCity || prop.city || addr.city

  const approxDistanceKm =
    item.approxDistanceKm != null && !isNaN(Number(item.approxDistanceKm)) && Number(item.approxDistanceKm) > 0
      ? Number(item.approxDistanceKm)
      : null

  const availableUnitsCount =
    Array.isArray(item.availableUnits) && item.availableUnits.length > 0
      ? item.availableUnits.length
      : null

  return {
    ...prop,
    id: propertyId,
    propertyId: propertyId,
    name: prop.propertyName || prop.name || `Property #${propertyId}`,
    propertyName: prop.propertyName || prop.name || `Property #${propertyId}`,
    propertyType: prop.propertyType || prop.type || 'APARTMENT',
    city: city,
    location: addr.city || city || addr.addressLine1 || prop.location || '',
    address: addr.addressLine1 || prop.address || '',
    monthlyRent: monthlyRent,
    bedrooms: bedrooms,
    bathrooms: prop.bathrooms,
    totalArea: prop.totalArea || prop.area,
    images: images.length > 0 ? images : prop.images,
    imageUrl: images[0]?.imageUrl || prop.imageUrl,
    status: prop.status || 'AVAILABLE',
    aiMatchScore: aiScore,
    matchCriteria,
    approxDistanceKm,
    availableUnitsCount,
  }
}

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
  const { user } = useAuth()
  const isUserTenant = isTenant(user?.role)
  // Canonical Tenant ID State (tenants.tenant_id, NOT users.id)
  const [canonicalTenantId, setCanonicalTenantId] = useState(
    user?.tenantId != null && !isNaN(Number(user.tenantId)) && Number(user.tenantId) > 0
      ? Number(user.tenantId)
      : null
  )

  // Normal Property Search State
  const [rawProperties, setRawProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sortBy, setSortBy] = useState('ai_match')
  const [favoriteIds, setFavoriteIds] = useState([])
  const isFirstRender = useRef(true)

  // AI Property Recommendations State (M2)
  const [aiRecommendations, setAiRecommendations] = useState([])
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiModelVersion, setAiModelVersion] = useState(null)
  const [isAiSectionCollapsed, setIsAiSectionCollapsed] = useState(false)

  // Resolve canonical Tenant ID from authenticated session/profile (GET /api/tenants/me)
  // Strictly avoids falling back to user.id (which is users.id, not tenants.tenant_id)
  const resolveTenantId = useCallback(async () => {
    if (!isUserTenant) return null

    // 1. Check if canonical tenant ID is already stored in state
    if (canonicalTenantId != null && !isNaN(Number(canonicalTenantId)) && Number(canonicalTenantId) > 0) {
      return Number(canonicalTenantId)
    }

    // 2. Check if canonical tenant ID is available on the user object
    if (user?.tenantId != null && !isNaN(Number(user.tenantId)) && Number(user.tenantId) > 0) {
      const tid = Number(user.tenantId)
      setCanonicalTenantId(tid)
      return tid
    }

    // 3. Retrieve canonical Tenant profile from Spring Boot (GET /api/tenants/me)
    try {
      const profile = await getMyTenantProfile()
      const tid = profile?.tenantId != null ? Number(profile.tenantId) : null
      if (tid && !isNaN(tid) && tid > 0) {
        setCanonicalTenantId(tid)
        if (user) {
          user.tenantId = tid
          try {
            localStorage.setItem('homesphere_user', JSON.stringify(user))
          } catch {
            // Ignore localStorage errors
          }
        }
        return tid
      }
    } catch (err) {
      console.error('Failed to resolve canonical tenant ID for AI recommendations:', err)
    }

    return null
  }, [canonicalTenantId, isUserTenant, user])

  // Retrieve AI Recommendations from Spring Boot (GET /api/ai/recommendations)
  const loadRecommendations = useCallback(async () => {
    if (!isUserTenant) {
      setAiRecommendations([])
      setIsAiLoading(false)
      return
    }

    setIsAiLoading(true)
    setAiError(null)

    try {
      const activeTenantId = await resolveTenantId()
      if (!activeTenantId) {
        setAiRecommendations([])
        setIsAiLoading(false)
        return
      }

      const response = await getPropertyRecommendations(activeTenantId, 5)
      const items = Array.isArray(response?.recommendations) ? response.recommendations : []
      const mapped = items.map(mapRecommendationToProperty).filter(Boolean)
      setAiRecommendations(mapped)
      if (response?.modelVersion) {
        setAiModelVersion(response.modelVersion)
      }
    } catch (err) {
      console.error('Failed to load AI property recommendations:', err)
      const errorMsg =
        err?.status === 401
          ? 'Session expired. Please log in again to view recommendations.'
          : err?.status === 403
          ? 'AI recommendations are exclusively available for verified tenant accounts.'
          : err?.message || 'Unable to load property recommendations at this time.'
      setAiError(errorMsg)
      setAiRecommendations([])
    } finally {
      setIsAiLoading(false)
    }
  }, [isUserTenant, resolveTenantId])

  useEffect(() => {
    if (isUserTenant) {
      loadRecommendations()
    }
  }, [isUserTenant, loadRecommendations])

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
    const allScored = [
      ...rawProperties.filter((p) => p.aiMatchScore != null).map((p) => p.aiMatchScore),
      ...aiRecommendations.filter((p) => p.aiMatchScore != null).map((p) => p.aiMatchScore),
    ]
    const topMatch = allScored.length > 0 ? Math.max(...allScored) : null
    return { total, avgRent, topMatch }
  }, [rawProperties, aiRecommendations])

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

        {/* 2. AI Property Recommendations Section (M2 - Authenticated Tenant Only) */}
        {isUserTenant && (
          <div className="rounded-lg bg-white border border-[#D9E0E6] p-5 sm:p-6 shadow-2xs space-y-4">
            {/* Recommendation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E6] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#EAF2F7] flex items-center justify-center text-[#315A7D] shrink-0 border border-[#D9E0E6]">
                  <Sparkles className="w-4 h-4 text-[#315A7D]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#243447]">
                      Recommended For You
                    </h2>
                    {aiModelVersion && (
                      <span className="text-[10px] font-mono text-[#5B6875] bg-[#F7F8FA] px-1.5 py-0.5 rounded border border-[#D9E0E6]">
                        {aiModelVersion}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5B6875] mt-0.5">
                    Personalized property matches based on your tenant profile and rental preferences.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                {aiRecommendations.length > 0 && !isAiLoading && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EAF2F7] text-[#315A7D] border border-[#315A7D]/20">
                    {aiRecommendations.length} {aiRecommendations.length === 1 ? 'Match' : 'Matches'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={loadRecommendations}
                  disabled={isAiLoading || !isUserTenant}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#D9E0E6] text-xs font-medium text-[#5B6875] hover:text-[#243447] hover:bg-[#F7F8FA] disabled:opacity-50 transition-colors cursor-pointer"
                  title="Refresh AI Recommendations"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin text-[#315A7D]' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAiSectionCollapsed((prev) => !prev)}
                  className="p-1.5 rounded-md border border-[#D9E0E6] text-[#5B6875] hover:text-[#243447] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                  title={isAiSectionCollapsed ? 'Expand Recommendations' : 'Collapse Recommendations'}
                >
                  {isAiSectionCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recommendation Body */}
            {!isAiSectionCollapsed && (
              <>
                {isAiLoading ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center space-y-2.5 bg-[#F7F8FA] rounded-lg border border-[#D9E0E6]">
                    <RefreshCw className="w-6 h-6 text-[#315A7D] animate-spin" />
                    <p className="text-sm font-medium text-[#243447]">Finding properties for you...</p>
                  </div>
                ) : aiError ? (
                  <div className="rounded-lg bg-[#FDF2F2] border border-[#F8B4B4] p-4 text-[#9B1C1C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 text-[#E02424] shrink-0" />
                      <span>{aiError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={loadRecommendations}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E02424] text-white text-xs font-semibold hover:bg-[#C81E1E] transition-colors shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Try Again</span>
                    </button>
                  </div>
                ) : aiRecommendations.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center space-y-2 bg-[#F7F8FA] rounded-lg border border-[#D9E0E6]">
                    <Sparkles className="w-6 h-6 text-[#5B6875]" />
                    <p className="text-sm font-medium text-[#243447]">
                      No property recommendations are available yet.
                    </p>
                    <p className="text-xs text-[#5B6875] max-w-md">
                      We could not find active recommendations matching your current profile. Explore all available listings below.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {aiRecommendations.map((prop) => (
                      <PropertyCard
                        key={`ai-${prop.propertyId ?? prop.id}`}
                        property={prop}
                        onSelect={handleSelectProperty}
                        isFavorite={favoriteIds.includes(prop.propertyId ?? prop.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Error Alert Box (API Failure / Authentication Failure for Regular Search) */}
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

        {/* 3. Filter Controls Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-base font-semibold text-[#243447]">
              All Available Listings
            </h2>
            <span className="text-xs text-[#5B6875]">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            </span>
          </div>
          <PropertyFilter
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
            totalResults={filteredProperties.length}
          />
        </div>

        {/* 4. Property Grid & Results */}
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
