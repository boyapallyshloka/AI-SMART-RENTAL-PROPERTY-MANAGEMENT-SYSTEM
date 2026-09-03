import React from 'react'
import {
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Car,
  Sofa,
  Clock,
  Building,
  Wifi,
  Waves,
  Dumbbell,
  Dog,
  Zap,
  Key,
  Flame,
  Coffee,
  Info,
  BadgeCheck,
  FileCheck,
} from 'lucide-react'

// Helper to map amenity names to Lucide icons
function getAmenityIcon(amenity = '') {
  const lower = amenity.toLowerCase()
  if (lower.includes('wifi') || lower.includes('internet')) {
    return <Wifi className="w-4 h-4 text-indigo-500" />
  }
  if (lower.includes('pool')) {
    return <Waves className="w-4 h-4 text-cyan-500" />
  }
  if (lower.includes('fitness') || lower.includes('gym')) {
    return <Dumbbell className="w-4 h-4 text-amber-500" />
  }
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) {
    return <Dog className="w-4 h-4 text-emerald-500" />
  }
  if (lower.includes('ev') || lower.includes('charging') || lower.includes('solar')) {
    return <Zap className="w-4 h-4 text-yellow-500" />
  }
  if (lower.includes('smart') || lower.includes('keyless') || lower.includes('lock')) {
    return <Key className="w-4 h-4 text-purple-500" />
  }
  if (lower.includes('bbq') || lower.includes('fire') || lower.includes('grill')) {
    return <Flame className="w-4 h-4 text-rose-500" />
  }
  if (lower.includes('lounge') || lower.includes('coworking')) {
    return <Coffee className="w-4 h-4 text-amber-600" />
  }
  return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
}

/**
 * PropertyDetailsSection Component
 * Renders structured property details including AI insights, specs, amenities, description, and fee breakdowns.
 *
 * @param {Object} props
 * @param {Object} props.property
 */
export default function PropertyDetailsSection({ property }) {
  if (!property) return null

  const {
    name,
    propertyType,
    city,
    location,
    address,
    monthlyRent,
    deposit,
    bedrooms,
    bathrooms,
    area,
    furnishing,
    parking,
    amenities = [],
    availabilityStatus,
    aiMatchScore = 95,
    aiMatchReasons = [],
    description,
    petPolicy,
    leaseTerms,
    yearBuilt,
    utilitiesIncluded = [],
    landlord,
  } = property

  return (
    <div className="space-y-8">
      {/* 1. HomeSphere AI Match Insights Box */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  HomeSphere AI Smart Match
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {aiMatchScore}% Score
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated based on your tenant profile, budget range, and commute preferences.
              </p>
            </div>
          </div>
        </div>

        {/* AI Match Highlights Bullet Points */}
        <div className="mt-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
            Why our AI recommends this property for you:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {aiMatchReasons.length > 0 ? (
              aiMatchReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-indigo-50 dark:border-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/60 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Prime location matching your preferred neighborhood.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Property Specifications Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Property Overview & Specs
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-indigo-500" /> Bedrooms
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {bedrooms === 0 ? 'Studio' : `${bedrooms} Bedrooms`}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-indigo-500" /> Bathrooms
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {bathrooms} Bathrooms
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-indigo-500" /> Area
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {area} sq ft
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-500" /> Property Type
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
              {propertyType}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sofa className="w-4 h-4 text-indigo-500" /> Furnishing
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {furnishing || 'Unfurnished'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-indigo-500" /> Parking
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {parking || 'None'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" /> Availability
            </span>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {availabilityStatus}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-500" /> Lease Terms
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {leaseTerms || '12 Months'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Description Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          About This Property
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Pet Policy & Year Built Sub-badges */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs">
          {petPolicy && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Dog className="w-4 h-4 text-indigo-500" />
              <span>
                <strong>Pet Policy:</strong> {petPolicy}
              </span>
            </div>
          )}
          {yearBuilt && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Building className="w-4 h-4 text-indigo-500" />
              <span>
                <strong>Year Built / Renovated:</strong> {yearBuilt}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Amenities & Features Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Amenities & Inclusions
          </h3>
          <span className="text-xs text-slate-500">
            {amenities.length} Verified Features
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {amenities.map((amenity, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-slate-200 font-medium"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-2xs">
                {getAmenityIcon(amenity)}
              </div>
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Costs & Utilities Breakdown */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <span>Pricing & Monthly Expenses</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rent & Deposit breakdown */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Monthly Base Rent</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                ${monthlyRent.toLocaleString()} / mo
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Security Deposit</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ${(deposit || monthlyRent).toLocaleString()} (Refundable)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Application Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">$45 (One-time)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Online Rent Payment Fee</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">$0 via HomeSphere AutoPay</span>
            </div>
          </div>

          {/* Included Utilities */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Utilities Included with Rent:
            </span>
            {utilitiesIncluded.length > 0 ? (
              <div className="space-y-1.5">
                {utilitiesIncluded.map((util, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{util}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Tenant pays standard utilities (electricity, water, internet).</p>
            )}
            <p className="text-[11px] text-slate-400 pt-2">
              * Average monthly electric/gas bill for this unit is ~$75 based on building history.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Property Management / Landlord Information */}
      {landlord && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                {landlord.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {landlord.name}
                  </h4>
                  {landlord.verified && (
                    <BadgeCheck className="w-4 h-4 text-indigo-500" title="Verified Landlord" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manager: {landlord.manager} &bull; Rating: {landlord.rating} / 5.0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Avg Response: <strong>{landlord.responseTime}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
