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
    return <Key className="w-4 h-4 text-[#315A7D]" />
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
      <div className="rounded-lg border border-[#D9E0E6] bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E0E6]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#315A7D] text-white shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#243447]">
                  HomeSphere AI Smart Match
                </h3>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EDF7EE] text-[#2A583B] border border-[#C6DEC8]">
                  {aiMatchScore}% Score
                </span>
              </div>
              <p className="text-xs text-[#5B6875]">
                Calculated based on your tenant profile, budget range, and commute preferences.
              </p>
            </div>
          </div>
        </div>

        {/* AI Match Highlights Bullet Points */}
        <div className="mt-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
            Why our AI recommends this property for you:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {aiMatchReasons.length > 0 ? (
              aiMatchReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-[#243447] bg-[#F7F8FA] p-2.5 rounded-md border border-[#D9E0E6]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#3F7D58] shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-2 text-xs text-[#243447] bg-[#F7F8FA] p-2.5 rounded-md border border-[#D9E0E6]">
                <CheckCircle2 className="w-4 h-4 text-[#3F7D58] shrink-0 mt-0.5" />
                <span>Prime location matching your preferred neighborhood.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Property Specifications Grid */}
      <div className="rounded-lg border border-[#D9E0E6] bg-white p-6 shadow-2xs">
        <h3 className="text-base font-bold text-[#243447] mb-4">
          Property Overview & Specs
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] space-y-1">
            <span className="text-xs text-[#5B6875] flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#315A7D]" /> Bedrooms
            </span>
            <p className="text-sm font-bold text-[#243447]">
              {bedrooms === 0 ? 'Studio' : `${bedrooms} Bedrooms`}
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] space-y-1">
            <span className="text-xs text-[#5B6875] flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-[#315A7D]" /> Bathrooms
            </span>
            <p className="text-sm font-bold text-[#243447]">
              {bathrooms} Bathrooms
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] space-y-1">
            <span className="text-xs text-[#5B6875] flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-[#315A7D]" /> Area
            </span>
            <p className="text-sm font-bold text-[#243447]">
              {area} sq ft
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] space-y-1">
            <span className="text-xs text-[#5B6875] flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#315A7D]" /> Property Type
            </span>
            <p className="text-sm font-bold text-[#243447] capitalize">
              {propertyType}
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] space-y-1">
            <span className="text-xs text-[#5B6875] flex items-center gap-1.5">
              <Sofa className="w-4 h-4 text-[#315A7D]" /> Furnishing
            </span>
            <p className="text-sm font-bold text-[#243447]">
              {furnishing || 'Unfurnished'}
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] space-y-1">
            <span className="text-xs text-[#5B6875] flex items-center gap-1.5">
              <Car className="w-4 h-4 text-[#315A7D]" /> Parking
            </span>
            <p className="text-sm font-bold text-[#243447]">
              {parking || 'None'}
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] space-y-1">
            <span className="text-xs text-[#5B6875] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#315A7D]" /> Availability
            </span>
            <p className="text-sm font-bold text-[#3F7D58]">
              {availabilityStatus}
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] space-y-1">
            <span className="text-xs text-[#5B6875] flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#315A7D]" /> Lease Terms
            </span>
            <p className="text-sm font-bold text-[#243447]">
              {leaseTerms || '12 Months'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Description Section */}
      <div className="rounded-lg border border-[#D9E0E6] bg-white p-6 shadow-2xs space-y-3">
        <h3 className="text-base font-bold text-[#243447]">
          About This Property
        </h3>
        <p className="text-sm text-[#5B6875] leading-relaxed">
          {description}
        </p>

        {/* Pet Policy & Year Built Sub-badges */}
        <div className="pt-3 border-t border-[#D9E0E6] flex flex-wrap gap-4 text-xs">
          {petPolicy && (
            <div className="flex items-center gap-1.5 text-[#5B6875]">
              <Dog className="w-4 h-4 text-[#315A7D]" />
              <span>
                <strong className="text-[#243447]">Pet Policy:</strong> {petPolicy}
              </span>
            </div>
          )}
          {yearBuilt && (
            <div className="flex items-center gap-1.5 text-[#5B6875]">
              <Building className="w-4 h-4 text-[#315A7D]" />
              <span>
                <strong className="text-[#243447]">Year Built / Renovated:</strong> {yearBuilt}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Amenities & Features Grid */}
      <div className="rounded-lg border border-[#D9E0E6] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#243447]">
            Amenities & Inclusions
          </h3>
          <span className="text-xs text-[#5B6875]">
            {amenities.length} Verified Features
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {amenities.map((amenity, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-xs text-[#243447] font-medium"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#315A7D] border border-[#D9E0E6] shadow-2xs">
                {getAmenityIcon(amenity)}
              </div>
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Costs & Utilities Breakdown */}
      <div className="rounded-lg border border-[#D9E0E6] bg-white p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-[#243447] flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#3F7D58]" />
          <span>Pricing & Monthly Expenses</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rent & Deposit breakdown */}
          <div className="space-y-2.5 p-4 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-xs">
            <div className="flex justify-between py-1 border-b border-[#D9E0E6]">
              <span className="text-[#5B6875]">Monthly Base Rent</span>
              <span className="font-bold text-[#315A7D] text-sm">
                ${monthlyRent.toLocaleString()} / mo
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#D9E0E6]">
              <span className="text-[#5B6875]">Security Deposit</span>
              <span className="font-semibold text-[#243447]">
                ${(deposit || monthlyRent).toLocaleString()} (Refundable)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#D9E0E6]">
              <span className="text-[#5B6875]">Application Fee</span>
              <span className="font-semibold text-[#243447]">$45 (One-time)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#5B6875]">Online Rent Payment Fee</span>
              <span className="font-bold text-[#3F7D58]">$0 via HomeSphere AutoPay</span>
            </div>
          </div>

          {/* Included Utilities */}
          <div className="p-4 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-xs space-y-2">
            <span className="font-semibold text-[#243447] block">
              Utilities Included with Rent:
            </span>
            {utilitiesIncluded.length > 0 ? (
              <div className="space-y-1.5">
                {utilitiesIncluded.map((util, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#5B6875]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7D58]" />
                    <span>{util}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#5B6875]">Tenant pays standard utilities (electricity, water, internet).</p>
            )}
            <p className="text-[11px] text-[#5B6875] pt-2">
              * Average monthly electric/gas bill for this unit is ~$75 based on building history.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Property Management / Landlord Information */}
      {landlord && (
        <div className="rounded-lg border border-[#D9E0E6] bg-white p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#EAF2F7] text-[#315A7D] font-bold text-lg border border-[#D9E0E6]">
                {landlord.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-[#243447]">
                    {landlord.name}
                  </h4>
                  {landlord.verified && (
                    <BadgeCheck className="w-4 h-4 text-[#315A7D]" title="Verified Landlord" />
                  )}
                </div>
                <p className="text-xs text-[#5B6875]">
                  Manager: {landlord.manager} &bull; Rating: {landlord.rating} / 5.0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#5B6875] bg-[#F7F8FA] border border-[#D9E0E6] px-3 py-1.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-[#315A7D]" />
              <span>Avg Response: <strong className="text-[#243447]">{landlord.responseTime}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
