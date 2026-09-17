import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import PropertyDetailsSection from '../../components/properties/PropertyDetailsSection'
import { getPropertyDetails, resolveImageUrl } from '../../api/propertyApi'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowLeft,
  MapPin,
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Send,
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Building2,
  ShieldAlert,
  Building,
  Check,
} from 'lucide-react'

export default function PropertyDetailsPage({
  property: propFromProps,
  propertyId: propPropertyId,
  onBack,
  onSelectSimilar,
}) {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Target property ID from route param or props
  const activeId = propPropertyId || routeId || propFromProps?.propertyId || propFromProps?.id

  // State
  const [details, setDetails] = useState(
    propFromProps && (propFromProps.buildings || propFromProps.property)
      ? {
          property: propFromProps.property || propFromProps,
          address: propFromProps.address || null,
          images: Array.isArray(propFromProps.images) ? propFromProps.images : [],
          amenities: Array.isArray(propFromProps.amenities) ? propFromProps.amenities : [],
          buildings: Array.isArray(propFromProps.buildings) ? propFromProps.buildings : [],
        }
      : null
  )
  const [isLoading, setIsLoading] = useState(!details && Boolean(activeId))
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Interactive Modals State (pre-existing from template)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [isTourModalOpen, setIsTourModalOpen] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [tourSubmitted, setTourSubmitted] = useState(false)

  // Application Form State (pre-existing)
  const [appForm, setAppForm] = useState({
    fullName: user?.name || user?.username || 'Tenant Applicant',
    email: user?.email || '',
    phone: user?.phone || '',
    moveInDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    leaseTerm: '12 Months',
    monthlyIncome: '',
    hasPets: 'no',
    notes: '',
  })

  // Tour Form State (pre-existing)
  const [tourForm, setTourForm] = useState({
    tourType: 'in-person', // 'in-person' | 'virtual'
    preferredDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    preferredTime: '11:00 AM',
  })

  // Fetch real property details from backend
  const loadDetails = useCallback(async () => {
    if (!activeId) {
      if (!propFromProps) {
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getPropertyDetails(activeId)
      if (data && data.property) {
        setDetails({
          property: data.property,
          address: data.address || null,
          images: Array.isArray(data.images) ? data.images : [],
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          buildings: Array.isArray(data.buildings) ? data.buildings : [],
        })
      } else {
        throw { status: 404, isNotFound: true, message: 'Property not found.' }
      }
    } catch (err) {
      console.error('Failed to load property details:', err)
      setError({
        status: err?.status,
        message: err?.message || 'Failed to load property details. Please try again.',
        isNotFound: err?.isNotFound || err?.status === 404,
        isForbidden: err?.isForbidden || err?.status === 403,
        isAuthError: err?.isAuthError || err?.status === 401,
        isNetworkError: err?.isNetworkError,
      })
    } finally {
      setIsLoading(false)
    }
  }, [activeId, propFromProps])

  useEffect(() => {
    setActiveImageIndex(0)
    loadDetails()
  }, [loadDetails, activeId])

  // Real image list resolved via resolveImageUrl
  const imageList = useMemo(() => {
    const raw = details?.images || []
    if (raw.length === 0) return []
    // Prioritize primary images first
    const sorted = [...raw].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    return sorted
      .map((img) => resolveImageUrl(typeof img === 'string' ? img : img.imageUrl))
      .filter(Boolean)
  }, [details])

  // Formatted address line
  const formattedAddress = useMemo(() => {
    const addr = details?.address
    if (!addr) return null
    const parts = [addr.addressLine1, addr.addressLine2, addr.area, addr.city, addr.state, addr.pincode].filter(
      Boolean
    )
    return parts.length > 0 ? parts.join(', ') : null
  }, [details])

  // Navigation handlers
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/tenant/properties')
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleApplySubmit = (e) => {
    e.preventDefault()
    setApplicationSubmitted(true)
  }

  const handleTourSubmit = (e) => {
    e.preventDefault()
    setTourSubmitted(true)
  }

  // Helper for Status Badge Styling
  const getPropertyStatusBadge = (status) => {
    const norm = String(status || '').toUpperCase()
    if (norm === 'ACTIVE' || norm === 'AVAILABLE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EDF7EE] text-[#2A583B] border border-[#C6DEC8]">
          <Check className="w-3 h-3" />
          {norm === 'AVAILABLE' ? 'Available' : 'Active'}
        </span>
      )
    }
    if (norm === 'UNDER_MAINTENANCE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]">
          Under Maintenance
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F7F8FA] text-[#5B6875] border border-[#D9E0E6]">
        {status || 'Unknown'}
      </span>
    )
  }

  // ---------------------------------------------------------------------------
  // RENDER: Loading Skeleton State
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <DashboardLayout defaultRole="tenant" activeItem="find-properties" pageTitle="Property Details">
        <div className="min-h-screen space-y-6 pb-20 animate-pulse">
          {/* Top Bar Skeleton */}
          <div className="flex items-center justify-between py-2 border-b border-[#D9E0E6]">
            <div className="h-6 w-36 bg-[#EAF2F7] rounded-md" />
            <div className="flex gap-2">
              <div className="h-7 w-20 bg-[#EAF2F7] rounded-md" />
              <div className="h-7 w-20 bg-[#EAF2F7] rounded-md" />
            </div>
          </div>

          {/* Header Skeleton */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-24 bg-[#EAF2F7] rounded-md" />
              <div className="h-5 w-20 bg-[#EAF2F7] rounded-md" />
            </div>
            <div className="h-8 w-72 bg-[#EAF2F7] rounded-md" />
            <div className="h-4 w-96 bg-[#EAF2F7] rounded-md" />
          </div>

          {/* Gallery Skeleton */}
          <div className="aspect-[16/9] md:aspect-[21/9] w-full rounded-lg bg-[#EAF2F7] border border-[#D9E0E6]" />

          {/* Two-Column Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-48 rounded-lg bg-[#EAF2F7] border border-[#D9E0E6]" />
              <div className="h-32 rounded-lg bg-[#EAF2F7] border border-[#D9E0E6]" />
              <div className="h-64 rounded-lg bg-[#EAF2F7] border border-[#D9E0E6]" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-80 rounded-lg bg-[#EAF2F7] border border-[#D9E0E6]" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ---------------------------------------------------------------------------
  // RENDER: Error States (404, 403 Forbidden, General / Network)
  // ---------------------------------------------------------------------------
  if (error) {
    const is403 = error.isForbidden || error.status === 403
    const is404 = error.isNotFound || error.status === 404

    return (
      <DashboardLayout defaultRole="tenant" activeItem="find-properties" pageTitle="Property Details">
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
          {is403 ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF7EC] text-[#8A5B16] border border-[#F4E2B6] mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
          ) : is404 ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6] mb-4">
              <Building2 className="h-8 w-8" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FDF2F2] text-[#E02424] border border-[#F8B4B4] mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
          )}

          <h2 className="text-xl font-bold text-[#243447]">
            {is403
              ? 'Access Restricted (403 Forbidden)'
              : is404
              ? 'Property Not Found (404)'
              : 'Failed to Load Property Details'}
          </h2>

          <p className="text-sm text-[#5B6875] mt-2 leading-relaxed">
            {is403
              ? "You do not currently have permission to access this property's full details. Please ensure you are logged in with the appropriate tenant account or try again."
              : is404
              ? 'The rental property you requested does not exist or may have been removed by its owner.'
              : error.message || 'An unexpected error occurred while communicating with the server.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#D9E0E6] bg-white px-4 py-2 text-xs font-semibold text-[#243447] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#5B6875]" />
              <span>Back to Properties</span>
            </button>

            {/* Try Again button for recoverable errors */}
            <button
              type="button"
              onClick={loadDetails}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#315A7D] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#274B68] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ---------------------------------------------------------------------------
  // RENDER: Empty State (No property ID provided)
  // ---------------------------------------------------------------------------
  if (!details || !details.property) {
    return (
      <DashboardLayout defaultRole="tenant" activeItem="find-properties" pageTitle="Property Details">
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6] mb-3">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-[#243447]">No Property Selected</h2>
          <p className="text-sm text-[#5B6875] mt-1">
            Please browse the available properties to view full floor plans, unit pricing, and verified amenities.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-[#315A7D] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#274B68] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse Properties</span>
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const { property, address, amenities, buildings } = details

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="find-properties"
      pageTitle={property.propertyName || 'Property Details'}
    >
      <div className="min-h-screen space-y-6 pb-20">
        {/* 1. Navigation Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-[#D9E0E6]">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#243447] hover:text-[#315A7D] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#315A7D]" />
            <span>Back to All Properties</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D9E0E6] bg-white text-xs font-medium text-[#243447] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#5B6875]" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D9E0E6] bg-white text-xs font-medium transition-colors cursor-pointer ${
                isFavorite ? 'text-[#B94A48]' : 'text-[#243447]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#B94A48] text-[#B94A48]' : 'text-[#5B6875]'}`} />
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* 2. Property Header & Location */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#EAF2F7] text-[#315A7D] border border-[#315A7D]/20 uppercase tracking-wider">
                {property.propertyType || 'Residential'}
              </span>
              {getPropertyStatusBadge(property.status)}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#243447]">
            {property.propertyName}
          </h1>

          <p className="flex items-center gap-1.5 text-sm text-[#5B6875]">
            <MapPin className="w-4 h-4 text-[#315A7D] shrink-0" />
            <span>{formattedAddress || 'Address details in specs below'}</span>
          </p>
        </div>

        {/* 3. Image Gallery */}
        <div className="space-y-3">
          {imageList.length > 0 ? (
            <>
              {/* Main Display Image */}
              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-lg bg-[#EAF2F7] border border-[#D9E0E6] shadow-2xs">
                <img
                  src={imageList[activeImageIndex] || imageList[0]}
                  alt={`${property.propertyName} preview`}
                  className="h-full w-full object-cover transition-all duration-300"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
                  }}
                />
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md bg-[#243447]/80 text-white text-xs font-medium backdrop-blur-xs">
                  Photo {activeImageIndex + 1} of {imageList.length}
                </div>
              </div>

              {/* Thumbnails Row (if more than 1 image) */}
              {imageList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {imageList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#315A7D] ring-2 ring-[#315A7D]/30'
                          : 'border-[#D9E0E6] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Clean placeholder when no images are uploaded */
            <div className="aspect-[16/9] md:aspect-[21/9] w-full rounded-lg bg-[#F7F8FA] border-2 border-dashed border-[#D9E0E6] flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="p-4 rounded-full bg-[#EAF2F7] text-[#315A7D]">
                <Building className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-[#243447]">No Photos Uploaded Yet</p>
              <p className="text-xs text-[#5B6875] max-w-sm">
                Floor plans, unit specifications, and building details for {property.propertyName} are listed in full below.
              </p>
            </div>
          )}
        </div>

        {/* 4. Main Two-Column Layout (Details + Sticky Booking Action Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          {/* Left Column: Full Specifications, Real Address, Real Amenities, Buildings -> Floors -> Units Hierarchy */}
          <div className="lg:col-span-8 space-y-8">
            <PropertyDetailsSection
              property={property}
              address={address}
              amenities={amenities}
              buildings={buildings}
              onSelectUnit={(unit) => {
                const propId = property.propertyId || activeId
                const unitId = unit.unitId || unit.id
                navigate(`/tenant/applications/new?propertyId=${propId}&unitId=${unitId}`)
              }}
            />
          </div>

          {/* Right Column: Sticky Inquiries / Action Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
            <div className="rounded-lg border border-[#D9E0E6] bg-white p-6 shadow-2xs space-y-5">
              {/* Header */}
              <div className="space-y-1 pb-4 border-b border-[#D9E0E6]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#315A7D] uppercase tracking-wide">
                    Property Overview
                  </span>
                  {getPropertyStatusBadge(property.status)}
                </div>
                <h3 className="text-lg font-bold text-[#243447] pt-1">
                  {property.propertyName}
                </h3>
                <p className="text-xs text-[#5B6875]">
                  Unit-level pricing, layouts, and availability are listed under Buildings & Units below.
                </p>
              </div>

              {/* Real Property Highlights list */}
              <div className="space-y-2 text-xs text-[#5B6875]">
                {property.propertyType && (
                  <div className="flex items-center justify-between py-1">
                    <span>Property Type</span>
                    <span className="font-semibold text-[#243447] capitalize">
                      {String(property.propertyType).replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                )}

                {property.totalArea != null && (
                  <div className="flex items-center justify-between py-1">
                    <span>Total Area</span>
                    <span className="font-semibold text-[#243447]">
                      {property.totalArea.toLocaleString('en-IN')} sq ft
                    </span>
                  </div>
                )}

                {property.furnishingStatus && (
                  <div className="flex items-center justify-between py-1">
                    <span>Furnishing</span>
                    <span className="font-semibold text-[#243447] capitalize">
                      {String(property.furnishingStatus).replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                )}

                {property.parkingAvailable != null && (
                  <div className="flex items-center justify-between py-1">
                    <span>Parking</span>
                    <span className="font-semibold text-[#243447]">
                      {property.parkingAvailable ? 'Available on premise' : 'No dedicated parking'}
                    </span>
                  </div>
                )}

                {property.yearBuilt != null && (
                  <div className="flex items-center justify-between py-1">
                    <span>Year Built</span>
                    <span className="font-semibold text-[#243447]">{property.yearBuilt}</span>
                  </div>
                )}

                {property.ownerName && (
                  <div className="flex items-center justify-between py-1">
                    <span>Property Manager</span>
                    <span className="font-semibold text-[#243447]">{property.ownerName}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons (pre-existing) */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const propId = property.propertyId || activeId
                    navigate(`/tenant/applications/new?propertyId=${propId}`)
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#315A7D] hover:bg-[#274B68] px-5 py-3 text-sm font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply for Property</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTourSubmitted(false)
                    setIsTourModalOpen(true)
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] hover:bg-[#EAF2F7] px-5 py-3 text-sm font-semibold text-[#243447] transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#315A7D]" />
                  <span>Schedule a Tour</span>
                </button>
              </div>

              {/* Tenant Guarantee Badge */}
              <div className="rounded-md bg-[#F7F8FA] border border-[#D9E0E6] p-3 flex items-start gap-2.5 text-[11px] text-[#5B6875]">
                <ShieldCheck className="w-4 h-4 text-[#3F7D58] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#243447]">HomeSphere Tenant Protection:</strong> Direct digital lease signing, verified owner listings, and transparent security deposit terms.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. MODAL: Apply Interactive Rental Application Modal (pre-existing) */}
        {/* ========================================================================= */}
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl overflow-hidden rounded-lg bg-white border border-[#D9E0E6] shadow-xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#D9E0E6] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#315A7D] uppercase tracking-wider">
                    HomeSphere Digital Lease Application
                  </span>
                  <h3 className="text-xl font-bold text-[#243447] mt-1">
                    Apply for {property.propertyName}
                  </h3>
                  <p className="text-xs text-[#5B6875]">
                    {formattedAddress || 'Listing verified on HomeSphere'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-1.5 rounded-md text-[#5B6875] hover:text-[#243447] hover:bg-[#F7F8FA] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {applicationSubmitted ? (
                /* Success State */
                <div className="py-8 text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF7EE] text-[#3F7D58] mx-auto border border-[#C6DEC8]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-[#243447]">
                    Application Submitted Successfully!
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5B6875] max-w-md mx-auto">
                    Thank you, <strong className="text-[#243447]">{appForm.fullName}</strong>. Your rental application for{' '}
                    <strong className="text-[#243447]">{property.propertyName}</strong> has been recorded.
                    The property manager will review your submission shortly.
                  </p>
                  <div className="p-4 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-xs text-[#5B6875] max-w-sm mx-auto space-y-1">
                    <p>
                      <strong className="text-[#243447]">Application Ref:</strong> APP-{property.propertyId || 'PROP'}-
                      {Date.now().toString().slice(-4)}
                    </p>
                    <p>
                      <strong className="text-[#243447]">Proposed Move-in:</strong> {appForm.moveInDate}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="rounded-md bg-[#315A7D] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#274B68] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Application Form */
                <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#5B6875] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#315A7D]" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={appForm.fullName}
                        onChange={(e) => setAppForm({ ...appForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:bg-white focus:border-[#315A7D]"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#5B6875] flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#315A7D]" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={appForm.email}
                        onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:bg-white focus:border-[#315A7D]"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#5B6875] flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#315A7D]" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={appForm.phone}
                        onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:bg-white focus:border-[#315A7D]"
                      />
                    </div>

                    {/* Move-in Date */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#5B6875] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#315A7D]" /> Desired Move-in Date
                      </label>
                      <input
                        type="date"
                        required
                        value={appForm.moveInDate}
                        onChange={(e) => setAppForm({ ...appForm, moveInDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:bg-white focus:border-[#315A7D]"
                      />
                    </div>

                    {/* Lease Duration */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#5B6875]">Lease Duration</label>
                      <select
                        value={appForm.leaseTerm}
                        onChange={(e) => setAppForm({ ...appForm, leaseTerm: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:bg-white focus:border-[#315A7D]"
                      >
                        <option>12 Months</option>
                        <option>18 Months</option>
                        <option>24 Months</option>
                        <option>Flexible / Month-to-Month</option>
                      </select>
                    </div>

                    {/* Monthly Income */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#5B6875] flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#315A7D]" /> Monthly Income (₹)
                      </label>
                      <input
                        type="number"
                        value={appForm.monthlyIncome}
                        onChange={(e) => setAppForm({ ...appForm, monthlyIncome: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:bg-white focus:border-[#315A7D]"
                      />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#5B6875]">Applicant Notes (Optional)</label>
                    <textarea
                      rows="3"
                      value={appForm.notes}
                      onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })}
                      className="w-full p-2.5 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:bg-white focus:border-[#315A7D]"
                      placeholder="Mention references, preferred timings, or questions regarding the lease..."
                    />
                  </div>

                  {/* Submit button bar */}
                  <div className="pt-3 border-t border-[#D9E0E6] flex items-center justify-between">
                    <span className="text-[#5B6875] text-[11px]">
                      Application fee: Waived for HomeSphere verified members
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsApplyModalOpen(false)}
                        className="px-4 py-2 rounded-md border border-[#D9E0E6] text-[#5B6875] hover:bg-[#F7F8FA] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-md bg-[#315A7D] text-white font-semibold hover:bg-[#274B68] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit Application
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. MODAL: Schedule a Tour Modal (pre-existing) */}
        {/* ========================================================================= */}
        {isTourModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-white border border-[#D9E0E6] shadow-xl p-6 space-y-6">
              <div className="flex items-start justify-between border-b border-[#D9E0E6] pb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#243447]">Schedule a Tour</h3>
                  <p className="text-xs text-[#5B6875]">{property.propertyName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTourModalOpen(false)}
                  className="p-1 rounded-md text-[#5B6875] hover:text-[#243447] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {tourSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#3F7D58] mx-auto" />
                  <h4 className="font-bold text-base text-[#243447]">Tour Request Sent!</h4>
                  <p className="text-xs text-[#5B6875]">
                    Your {tourForm.tourType} tour request has been recorded for{' '}
                    <strong className="text-[#243447]">
                      {tourForm.preferredDate} at {tourForm.preferredTime}
                    </strong>
                    . The leasing office will confirm your appointment via email.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsTourModalOpen(false)}
                    className="mt-2 rounded-md bg-[#315A7D] px-5 py-2 text-xs font-bold text-white hover:bg-[#274B68] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTourSubmit} className="space-y-4 text-xs">
                  {/* Tour Type */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#5B6875]">Tour Format</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTourForm({ ...tourForm, tourType: 'in-person' })}
                        className={`py-2 px-3 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                          tourForm.tourType === 'in-person'
                            ? 'border-[#315A7D] bg-[#EAF2F7] text-[#315A7D] font-bold'
                            : 'border-[#D9E0E6] text-[#5B6875]'
                        }`}
                      >
                        In-Person Tour
                      </button>
                      <button
                        type="button"
                        onClick={() => setTourForm({ ...tourForm, tourType: 'virtual' })}
                        className={`py-2 px-3 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                          tourForm.tourType === 'virtual'
                            ? 'border-[#315A7D] bg-[#EAF2F7] text-[#315A7D] font-bold'
                            : 'border-[#D9E0E6] text-[#5B6875]'
                        }`}
                      >
                        Virtual Tour
                      </button>
                    </div>
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#5B6875]">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={tourForm.preferredDate}
                      onChange={(e) => setTourForm({ ...tourForm, preferredDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:bg-white focus:border-[#315A7D]"
                    />
                  </div>

                  {/* Preferred Time */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#5B6875]">Preferred Time</label>
                    <select
                      value={tourForm.preferredTime}
                      onChange={(e) => setTourForm({ ...tourForm, preferredTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-[#D9E0E6] bg-[#F7F8FA] text-[#243447] focus:bg-white focus:border-[#315A7D]"
                    >
                      <option>09:00 AM</option>
                      <option>11:00 AM</option>
                      <option>02:00 PM</option>
                      <option>04:30 PM</option>
                      <option>06:00 PM</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTourModalOpen(false)}
                      className="px-4 py-2 rounded-md border border-[#D9E0E6] text-[#5B6875] hover:bg-[#F7F8FA] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-md bg-[#315A7D] text-white font-semibold hover:bg-[#274B68] cursor-pointer"
                    >
                      Confirm Tour
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
