import React, { useState } from 'react'
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  Heart,
  Car,
  Sofa,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Building2,
} from 'lucide-react'
import { resolveImageUrl } from '../../api/propertyApi'

/**
 * Enterprise PropertyCard Component for HomeSphere
 * Displays key details of a rental property for tenant browsing.
 * Strictly adheres to backend Property contract:
 * - monthlyRent, securityDeposit, bedrooms, bathrooms belong to Unit and are hidden when absent.
 * - uses real backend image URLs and IDs.
 *
 * @param {Object} props
 * @param {Object} props.property
 * @param {Function} [props.onSelect]
 * @param {boolean} [props.isFavorite]
 * @param {Function} [props.onToggleFavorite]
 */
export default function PropertyCard({
  property = {},
  onSelect,
  isFavorite: controlledFavorite,
  onToggleFavorite,
}) {
  const [internalFavorite, setInternalFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)
  const isFav = controlledFavorite !== undefined ? controlledFavorite : internalFavorite

  const {
    id,
    propertyId,
    name,
    propertyName,
    propertyType,
    type,
    city,
    location,
    address,
    monthlyRent,
    bedrooms,
    bathrooms,
    area,
    totalArea,
    furnishing,
    furnishingStatus,
    parking,
    parkingAvailable,
    yearBuilt,
    status,
    availabilityStatus,
    imageUrl,
    images,
    deposit,
    securityDeposit,
    aiMatchScore,
  } = property

  const realId = propertyId ?? id
  const displayName = propertyName || name || 'Unnamed Property'
  const displayType = (propertyType || type || 'APARTMENT').replace(/_/g, ' ')

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    if (onToggleFavorite) {
      onToggleFavorite(realId)
    } else {
      setInternalFavorite(!internalFavorite)
    }
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(property)
    }
  }

  // Real image resolution
  const rawImg = imageUrl || (Array.isArray(images) && images[0]?.imageUrl) || ''
  const resolvedImg = resolveImageUrl(rawImg)

  // Availability / Status: derived from real backend status
  const rawStatus = status || availabilityStatus || ''
  const isAvailable = rawStatus === 'AVAILABLE' || rawStatus === 'Available Now'
  const displayStatus = rawStatus
    ? rawStatus === 'AVAILABLE'
      ? 'Available'
      : rawStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : null

  // Unit-level financials: only formatted if actually present on the object
  const hasRent = monthlyRent !== undefined && monthlyRent !== null
  const formattedRent = hasRent
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(monthlyRent)
    : null
  const depVal = deposit ?? securityDeposit

  // Real specifications
  const displayArea = totalArea ?? area
  const hasBeds = bedrooms !== undefined && bedrooms !== null
  const hasBaths = bathrooms !== undefined && bathrooms !== null
  const hasArea = displayArea !== undefined && displayArea !== null && Number(displayArea) > 0
  const hasYear = yearBuilt !== undefined && yearBuilt !== null
  const displayLocation = location || address || city || ''

  // Furnishing and Parking
  const displayFurnishing = furnishingStatus || furnishing
  const displayParking =
    parkingAvailable != null
      ? parkingAvailable
        ? 'Parking Available'
        : 'No Parking'
      : parking

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col overflow-hidden rounded-lg border border-[#D9E0E6] bg-white shadow-2xs hover:shadow-sm hover:border-[#315A7D]/40 transition-all cursor-pointer"
    >
      {/* Property Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAF2F7]">
        {resolvedImg && !imageError ? (
          <img
            src={resolvedImg}
            alt={displayName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-[#F7F8FA] p-4 text-center select-none">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF2F7] text-[#315A7D] mb-2 shadow-2xs border border-[#D9E0E6]">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#243447]">
              No Preview Available
            </span>
            <span className="text-[10px] text-[#5B6875] mt-0.5 max-w-[160px] truncate">
              {displayName}
            </span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
          {/* Availability Status Badge (only when real status exists) */}
          {displayStatus ? (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-xs ${
                isAvailable
                  ? 'bg-white text-[#2A583B] border border-[#C6DEC8] shadow-2xs'
                  : 'bg-white text-[#8A5B16] border border-[#F4E2B6] shadow-2xs'
              }`}
            >
              {isAvailable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7D58]" />
              ) : (
                <Calendar className="w-3.5 h-3.5 text-[#B7791F]" />
              )}
              <span>{displayStatus}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
            className="p-1.5 rounded-md bg-white border border-[#D9E0E6] text-[#5B6875] hover:text-[#B94A48] hover:bg-white transition-colors shadow-2xs"
          >
            <Heart
              className={`w-4 h-4 ${
                isFav ? 'fill-[#B94A48] text-[#B94A48]' : ''
              }`}
            />
          </button>
        </div>

        {/* Bottom Property Type Pill */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#315A7D] text-white text-[11px] font-medium capitalize shadow-2xs">
            {displayType}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        {/* Rent & Price - strictly hidden when monthlyRent is not present on property */}
        {hasRent && (
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tracking-tight text-[#315A7D]">
                {formattedRent}
              </span>
              <span className="text-xs text-[#5B6875] font-medium">/ month</span>
            </div>
            {depVal != null && (
              <span className="text-[11px] text-[#5B6875] bg-[#F7F8FA] border border-[#D9E0E6] px-2 py-0.5 rounded-md">
                Dep: ₹{Number(depVal).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        )}

        {/* Title and Location */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-[#243447] line-clamp-1 group-hover:text-[#315A7D] transition-colors">
            {displayName}
          </h3>
          {displayLocation && (
            <p className="flex items-center gap-1 text-xs text-[#5B6875] mt-0.5 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
              <span>{displayLocation}</span>
            </p>
          )}
        </div>

        {/* Key Features Grid - displays real specifications without fabricating beds/baths */}
        {(hasBeds || hasBaths || hasArea || hasYear) && (
          <div className="flex flex-wrap items-center gap-1.5 py-2 border-y border-[#D9E0E6] text-xs text-[#5B6875]">
            {hasBeds && (
              <div className="flex-1 min-w-[70px] flex items-center gap-1.5 justify-center bg-[#F7F8FA] py-1.5 px-2 rounded-md">
                <Bed className="w-3.5 h-3.5 text-[#5B6875]" />
                <span className="font-medium text-[#243447]">
                  {bedrooms === 0 ? 'Studio' : `${bedrooms} Beds`}
                </span>
              </div>
            )}

            {hasBaths && (
              <div className="flex-1 min-w-[70px] flex items-center gap-1.5 justify-center bg-[#F7F8FA] py-1.5 px-2 rounded-md">
                <Bath className="w-3.5 h-3.5 text-[#5B6875]" />
                <span className="font-medium text-[#243447]">{bathrooms} Baths</span>
              </div>
            )}

            {hasArea && (
              <div className="flex-1 min-w-[70px] flex items-center gap-1.5 justify-center bg-[#F7F8FA] py-1.5 px-2 rounded-md">
                <Maximize2 className="w-3.5 h-3.5 text-[#5B6875]" />
                <span className="font-medium text-[#243447]">{displayArea} sqft</span>
              </div>
            )}

            {hasYear && !hasBeds && (
              <div className="flex-1 min-w-[70px] flex items-center gap-1.5 justify-center bg-[#F7F8FA] py-1.5 px-2 rounded-md">
                <Calendar className="w-3.5 h-3.5 text-[#5B6875]" />
                <span className="font-medium text-[#243447]">Built {yearBuilt}</span>
              </div>
            )}
          </div>
        )}

        {/* Secondary Details & Optional AI Match Score */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5B6875] flex-wrap">
            {displayFurnishing && displayFurnishing !== 'UNFURNISHED' && (
              <span className="inline-flex items-center gap-1 bg-[#F7F8FA] border border-[#D9E0E6] px-2 py-0.5 rounded capitalize">
                <Sofa className="w-3 h-3 text-[#5B6875]" />
                {displayFurnishing.replace(/_/g, ' ').toLowerCase()}
              </span>
            )}
            {displayParking && displayParking !== 'None' && displayParking !== 'No Parking' && (
              <span className="inline-flex items-center gap-1 bg-[#F7F8FA] border border-[#D9E0E6] px-2 py-0.5 rounded">
                <Car className="w-3 h-3 text-[#5B6875]" />
                {displayParking}
              </span>
            )}
          </div>

          {/* AI Match Score - only rendered when real score exists */}
          {aiMatchScore !== undefined && aiMatchScore !== null && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#EAF2F7] text-[#315A7D] border border-[#315A7D]/30 shrink-0">
              <Sparkles className="w-3 h-3 text-[#315A7D]" />
              <span>{aiMatchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Card Footer / View Details */}
        <div className="pt-2 mt-auto flex items-center justify-between border-t border-[#D9E0E6]">
          <span className="text-xs font-semibold text-[#315A7D] flex items-center gap-1 group-hover:text-[#274B68] transition-colors">
            View Listing
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>

          <span className="text-[10px] text-[#5B6875] font-mono">
            #{realId}
          </span>
        </div>
      </div>
    </div>
  )
}
