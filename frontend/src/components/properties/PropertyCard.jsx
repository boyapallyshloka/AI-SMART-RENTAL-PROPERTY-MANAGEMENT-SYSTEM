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
} from 'lucide-react'

/**
 * Enterprise PropertyCard Component for HomeSphere
 * Displays key details of a rental property for tenant browsing.
 *
 * @param {Object} props
 * @param {Object} props.property
 * @param {Function} [props.onSelect]
 * @param {boolean} [props.isFavorite]
 * @param {Function} [props.onToggleFavorite]
 */
export default function PropertyCard({
  property,
  onSelect,
  isFavorite: controlledFavorite,
  onToggleFavorite,
}) {
  const [internalFavorite, setInternalFavorite] = useState(false)
  const isFav = controlledFavorite !== undefined ? controlledFavorite : internalFavorite

  const {
    id,
    name,
    propertyType,
    city,
    location,
    monthlyRent,
    bedrooms,
    bathrooms,
    area,
    furnishing,
    parking,
    availabilityStatus,
    imageUrl,
    aiMatchScore,
  } = property

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    if (onToggleFavorite) {
      onToggleFavorite(id)
    } else {
      setInternalFavorite(!internalFavorite)
    }
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(property)
    }
  }

  // Format currency
  const formattedRent = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(monthlyRent)

  const isAvailableNow = availabilityStatus === 'Available Now'

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col overflow-hidden rounded-lg border border-[#D9E0E6] bg-white shadow-2xs hover:shadow-sm hover:border-[#315A7D]/40 transition-all cursor-pointer"
    >
      {/* Property Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAF2F7]">
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
          }}
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
          {/* Availability Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-xs ${
              isAvailableNow
                ? 'bg-white text-[#2A583B] border border-[#C6DEC8] shadow-2xs'
                : 'bg-white text-[#8A5B16] border border-[#F4E2B6] shadow-2xs'
            }`}
          >
            {isAvailableNow ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7D58]" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-[#B7791F]" />
            )}
            <span>{availabilityStatus}</span>
          </div>

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
            {propertyType}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        {/* Rent & Price */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-[#315A7D]">
              {formattedRent}
            </span>
            <span className="text-xs text-[#5B6875] font-medium">/ month</span>
          </div>
          {property.deposit && (
            <span className="text-[11px] text-[#5B6875] bg-[#F7F8FA] border border-[#D9E0E6] px-2 py-0.5 rounded-md">
              Dep: ${property.deposit.toLocaleString()}
            </span>
          )}
        </div>

        {/* Title and Location */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-[#243447] line-clamp-1 group-hover:text-[#315A7D] transition-colors">
            {name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-[#5B6875] mt-0.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
            <span>{location || city}</span>
          </p>
        </div>

        {/* Key Features Grid (Beds, Baths, Sqft) */}
        <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-[#D9E0E6] text-xs text-[#5B6875]">
          <div className="flex items-center gap-1.5 justify-center bg-[#F7F8FA] py-1.5 px-2 rounded-md">
            <Bed className="w-3.5 h-3.5 text-[#5B6875]" />
            <span className="font-medium text-[#243447]">
              {bedrooms === 0 ? 'Studio' : `${bedrooms} Beds`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 justify-center bg-[#F7F8FA] py-1.5 px-2 rounded-md">
            <Bath className="w-3.5 h-3.5 text-[#5B6875]" />
            <span className="font-medium text-[#243447]">{bathrooms} Baths</span>
          </div>

          <div className="flex items-center gap-1.5 justify-center bg-[#F7F8FA] py-1.5 px-2 rounded-md">
            <Maximize2 className="w-3.5 h-3.5 text-[#5B6875]" />
            <span className="font-medium text-[#243447]">{area} sqft</span>
          </div>
        </div>

        {/* Secondary Details & Visually Secondary AI Match Score */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5B6875]">
            {furnishing && (
              <span className="inline-flex items-center gap-1 bg-[#F7F8FA] border border-[#D9E0E6] px-2 py-0.5 rounded">
                <Sofa className="w-3 h-3 text-[#5B6875]" />
                {furnishing}
              </span>
            )}
            {parking && (
              <span className="inline-flex items-center gap-1 bg-[#F7F8FA] border border-[#D9E0E6] px-2 py-0.5 rounded">
                <Car className="w-3 h-3 text-[#5B6875]" />
                {parking}
              </span>
            )}
          </div>

          {/* Secondary AI Match Score: discreet, non-dominating badge */}
          {aiMatchScore !== undefined && (
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
            {id}
          </span>
        </div>
      </div>
    </div>
  )
}
