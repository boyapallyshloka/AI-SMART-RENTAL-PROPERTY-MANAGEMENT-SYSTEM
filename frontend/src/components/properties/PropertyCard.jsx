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
 * PropertyCard Component
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

  // AI Match Score Color coding
  const getAiBadgeStyle = (score) => {
    if (score >= 90) {
      return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20 shadow-sm'
    } else if (score >= 80) {
      return 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-indigo-500/20 shadow-sm'
    }
    return 'bg-slate-700 text-slate-100'
  }

  const isAvailableNow = availabilityStatus === 'Available Now'

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Property Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
          }}
        />

        {/* Gradient Overlay for badges contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {/* AI Match Score Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-md ${getAiBadgeStyle(
              aiMatchScore
            )}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{aiMatchScore}% AI Match</span>
          </div>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
            className="p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white transition-all shadow-sm active:scale-90"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFav ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>
        </div>

        {/* Bottom Badges on Image (Availability & Property Type) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md font-medium">
            <span className="capitalize">{propertyType}</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md font-medium ${
              isAvailableNow
                ? 'bg-emerald-600/90 text-white'
                : 'bg-amber-600/90 text-white'
            }`}
          >
            {isAvailableNow ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            <span>{availabilityStatus}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5 space-y-4">
        {/* Rent & Price */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formattedRent}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-medium">
              / month
            </span>
          </div>
          {property.deposit && (
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              Dep: ${property.deposit.toLocaleString()}
            </span>
          )}
        </div>

        {/* Title and Location */}
        <div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{location || city}</span>
          </p>
        </div>

        {/* Key Features Grid (Beds, Baths, Sqft) */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5 justify-center bg-slate-50 dark:bg-slate-800/50 py-1.5 px-2 rounded-lg">
            <Bed className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="font-medium">
              {bedrooms === 0 ? 'Studio' : `${bedrooms} Beds`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 justify-center bg-slate-50 dark:bg-slate-800/50 py-1.5 px-2 rounded-lg">
            <Bath className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="font-medium">{bathrooms} Baths</span>
          </div>

          <div className="flex items-center gap-1.5 justify-center bg-slate-50 dark:bg-slate-800/50 py-1.5 px-2 rounded-lg">
            <Maximize2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="font-medium">{area} sqft</span>
          </div>
        </div>

        {/* Secondary Perks (Furnishing & Parking) */}
        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          {furnishing && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              <Sofa className="w-3 h-3 text-slate-500" />
              {furnishing}
            </span>
          )}
          {parking && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              <Car className="w-3 h-3 text-slate-500" />
              {parking}
            </span>
          )}
        </div>

        {/* Card Footer / View Details */}
        <div className="pt-2 mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
            View Details
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>

          <span className="text-[11px] text-slate-400">
            ID: {id}
          </span>
        </div>
      </div>
    </div>
  )
}
