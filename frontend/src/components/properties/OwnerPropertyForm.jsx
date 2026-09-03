import React, { useState } from 'react'
import {
  Button,
  Input,
  Select,
  Textarea,
} from '../ui'
import {
  PROPERTY_TYPES,
  FURNISHING_OPTIONS,
  PARKING_OPTIONS,
  STATUS_OPTIONS,
  AMENITIES_LIST,
} from '../../utils/ownerPropertyMockData'
import {
  Building2,
  DollarSign,
  Image as ImageIcon,
  Check,
  Plus,
  X,
  Sparkles,
} from 'lucide-react'

const SAMPLE_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
]

/**
 * OwnerPropertyForm Component
 * Supports creating and updating a property with validation and live image preview
 * @param {Object} props
 * @param {Object} [props.initialData]
 * @param {(data: Object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 * @param {boolean} [props.isLoading=false]
 * @param {string} [props.submitLabel='Save Property']
 */
export default function OwnerPropertyForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Property',
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'Apartment',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || 'CA',
    zipCode: initialData?.zipCode || '',
    bedrooms: initialData?.bedrooms !== undefined ? initialData.bedrooms : 2,
    bathrooms: initialData?.bathrooms !== undefined ? initialData.bathrooms : 2,
    area: initialData?.area || 1100,
    furnishing: initialData?.furnishing || 'Furnished',
    parking: initialData?.parking || 'Garage',
    monthlyRent: initialData?.monthlyRent || 2500,
    deposit: initialData?.deposit || 2500,
    totalUnits: initialData?.totalUnits || 1,
    occupiedUnits: initialData?.occupiedUnits || 0,
    status: initialData?.status || 'Available',
    description: initialData?.description || '',
    amenities: initialData?.amenities || [
      'In-unit Laundry',
      'Central AC',
      'High-speed Wi-Fi',
    ],
    imageUrl:
      (initialData?.images && initialData.images[0]) ||
      SAMPLE_IMAGE_PRESETS[0],
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity)
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      }
    })
  }

  const validate = () => {
    const errs = {}

    if (!formData.name.trim()) {
      errs.name = 'Property name is required'
    }

    if (!formData.address.trim()) {
      errs.address = 'Street address is required'
    }

    if (!formData.city.trim()) {
      errs.city = 'City is required'
    }

    if (!formData.monthlyRent || Number(formData.monthlyRent) <= 0) {
      errs.monthlyRent = 'Please enter a valid monthly rent amount'
    }

    if (Number(formData.bedrooms) < 0) {
      errs.bedrooms = 'Bedrooms cannot be negative'
    }

    if (Number(formData.bathrooms) <= 0) {
      errs.bathrooms = 'Bathrooms must be at least 0.5'
    }

    if (Number(formData.area) <= 0) {
      errs.area = 'Area must be greater than 0 sq ft'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      ...formData,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      area: Number(formData.area),
      monthlyRent: Number(formData.monthlyRent),
      deposit: Number(formData.deposit),
      totalUnits: Number(formData.totalUnits),
      occupiedUnits: Number(formData.occupiedUnits),
      images: [formData.imageUrl],
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* 1. Basic Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            General Property Information
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Basic identity and location details for your real estate listing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <Input
              label="Property Name"
              placeholder="e.g. Sunset Palms Residences"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              required
            />
          </div>

          <Select
            label="Property Type"
            options={PROPERTY_TYPES}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            required
          />

          <Select
            label="Availability Status"
            options={STATUS_OPTIONS}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            required
          />

          <div className="sm:col-span-2">
            <Input
              label="Street Address"
              placeholder="e.g. 420 Ocean Boulevard"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              error={errors.address}
              required
            />
          </div>

          <Input
            label="City"
            placeholder="e.g. Santa Monica"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            error={errors.city}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="State"
              placeholder="CA"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
            />
            <Input
              label="ZIP Code"
              placeholder="90401"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Specifications & Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Unit Specifications & Features
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dimensions, furnishing level, and parking accommodations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Input
            label="Bedrooms"
            type="number"
            min="0"
            step="1"
            value={formData.bedrooms}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
            error={errors.bedrooms}
            required
          />

          <Input
            label="Bathrooms"
            type="number"
            min="0.5"
            step="0.5"
            value={formData.bathrooms}
            onChange={(e) => handleChange('bathrooms', e.target.value)}
            error={errors.bathrooms}
            required
          />

          <Input
            label="Living Area (Sq Ft)"
            type="number"
            min="100"
            step="10"
            placeholder="1100"
            value={formData.area}
            onChange={(e) => handleChange('area', e.target.value)}
            error={errors.area}
            required
          />

          <Select
            label="Furnishing"
            options={FURNISHING_OPTIONS}
            value={formData.furnishing}
            onChange={(e) => handleChange('furnishing', e.target.value)}
          />

          <Select
            label="Parking Option"
            options={PARKING_OPTIONS}
            value={formData.parking}
            onChange={(e) => handleChange('parking', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Total Units"
              type="number"
              min="1"
              value={formData.totalUnits}
              onChange={(e) => handleChange('totalUnits', e.target.value)}
            />
            <Input
              label="Occupied"
              type="number"
              min="0"
              max={formData.totalUnits}
              value={formData.occupiedUnits}
              onChange={(e) => handleChange('occupiedUnits', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. Pricing & Financials */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Pricing & Deposits
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Base lease rate and required security deposit
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Monthly Rent ($ USD)"
            type="number"
            min="0"
            step="25"
            placeholder="2500"
            value={formData.monthlyRent}
            onChange={(e) => handleChange('monthlyRent', e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            error={errors.monthlyRent}
            required
          />

          <Input
            label="Security Deposit ($ USD)"
            type="number"
            min="0"
            step="25"
            placeholder="2500"
            value={formData.deposit}
            onChange={(e) => handleChange('deposit', e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            helperText="Standard recommendation: 1 month rent"
          />
        </div>
      </div>

      {/* 4. Amenities */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Property Amenities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select all convenience features and building facilities included
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {AMENITIES_LIST.map((amenity) => {
            const isSelected = formData.amenities.includes(amenity)
            return (
              <button
                type="button"
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span>{amenity}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Image & Description */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Media & Description
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add high-resolution photography and detailed leasing description
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Featured Image URL"
            placeholder="https://images.unsplash.com/..."
            value={formData.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            helperText="Provide a direct image URL or choose one of the sample presets below"
          />

          {/* Quick presets */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Sample Preset Photo
            </span>
            <div className="grid grid-cols-5 gap-2">
              {SAMPLE_IMAGE_PRESETS.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleChange('imageUrl', url)}
                  className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                    formData.imageUrl === url
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          {formData.imageUrl && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Live Image Preview
              </span>
              <div className="relative rounded-xl overflow-hidden aspect-video max-w-md border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = SAMPLE_IMAGE_PRESETS[0]
                  }}
                />
              </div>
            </div>
          )}

          <Textarea
            label="Property Description"
            rows={4}
            placeholder="Describe unit architecture, neighborhood perks, proximity to transit, and unique architectural amenities..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
