import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getMockPropertyById } from '../../utils/ownerPropertyMockData'
import { StatusBadge, Button, EmptyState } from '../../components/ui'
import {
  ArrowLeft,
  Edit,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  Building2,
  Home,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Shield,
  FileText,
  Wrench,
} from 'lucide-react'

export default function PropertyDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const found = getMockPropertyById(id)
    setProperty(found)
  }, [id])

  if (!property) {
    return (
      <DashboardLayout
        defaultRole="owner"
        activeItem="properties"
        pageTitle="Property Details"
      >
        <div className="max-w-3xl mx-auto py-12">
          <EmptyState
            icon={<Building2 className="w-8 h-8" />}
            title="Property Not Found"
            message={`We could not locate any property record matching ID "${id}".`}
            action={
              <Link to="/owner/properties">
                <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Return to Properties List
                </Button>
              </Link>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

  const total = Number(property.totalUnits) || 1
  const occupied = Number(property.occupiedUnits) || 0
  const vacant = Math.max(0, total - occupied)
  const occupancyPct = Math.round((occupied / total) * 100)
  const images =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80']

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="properties"
      pageTitle={property.name}
    >
      <div className="space-y-8">
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5B6875]">
            <Link
              to="/owner/properties"
              className="inline-flex items-center gap-1 hover:text-[#315A7D] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Properties</span>
            </Link>
            <span>/</span>
            <span className="text-[#243447] font-semibold truncate max-w-[200px] sm:max-w-none">
              {property.name}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to={`/owner/properties/${property.id}/edit`}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Title & Quick Info Banner */}
        <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                  {property.type}
                </span>
                <StatusBadge status={property.status} size="sm" />
                <span className="text-xs text-[#5B6875] font-mono">
                  ID: {property.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                {property.name}
              </h1>
              <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#5B6875]">
                <MapPin className="w-4 h-4 text-[#5B6875] shrink-0" />
                <span>
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </span>
              </p>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-[#D9E0E6]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                Monthly Rent
              </p>
              <p className="text-3xl font-extrabold text-[#315A7D] tracking-tight">
                ${Number(property.monthlyRent || 0).toLocaleString()}
                <span className="text-xs text-[#5B6875] font-normal"> / mo</span>
              </p>
              {property.deposit > 0 && (
                <p className="text-xs text-[#5B6875] mt-0.5">
                  Deposit: ${Number(property.deposit).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Hero Gallery Grid */}
        <div className="bg-white rounded-2xl border border-[#D9E0E6] p-4 sm:p-6 shadow-sm space-y-3">
          <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-[21/9] max-h-[460px] bg-slate-900 border border-[#D9E0E6]">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={property.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/70 text-white text-xs backdrop-blur-md">
              Photo {selectedImageIndex + 1} of {images.length}
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-14 sm:w-28 sm:h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#315A7D] ring-2 ring-[#315A7D]/30 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Specs & Amenities & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unit Key Specs */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#243447] mb-4">
                Property Dimensions & Specs
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6875] mb-1">
                    <Bed className="w-3.5 h-3.5 text-[#315A7D]" />
                    <span>Bedrooms</span>
                  </div>
                  <p className="text-lg font-bold text-[#243447]">
                    {property.bedrooms} Beds
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6875] mb-1">
                    <Bath className="w-3.5 h-3.5 text-[#315A7D]" />
                    <span>Bathrooms</span>
                  </div>
                  <p className="text-lg font-bold text-[#243447]">
                    {property.bathrooms} Baths
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6875] mb-1">
                    <Maximize2 className="w-3.5 h-3.5 text-[#315A7D]" />
                    <span>Floor Area</span>
                  </div>
                  <p className="text-lg font-bold text-[#243447]">
                    {property.area} sq ft
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6875] mb-1">
                    <Home className="w-3.5 h-3.5 text-[#315A7D]" />
                    <span>Furnishing</span>
                  </div>
                  <p className="text-sm font-bold text-[#243447] truncate">
                    {property.furnishing}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#D9E0E6] flex items-center justify-between text-xs text-[#5B6875]">
                <span>Parking Accommodations:</span>
                <span className="font-semibold text-[#243447]">
                  {property.parking}
                </span>
              </div>
            </div>

            {/* Included Amenities */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B7791F]" />
                  Included Amenities & Facilities
                </h2>
                <span className="text-xs text-[#5B6875] font-semibold">
                  {property.amenities?.length || 0} features
                </span>
              </div>

              {property.amenities && property.amenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6] text-xs text-[#243447] font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#3F7D58] shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5B6875]">No amenities specified.</p>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm space-y-3">
              <h2 className="text-base font-semibold text-[#243447]">
                About this Property
              </h2>
              <p className="text-sm text-[#5B6875] leading-relaxed">
                {property.description ||
                  'No description provided for this property listing.'}
              </p>
            </div>
          </div>

          {/* Right Sidebar: Occupancy & Financials & Actions */}
          <div className="space-y-6">
            {/* Occupancy Card */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#315A7D]" />
                  Occupancy Metrics
                </h2>
                <span className="text-xs font-bold text-[#315A7D]">
                  {occupancyPct}%
                </span>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-[#F7F8FA] h-2.5 rounded-full overflow-hidden border border-[#D9E0E6]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      occupancyPct >= 90
                        ? 'bg-[#3F7D58]'
                        : occupancyPct >= 50
                        ? 'bg-[#315A7D]'
                        : 'bg-[#B7791F]'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                    <p className="text-xs text-[#5B6875]">Total</p>
                    <p className="text-sm font-bold text-[#243447]">
                      {total}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#EDF7EE] border border-[#C6DEC8]">
                    <p className="text-xs text-[#2A583B]">Occupied</p>
                    <p className="text-sm font-bold text-[#2A583B]">
                      {occupied}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FEF7EC] border border-[#F4E2B6]">
                    <p className="text-xs text-[#8A5B16]">Vacant</p>
                    <p className="text-sm font-bold text-[#8A5B16]">
                      {vacant}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview Card */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm space-y-3">
              <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#3F7D58]" />
                Financial Breakdown
              </h2>
              <div className="space-y-2 text-xs divide-y divide-[#D9E0E6]">
                <div className="flex justify-between pt-2">
                  <span className="text-[#5B6875]">Monthly Rent:</span>
                  <span className="font-semibold text-[#243447]">
                    ${Number(property.monthlyRent || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#5B6875]">Security Deposit:</span>
                  <span className="font-semibold text-[#243447]">
                    ${Number(property.deposit || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#5B6875]">Annual Gross Potential:</span>
                  <span className="font-bold text-[#3F7D58]">
                    ${(Number(property.monthlyRent || 0) * 12 * total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm space-y-3">
              <h2 className="text-base font-semibold text-[#243447]">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link to={`/owner/properties/${property.id}/edit`} className="block">
                  <Button variant="primary" className="w-full justify-start" leftIcon={<Edit className="w-4 h-4" />}>
                    Edit Listing Details
                  </Button>
                </Link>
                <Link to="/owner/agreements/new" className="block">
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    leftIcon={<FileText className="w-4 h-4" />}
                  >
                    Generate Tenant Agreement
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  leftIcon={<Wrench className="w-4 h-4" />}
                  onClick={() => alert('Maintenance dispatch placeholder')}
                >
                  Schedule Unit Inspection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
