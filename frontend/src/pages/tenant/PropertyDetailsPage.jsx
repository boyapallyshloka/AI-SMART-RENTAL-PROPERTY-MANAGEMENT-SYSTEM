import React, { useState } from 'react'
import PropertyDetailsSection from '../../components/properties/PropertyDetailsSection'
import PropertyCard from '../../components/properties/PropertyCard'
import {
  mockProperties,
  getPropertyById,
} from '../../utils/propertyMockData'
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Send,
  X,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
} from 'lucide-react'

/**
 * PropertyDetailsPage
 * Displays full property details, photo gallery, AI match analysis, and interactive Apply Now flow.
 *
 * @param {Object} props
 * @param {Object} [props.property] - Selected property object
 * @param {string} [props.propertyId] - Property ID if object not passed directly
 * @param {Function} [props.onBack] - Callback to return to search results
 * @param {Function} [props.onSelectSimilar] - Callback when clicking a similar property
 */
export default function PropertyDetailsPage({
  property: propFromProps,
  propertyId,
  onBack,
  onSelectSimilar,
}) {
  // Resolve property from props or fallback to ID or first mock property
  const activeProperty =
    propFromProps || (propertyId ? getPropertyById(propertyId) : mockProperties[0])

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Interactive Modals State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [isTourModalOpen, setIsTourModalOpen] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [tourSubmitted, setTourSubmitted] = useState(false)

  // Application Form State
  const [appForm, setAppForm] = useState({
    fullName: 'Elena Vance',
    email: 'elena.vance@example.com',
    phone: '+1 (555) 234-5678',
    moveInDate: '2026-10-01',
    leaseTerm: '12 Months',
    monthlyIncome: '8500',
    hasPets: 'no',
    notes: 'Interested in moving in as soon as possible. Excellent credit score and references available.',
  })

  // Tour Form State
  const [tourForm, setTourForm] = useState({
    tourType: 'in-person', // 'in-person' | 'virtual'
    preferredDate: '2026-09-10',
    preferredTime: '11:00 AM',
  })

  const {
    id,
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
    availabilityStatus,
    imageUrl,
    images = [imageUrl],
    aiMatchScore,
  } = activeProperty

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
    setTimeout(() => {
      // Auto close after 3 seconds or keep visible
    }, 2000)
  }

  const handleTourSubmit = (e) => {
    e.preventDefault()
    setTourSubmitted(true)
  }

  // Find similar recommended properties (excluding current)
  const similarProperties = mockProperties
    .filter((p) => p.id !== id)
    .slice(0, 3)

  return (
    <div className="min-h-screen space-y-6 pb-20">
      {/* 1. Navigation Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : window.history.back())}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Properties</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium transition-colors ${
              isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* 2. Property Header & Location */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{aiMatchScore}% Smart Tenant Match</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
              {propertyType}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                availabilityStatus === 'Available Now'
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
              }`}
            >
              {availabilityStatus}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {name}
        </h1>

        <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{address || location || city}</span>
        </p>
      </div>

      {/* 3. Image Gallery */}
      <div className="space-y-3">
        {/* Main Display Image */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 shadow-md">
          <img
            src={images[activeImageIndex] || imageUrl}
            alt={`${name} preview`}
            className="h-full w-full object-cover transition-all duration-300"
          />
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium">
            Photo {activeImageIndex + 1} of {images.length}
          </div>
        </div>

        {/* Thumbnails Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                activeImageIndex === idx
                  ? 'border-indigo-600 ring-2 ring-indigo-600/30'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Two-Column Layout (Details + Sticky Booking Action Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Left Column: Full Specifications & AI Insights */}
        <div className="lg:col-span-8 space-y-8">
          <PropertyDetailsSection property={activeProperty} />
        </div>

        {/* Right Column: Sticky Booking & Apply Now Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
            {/* Pricing headline */}
            <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    ${monthlyRent.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                    / month
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  Verified Rent
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Security Deposit: <strong>${deposit.toLocaleString()}</strong> (Due upon signing)
              </p>
            </div>

            {/* Quick Highlights list */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Availability</span>
                <span className="font-semibold text-slate-900 dark:text-white">{availabilityStatus}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Square Footage</span>
                <span className="font-semibold text-slate-900 dark:text-white">{area} sq ft</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Layout</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {bedrooms === 0 ? 'Studio' : `${bedrooms} Beds`} / {bathrooms} Baths
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Application Status</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Accepting Applicants</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* PRIMARY APPLY NOW BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setApplicationSubmitted(false)
                  setIsApplyModalOpen(true)
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Apply Now for Unit</span>
              </button>

              {/* SCHEDULE A TOUR BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setTourSubmitted(false)
                  setIsTourModalOpen(true)
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all"
              >
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Schedule a Tour</span>
              </button>
            </div>

            {/* Tenant Guarantee Badge */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>HomeSphere Tenant Protection:</strong> Direct digital lease signing, zero hidden fees, and transparent deposit escrow.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recommended Similar Properties */}
      <div className="pt-12 border-t border-slate-100 dark:border-slate-800 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Similar High AI Match Properties</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Other curated rentals matching your profile and budget
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarProperties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              onSelect={() => {
                if (onSelectSimilar) {
                  onSelectSimilar(p)
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL: Apply Now Interactive Rental Application Modal */}
      {/* ========================================================================= */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  HomeSphere Digital Lease Application
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Apply for {name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {address || location} &bull; Rent: <strong>${monthlyRent}/mo</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSubmitted ? (
              /* Success State */
              <div className="py-8 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Application Submitted Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Thank you, <strong>{appForm.fullName}</strong>. Your rental application and tenant profile have been forwarded to {activeProperty.landlord?.name || 'the landlord'}.
                  You will receive an update in the HomeSphere portal within 24 hours.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto space-y-1">
                  <p><strong>Application Ref:</strong> APP-2026-{id.replace('prop-', '')}92</p>
                  <p><strong>Proposed Move-in:</strong> {appForm.moveInDate}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
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
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-500" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={appForm.fullName}
                      onChange={(e) => setAppForm({ ...appForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={appForm.email}
                      onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={appForm.phone}
                      onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Move-in Date */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Desired Move-in Date
                    </label>
                    <input
                      type="date"
                      required
                      value={appForm.moveInDate}
                      onChange={(e) => setAppForm({ ...appForm, moveInDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Lease Duration */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Lease Duration
                    </label>
                    <select
                      value={appForm.leaseTerm}
                      onChange={(e) => setAppForm({ ...appForm, leaseTerm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option>12 Months</option>
                      <option>18 Months</option>
                      <option>24 Months</option>
                      <option>Flexible / Month-to-Month</option>
                    </select>
                  </div>

                  {/* Monthly Income */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Estimated Monthly Income ($)
                    </label>
                    <input
                      type="number"
                      value={appForm.monthlyIncome}
                      onChange={(e) => setAppForm({ ...appForm, monthlyIncome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Applicant Notes (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={appForm.notes}
                    onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Submit button bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">
                    Application fee: $45 (waived for HomeSphere verified members)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
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
      {/* 7. MODAL: Schedule a Tour Modal */}
      {/* ========================================================================= */}
      {isTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Schedule a Tour
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTourModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {tourSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Tour Booked!
                </h4>
                <p className="text-xs text-slate-500">
                  Your {tourForm.tourType} tour request has been sent for{' '}
                  <strong>{tourForm.preferredDate} at {tourForm.preferredTime}</strong>.
                  Check your calendar invite shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setIsTourModalOpen(false)}
                  className="mt-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleTourSubmit} className="space-y-4 text-xs">
                {/* Tour Type */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tour Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTourForm({ ...tourForm, tourType: 'in-person' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        tourForm.tourType === 'in-person'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      In-Person Tour
                    </button>
                    <button
                      type="button"
                      onClick={() => setTourForm({ ...tourForm, tourType: 'virtual' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        tourForm.tourType === 'virtual'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      Virtual 3D Tour
                    </button>
                  </div>
                </div>

                {/* Preferred Date */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tourForm.preferredDate}
                    onChange={(e) => setTourForm({ ...tourForm, preferredDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Preferred Time */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Preferred Time
                  </label>
                  <select
                    value={tourForm.preferredTime}
                    onChange={(e) => setTourForm({ ...tourForm, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
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
  )
}
