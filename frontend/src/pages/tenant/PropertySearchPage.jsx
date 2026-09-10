import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import PropertyFilter from '../../components/properties/PropertyFilter'
import PropertyGrid from '../../components/properties/PropertyGrid'
import { getAvailableProperties } from '../../api/unitApi'
import { useAuth } from '../../context/AuthContext'
import { Building2, IndianRupee, Sparkles } from 'lucide-react'

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
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim()
      const matches =
        (prop.name && prop.name.toLowerCase().includes(q)) ||
        (prop.propertyName && prop.propertyName.toLowerCase().includes(q)) ||
        (prop.location && prop.location.toLowerCase().includes(q)) ||
        (prop.city && prop.city.toLowerCase().includes(q)) ||
        (prop.address && prop.address.toLowerCase().includes(q)) ||
        (prop.propertyType && prop.propertyType.toLowerCase().includes(q))
      if (!matches) return false
    }

    if (filters.city && filters.city !== 'All Locations') {
      const cityLower = filters.city.toLowerCase()
      const propCity = (prop.city || '').toLowerCase()
      const propLoc = (prop.location || '').toLowerCase()
      if (propCity !== cityLower && !propLoc.includes(cityLower)) {
        return false
      }
    }

    if (filters.propertyType && filters.propertyType !== 'All Types') {
      if ((prop.propertyType || '').toLowerCase() !== filters.propertyType.toLowerCase()) {
        return false
      }
    }

    if (filters.minRent !== undefined && filters.minRent !== null && filters.minRent !== '') {
      if ((prop.monthlyRent || 0) < Number(filters.minRent)) return false
    }
    if (filters.maxRent !== undefined && filters.maxRent !== null && filters.maxRent !== '') {
      if ((prop.monthlyRent || 0) > Number(filters.maxRent)) return false
    }

    if (filters.bedrooms && filters.bedrooms !== 'all') {
      if (String(prop.bedrooms) !== String(filters.bedrooms)) return false
    }

    if (filters.furnishing && filters.furnishing !== 'All Furnishing') {
      if ((prop.furnishing || prop.furnishingStatus) !== filters.furnishing) return false
    }

    if (filters.parking && filters.parking !== 'All Parking') {
      if (filters.parking === 'Any Parking') {
        if (!prop.parking || prop.parking === 'None') return false
      } else if (prop.parking !== filters.parking) {
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
      return sorted.sort((a, b) => (b.area || b.totalArea || 0) - (a.area || a.totalArea || 0))
    case 'ai_match':
    default:
      return sorted.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0))
  }
}

export default function PropertySearchPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [rawProperties, setRawProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sortBy, setSortBy] = useState('ai_match')
  const [favoriteIds, setFavoriteIds] = useState([])

  useEffect(() => {
    let isMounted = true
    const loadProperties = async () => {
      setIsLoading(true)
      try {
        const available = await getAvailableProperties(user)
        if (!isMounted) return
        const list = Array.isArray(available)
          ? available.map((item) => item.property || item)
          : []
        setRawProperties(list)
      } catch (err) {
        console.error('Failed to load available properties:', err)
        if (isMounted) setRawProperties([])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadProperties()
    return () => {
      isMounted = false
    }
  }, [user])

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
    navigate(`/tenant/properties/${property.id}`)
  }

  // Quick statistics for the header
  const stats = useMemo(() => {
    const total = rawProperties.length
    const avgRent = total > 0
      ? Math.round(rawProperties.reduce((acc, p) => acc + (p.monthlyRent || 0), 0) / total)
      : 0
    const topMatch = total > 0
      ? Math.max(...rawProperties.map((p) => p.aiMatchScore || 0))
      : 0
    return { total, avgRent, topMatch }
  }, [rawProperties])

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
                <IndianRupee className="w-4 h-4 text-[#EAF2F7]" />
                <span>
                  Avg Rent: <strong className="text-white font-semibold">₹{stats.avgRent}</strong>/mo
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
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  )
}

