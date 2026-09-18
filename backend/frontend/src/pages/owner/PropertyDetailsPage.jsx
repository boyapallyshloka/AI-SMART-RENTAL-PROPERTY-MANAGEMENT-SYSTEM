import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getPropertyDetails,
  getPropertyById,
  deleteProperty,
  updatePropertyStatus,
  CANONICAL_PROPERTY_STATUSES,
  mapBackendPropertyToUi,
} from '../../api/propertyApi'
import {
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  AREA_TYPES,
} from '../../api/propertyAddressApi'
import {
  getImagesByProperty,
  uploadImage,
  updateImage,
  deleteImage,
} from '../../api/propertyImageApi'
import {
  getPropertyAmenities,
  getAllAmenities,
  addAmenityToProperty,
  removeAmenityFromProperty,
  createAmenity,
  deleteAmenity,
} from '../../api/amenityApi'
import { getBuildingsByProperty, deleteBuilding } from '../../api/buildingApi'
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal'
import { StatusBadge, Button, EmptyState, Loader, Input, Select } from '../../components/ui'
import {
  ArrowLeft,
  Edit,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  IndianRupee,
  Building,
  Building2,
  Home,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Shield,
  FileText,
  Wrench,
  AlertCircle,
  Trash2,
  Plus,
  Image as ImageIcon,
  Upload,
  Star,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react'

export { mapBackendPropertyToUi }

const formatAreaType = (type) => {
  if (!type) return ''
  switch (type) {
    case 'SUPER_BUILT_UP_AREA':
      return 'Super Built-up Area'
    case 'BUILT_UP_AREA':
      return 'Built-up Area'
    case 'PLOT_AREA':
      return 'Plot Area'
    case 'CARPET_AREA':
      return 'Carpet Area'
    default:
      return type.replace(/_/g, ' ')
  }
}

export default function PropertyDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [property, setProperty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [toastMessage, setToastMessage] = useState(
    location.state?.toastMessage || ''
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [addressData, setAddressData] = useState(null)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [addressError, setAddressError] = useState(null)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false)
  const [isDeletingAddress, setIsDeletingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    addressLine2: '',
    area: '',
    areaType: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    latitude: '',
    longitude: '',
  })
  const [addressFieldErrors, setAddressFieldErrors] = useState({})
  const [propertyImages, setPropertyImages] = useState([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isDeletingImageId, setIsDeletingImageId] = useState(null)
  const [isUpdatingImageId, setIsUpdatingImageId] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [propertyAmenities, setPropertyAmenities] = useState([])
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false)
  const [amenitiesError, setAmenitiesError] = useState(null)
  const [allSystemAmenities, setAllSystemAmenities] = useState([])
  const [isAddAmenityOpen, setIsAddAmenityOpen] = useState(false)
  const [isSubmittingAmenity, setIsSubmittingAmenity] = useState(false)
  const [isRemovingAmenityId, setIsRemovingAmenityId] = useState(null)
  const [selectedAmenityIdToAdd, setSelectedAmenityIdToAdd] = useState('')
  const [isCreatingNewAmenity, setIsCreatingNewAmenity] = useState(false)
  const [newAmenityForm, setNewAmenityForm] = useState({
    amenityName: '',
    description: '',
  })
  const [newAmenityError, setNewAmenityError] = useState(null)
  const [propertyBuildings, setPropertyBuildings] = useState([])
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false)
  const [buildingsError, setBuildingsError] = useState(null)
  const [buildingDeleteTarget, setBuildingDeleteTarget] = useState(null)
  const [isDeletingBuilding, setIsDeletingBuilding] = useState(false)

  useEffect(() => {
    if (location.state?.toastMessage) {
      setToastMessage(location.state.toastMessage)
      const timer = setTimeout(() => setToastMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  const loadProperty = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      // Consolidated details endpoint: GET /api/owner/properties/{id}/details
      // Replaces separate getPropertyById(id)
      const response = await getPropertyDetails(id)
      const data = response?.data || response

      // 1. Property
      const rawProperty = data?.property || (data?.propertyId ? data : null)
      if (rawProperty && (rawProperty.propertyId || rawProperty.id)) {
        setProperty(mapBackendPropertyToUi(rawProperty))
      } else {
        setProperty(null)
      }

      // 2. Address
      const rawAddress = data?.address || null
      if (rawAddress && (rawAddress.addressId || rawAddress.addressLine1)) {
        setAddressData(rawAddress)
      } else {
        setAddressData(null)
      }

      // 3. Images
      const rawImages = Array.isArray(data?.images) ? data.images : []
      setPropertyImages(rawImages)
      if (rawImages.length > 0 && selectedImageIndex >= rawImages.length) {
        setSelectedImageIndex(0)
      }

      // 4. Amenities
      const rawAmenities = Array.isArray(data?.amenities) ? data.amenities : []
      setPropertyAmenities(rawAmenities)

      // 5. Buildings with nested Floors and Units
      let rawBuildings = Array.isArray(data?.buildings) ? data.buildings : []
      if (rawBuildings.length === 0 && id) {
        try {
          const bRes = await getBuildingsByProperty(id)
          const bList = Array.isArray(bRes?.data)
            ? bRes.data
            : Array.isArray(bRes)
            ? bRes
            : []
          if (bList.length > 0) {
            rawBuildings = bList
          }
        } catch (bErr) {
          console.warn('Fallback getBuildingsByProperty failed:', bErr)
        }
      }

      const parsedBuildings = rawBuildings.map((item) => {
        const b = item.building || item
        const rawFloors = Array.isArray(item.floors) ? item.floors : []
        const floors = rawFloors.map((fItem) => {
          const fl = fItem.floor || fItem
          const rawUnits = Array.isArray(fItem.units) ? fItem.units : []
          const units = rawUnits.map((uItem) => uItem.unit || uItem)
          return {
            ...fl,
            floorId: fl.floorId != null ? fl.floorId : fl.id,
            floorNumber: fl.floorNumber,
            floorName: fl.floorName,
            units,
          }
        })
        const totalUnitsFromFloors = floors.reduce(
          (sum, fl) => sum + (fl.units?.length || 0),
          0
        )
        return {
          ...b,
          buildingId: b.buildingId != null ? b.buildingId : b.id,
          buildingName: b.buildingName || b.name || 'Unnamed Building',
          totalFloors: b.totalFloors != null ? b.totalFloors : floors.length,
          totalUnits:
            b.totalUnits != null ? b.totalUnits : totalUnitsFromFloors,
          floors,
        }
      })
      setPropertyBuildings(parsedBuildings)
    } catch (err) {
      console.error(`Failed to load consolidated property details for ID ${id}:`, err)
      if (err?.response?.status === 404) {
        setProperty(null)
      } else {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load property details. Please try again later.'
        setError(errorMsg)
        setProperty(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadAddress = async () => {
    return loadProperty()
  }

  const loadImages = async () => {
    return loadProperty()
  }

  const loadAmenities = async () => {
    return loadProperty()
  }

  const loadBuildings = async () => {
    return loadProperty()
  }

  const handleConfirmDeleteBuilding = async () => {
    if (!buildingDeleteTarget || isDeletingBuilding) return
    setIsDeletingBuilding(true)
    setBuildingsError(null)
    try {
      await deleteBuilding(buildingDeleteTarget.buildingId)
      setToastMessage(`Building "${buildingDeleteTarget.buildingName}" was deleted successfully.`)
      setBuildingDeleteTarget(null)
      await loadProperty()
    } catch (err) {
      console.error('Failed to delete building:', err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete building. Please try again.'
      setBuildingsError(msg)
      setBuildingDeleteTarget(null)
    } finally {
      setIsDeletingBuilding(false)
    }
  }

  useEffect(() => {
    loadProperty()
  }, [id])

  const handleDelete = async () => {
    if (!property?.id || isDeleting) return
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.name}"? This action cannot be undone.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteProperty(property.id)
      navigate('/owner/properties', {
        state: { toastMessage: `Property "${property.name}" was successfully deleted.` },
        replace: true,
      })
    } catch (err) {
      console.error(`Failed to delete property ID ${property.id}:`, err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete property. Please try again.'
      alert(`Error: ${errorMsg}`)
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!property?.id || isUpdatingStatus) return
    if (newStatus === property.status) return
    if (!CANONICAL_PROPERTY_STATUSES.includes(newStatus)) {
      alert(`Invalid status: ${newStatus}`)
      return
    }

    setIsUpdatingStatus(true)
    try {
      await updatePropertyStatus(property.id, newStatus)
      setProperty((prev) => (prev ? { ...prev, status: newStatus } : prev))
      setToastMessage(`Property status updated to ${newStatus.replace('_', ' ')}.`)
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error(`Failed to update status for property ID ${property.id}:`, err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update property status. Please try again.'
      alert(`Error: ${errorMsg}`)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleOpenAddAddress = () => {
    setAddressForm({
      addressLine1: '',
      addressLine2: '',
      area: '',
      areaType: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      latitude: '',
      longitude: '',
    })
    setAddressFieldErrors({})
    setAddressError(null)
    setIsEditingAddress(true)
  }

  const handleOpenEditAddress = () => {
    if (!addressData) return
    setAddressForm({
      addressLine1: addressData.addressLine1 || '',
      addressLine2: addressData.addressLine2 || '',
      area: addressData.area || '',
      areaType: addressData.areaType || '',
      city: addressData.city || '',
      state: addressData.state || '',
      country: addressData.country || '',
      pincode: addressData.pincode || '',
      latitude: addressData.latitude != null ? String(addressData.latitude) : '',
      longitude: addressData.longitude != null ? String(addressData.longitude) : '',
    })
    setAddressFieldErrors({})
    setAddressError(null)
    setIsEditingAddress(true)
  }

  const validateAddressForm = () => {
    const errs = {}
    if (!addressForm.addressLine1.trim()) {
      errs.addressLine1 = 'Address line 1 is required'
    }
    if (!addressForm.area.trim()) {
      errs.area = 'Area is required'
    }
    if (!addressForm.city.trim()) {
      errs.city = 'City is required'
    }
    if (!addressForm.state.trim()) {
      errs.state = 'State is required'
    }
    if (!addressForm.country.trim()) {
      errs.country = 'Country is required'
    }
    if (!addressForm.pincode.trim()) {
      errs.pincode = 'Pincode is required'
    } else if (!/^[0-9]{6}$/.test(addressForm.pincode.trim())) {
      errs.pincode = 'Pincode must contain exactly 6 digits'
    }
    setAddressFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveAddress = async (e) => {
    e?.preventDefault()
    if (!id || isSubmittingAddress) return
    if (!validateAddressForm()) return

    setIsSubmittingAddress(true)
    setAddressError(null)
    try {
      if (addressData?.addressId) {
        await updateAddress(id, addressForm)
        setToastMessage('Property address updated successfully.')
      } else {
        await createAddress(id, addressForm)
        setToastMessage('Property address created successfully.')
      }
      setIsEditingAddress(false)
      // Refresh property details from real backend Neon DB
      await loadProperty()
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save address:', err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save address. Please check your inputs and try again.'
      setAddressError(errorMsg)
    } finally {
      setIsSubmittingAddress(false)
    }
  }

  const handleDeleteAddress = async () => {
    if (!id || isDeletingAddress || !addressData) return
    const confirmed = window.confirm(
      'Are you sure you want to delete the registered address for this property? This action cannot be undone.'
    )
    if (!confirmed) return

    setIsDeletingAddress(true)
    setAddressError(null)
    try {
      await deleteAddress(id)
      setIsEditingAddress(false)
      setToastMessage('Property address deleted successfully.')
      // Refresh property details from real backend Neon DB so address = null
      await loadProperty()
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to delete address:', err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete address. Please try again.'
      setAddressError(errorMsg)
      alert(`Error: ${errorMsg}`)
    } finally {
      setIsDeletingAddress(false)
    }
  }

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !id || isUploadingImage) return

    setIsUploadingImage(true)
    setUploadError(null)
    try {
      const isFirst = propertyImages.length === 0
      await uploadImage(id, {
        file,
        imageType: 'GALLERY',
        isPrimary: isFirst,
      })
      await loadImages(id)
      setToastMessage('Property photo uploaded successfully.')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to upload photo:', err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload photo. Please check file format and size.'
      setUploadError(msg)
      alert(`Error: ${msg}`)
    } finally {
      setIsUploadingImage(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleDeletePhoto = async (imageId) => {
    if (!imageId || isDeletingImageId) return
    const confirmed = window.confirm(
      'Are you sure you want to delete this property photo? This action cannot be undone.'
    )
    if (!confirmed) return

    setIsDeletingImageId(imageId)
    try {
      await deleteImage(imageId)
      setPropertyImages((prev) => {
        const next = prev.filter((img) => img.imageId !== imageId)
        if (selectedImageIndex >= next.length && next.length > 0) {
          setSelectedImageIndex(next.length - 1)
        } else if (next.length === 0) {
          setSelectedImageIndex(0)
        }
        return next
      })
      setToastMessage('Property photo deleted successfully.')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to delete photo:', err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete photo. Please try again.'
      alert(`Error: ${msg}`)
    } finally {
      setIsDeletingImageId(null)
    }
  }

  const handleSetPrimary = async (img) => {
    if (!img?.imageId || isUpdatingImageId) return
    if (img.isPrimary) return

    setIsUpdatingImageId(img.imageId)
    try {
      await updateImage(img.imageId, {
        isPrimary: true,
        imageType: img.imageType || 'GALLERY',
      })
      await loadImages(id)
      setToastMessage('Primary property photo updated.')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to set primary photo:', err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update photo.'
      alert(`Error: ${msg}`)
    } finally {
      setIsUpdatingImageId(null)
    }
  }

  const handleOpenAddAmenity = async () => {
    setIsAddAmenityOpen(true)
    setAmenitiesError(null)
    setSelectedAmenityIdToAdd('')
    setIsCreatingNewAmenity(false)
    setNewAmenityForm({ amenityName: '', description: '' })
    setNewAmenityError(null)
    try {
      const res = await getAllAmenities()
      const data = Array.isArray(res) ? res : res?.data || []
      setAllSystemAmenities(data)
    } catch (err) {
      console.error('Failed to load system amenities:', err)
    }
  }

  const handleAddAmenityToProperty = async (e) => {
    e?.preventDefault?.()
    if (!selectedAmenityIdToAdd || isSubmittingAmenity || !id) return

    setIsSubmittingAmenity(true)
    setAmenitiesError(null)
    try {
      await addAmenityToProperty(id, selectedAmenityIdToAdd)
      await loadAmenities(id)
      setIsAddAmenityOpen(false)
      setSelectedAmenityIdToAdd('')
      setToastMessage('Amenity added to property successfully.')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to add amenity to property:', err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to add amenity to property. Please try again.'
      setAmenitiesError(msg)
    } finally {
      setIsSubmittingAmenity(false)
    }
  }

  const handleCreateAndAddAmenity = async (e) => {
    e?.preventDefault?.()
    const name = newAmenityForm.amenityName.trim()
    if (!name || isSubmittingAmenity || !id) {
      setNewAmenityError('Amenity name is required.')
      return
    }

    setIsSubmittingAmenity(true)
    setNewAmenityError(null)
    setAmenitiesError(null)
    try {
      const res = await createAmenity({
        amenityName: name,
        description: newAmenityForm.description.trim() || undefined,
      })
      const created = res?.data || res
      const newAmenityId = created?.amenityId || created?.id

      if (newAmenityId) {
        await addAmenityToProperty(id, newAmenityId)
      }
      await loadAmenities(id)
      setIsAddAmenityOpen(false)
      setNewAmenityForm({ amenityName: '', description: '' })
      setIsCreatingNewAmenity(false)
      setToastMessage('New amenity created and added to property.')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to create amenity:', err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create amenity. Please try again.'
      setNewAmenityError(msg)
    } finally {
      setIsSubmittingAmenity(false)
    }
  }

  const handleRemoveAmenity = async (amenity) => {
    if (!amenity?.amenityId || isRemovingAmenityId || !id) return

    const confirmed = window.confirm(
      `Are you sure you want to remove "${amenity.amenityName}" from this property?`
    )
    if (!confirmed) return

    setIsRemovingAmenityId(amenity.amenityId)
    setAmenitiesError(null)
    try {
      await removeAmenityFromProperty(id, amenity.amenityId)
      setPropertyAmenities((prev) =>
        prev.filter((a) => a.amenityId !== amenity.amenityId)
      )
      setToastMessage('Amenity removed from property successfully.')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Failed to remove amenity from property:', err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to remove amenity. Please try again.'
      setAmenitiesError(msg)
      alert(`Error: ${msg}`)
    } finally {
      setIsRemovingAmenityId(null)
    }
  }

  const unassignedAmenities = allSystemAmenities.filter(
    (sa) => !propertyAmenities.some((pa) => pa.amenityId === sa.amenityId)
  )

  if (isLoading) {
    return (
      <DashboardLayout
        defaultRole="owner"
        activeItem="properties"
        pageTitle="Property Details"
      >
        <div className="max-w-3xl mx-auto py-24 flex flex-col items-center justify-center">
          <Loader size="xl" text="Loading property details..." center />
        </div>
      </DashboardLayout>
    )
  }

  if (error && !property) {
    return (
      <DashboardLayout
        defaultRole="owner"
        activeItem="properties"
        pageTitle="Property Details"
      >
        <div className="max-w-3xl mx-auto py-12">
          <EmptyState
            icon={<AlertCircle className="w-8 h-8 text-red-500" />}
            title="Failed to Load Property"
            message={error}
            action={
              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={loadProperty}>
                  Retry
                </Button>
                <Link to="/owner/properties">
                  <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Return to Properties List
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

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

  const allUnits = propertyBuildings.flatMap((b) =>
    (b.floors || []).flatMap((fl) => fl.units || [])
  )
  const totalUnitsCalculated = allUnits.length > 0 ? allUnits.length : (Number(property.totalUnits) || 0)
  const occupiedUnitsCalculated = allUnits.length > 0
    ? allUnits.filter((u) => u.status === 'OCCUPIED' || u.status === 'RENTED').length
    : (Number(property.occupiedUnits) || (property.status === 'OCCUPIED' ? 1 : 0))

  const total = totalUnitsCalculated || 1
  const occupied = occupiedUnitsCalculated
  const vacant = Math.max(0, total - occupied)
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0
  const currentImage = propertyImages[selectedImageIndex] || propertyImages[0] || null

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="properties"
      pageTitle={property.name}
    >
      <div className="space-y-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage('')}
              className="text-[#2A583B] hover:text-[#1d3d29]"
            >
              &times;
            </button>
          </div>
        )}

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
            <Link
              to={`/owner/buildings/new?propertyId=${id}`}
              state={{ propertyId: id, propertyName: property.name }}
            >
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4 text-[#315A7D]" />}
              >
                Add Building
              </Button>
            </Link>
            <Link to={`/owner/properties/${property.id}/edit`}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit Property
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              leftIcon={
                isDeleting ? (
                  <Loader size="xs" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-500" />
                )
              }
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
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
                <div className="flex items-center gap-2">
                  <StatusBadge status={property.status} size="sm" />
                  <select
                    aria-label="Change property status"
                    value={property.status || 'AVAILABLE'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="text-xs font-semibold rounded-md border border-[#D9E0E6] bg-white text-[#243447] py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[#315A7D] cursor-pointer hover:border-[#315A7D] transition-colors disabled:opacity-60"
                  >
                    {CANONICAL_PROPERTY_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st === 'UNDER_MAINTENANCE'
                          ? 'Maintenance'
                          : st.charAt(0) + st.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  {isUpdatingStatus && <Loader size="xs" />}
                </div>
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
                  {addressData
                    ? [
                        addressData.addressLine1,
                        addressData.addressLine2,
                        addressData.area,
                        addressData.city,
                        addressData.state,
                        addressData.pincode,
                        addressData.country,
                      ]
                        .filter(Boolean)
                        .join(', ')
                    : 'No address added'}
                </span>
              </p>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-[#D9E0E6]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                Total Area
              </p>
              <p className="text-3xl font-extrabold text-[#315A7D] tracking-tight">
                {property.totalArea != null ? Number(property.totalArea).toLocaleString() : '—'}
                <span className="text-xs text-[#5B6875] font-normal"> sq ft</span>
              </p>
              {property.yearBuilt && (
                <p className="text-xs text-[#5B6875] mt-0.5">
                  Year Built: {property.yearBuilt}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Hero Gallery Grid */}
        <div className="bg-white rounded-2xl border border-[#D9E0E6] p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E6] pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#315A7D]" />
              <h2 className="text-base font-semibold text-[#243447]">
                Property Photos & Media
              </h2>
              {propertyImages.length > 0 && (
                <span className="text-xs text-[#5B6875] font-medium">
                  ({propertyImages.length} {propertyImages.length === 1 ? 'photo' : 'photos'})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D9E0E6] bg-white hover:bg-[#F7F8FA] text-xs font-semibold text-[#243447] cursor-pointer transition-colors shadow-2xs ${
                  isUploadingImage ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {isUploadingImage ? (
                  <Loader size="xs" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[#315A7D]" />
                )}
                <span>{isUploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingImage}
                  onChange={handleUploadPhoto}
                />
              </label>
            </div>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center justify-between">
              <span>{uploadError}</span>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                &times;
              </button>
            </div>
          )}

          {isLoadingImages ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader size="md" text="Loading property photos..." center />
            </div>
          ) : propertyImages.length > 0 ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-[21/9] max-h-[460px] bg-slate-900 border border-[#D9E0E6]">
                <img
                  src={currentImage?.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {currentImage?.isPrimary && (
                    <span className="px-2.5 py-1 rounded-full bg-[#3F7D58] text-white text-xs font-semibold flex items-center gap-1 shadow-sm backdrop-blur-md">
                      <Star className="w-3 h-3 fill-current" />
                      Primary Photo
                    </span>
                  )}
                  {currentImage?.imageType && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/70 text-white text-xs backdrop-blur-md font-medium">
                      {currentImage.imageType}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/70 text-white text-xs backdrop-blur-md font-mono">
                  Photo {selectedImageIndex + 1} of {propertyImages.length}
                </div>

                {/* Overlay Action Buttons */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {!currentImage?.isPrimary && (
                    <Button
                      variant="outline"
                      size="xs"
                      className="bg-white/90 hover:bg-white text-[#243447] border-white/40 backdrop-blur-md shadow-sm"
                      disabled={isUpdatingImageId === currentImage?.imageId}
                      onClick={() => handleSetPrimary(currentImage)}
                      leftIcon={
                        isUpdatingImageId === currentImage?.imageId ? (
                          <Loader size="xs" />
                        ) : (
                          <Star className="w-3 h-3 text-[#B7791F]" />
                        )
                      }
                    >
                      Make Primary
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="xs"
                    className="bg-white/90 hover:bg-red-50 text-red-600 border-white/40 backdrop-blur-md shadow-sm"
                    disabled={isDeletingImageId === currentImage?.imageId}
                    onClick={() => handleDeletePhoto(currentImage?.imageId)}
                    leftIcon={
                      isDeletingImageId === currentImage?.imageId ? (
                        <Loader size="xs" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      )
                    }
                  >
                    {isDeletingImageId === currentImage?.imageId
                      ? 'Deleting...'
                      : 'Delete Photo'}
                  </Button>
                </div>
              </div>

              {/* Thumbnails */}
              {propertyImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {propertyImages.map((img, idx) => (
                    <button
                      key={img.imageId || idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-14 sm:w-28 sm:h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#315A7D] ring-2 ring-[#315A7D]/30 opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {img.isPrimary && (
                        <span className="absolute bottom-1 right-1 p-0.5 rounded-full bg-[#3F7D58] text-white">
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#D9E0E6] bg-[#F7F8FA] p-8 sm:p-12 flex flex-col items-center justify-center text-center">
              <div className="p-3.5 rounded-full bg-[#EAF2F7] text-[#315A7D] mb-3">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-semibold text-[#243447]">
                No Photos Uploaded Yet
              </h3>
              <p className="text-xs text-[#5B6875] max-w-sm mt-1 mb-4">
                Showcase this property with photos of the exterior, interior living spaces, architecture, and amenities.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#315A7D] hover:bg-[#254663] text-white text-xs font-semibold shadow-sm transition-colors">
                <Plus className="w-4 h-4" />
                <span>Upload First Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingImage}
                  onChange={handleUploadPhoto}
                />
              </label>
            </div>
          )}
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Address & Specs & Amenities & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Location & Address */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E6] pb-3">
                <div>
                  <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#315A7D]" />
                    Property Address
                  </h2>
                  <p className="text-xs text-[#5B6875] mt-0.5">
                    Official postal address and geographic coordinates
                  </p>
                </div>

                {!isEditingAddress && (
                  <div className="flex items-center gap-2">
                    {addressData ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Edit className="w-3.5 h-3.5" />}
                          onClick={handleOpenEditAddress}
                          disabled={isDeletingAddress}
                        >
                          Edit Address
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeletingAddress}
                          leftIcon={
                            isDeletingAddress ? (
                              <Loader size="xs" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            )
                          }
                          onClick={handleDeleteAddress}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          {isDeletingAddress ? 'Deleting...' : 'Delete'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        onClick={handleOpenAddAddress}
                        disabled={isLoadingAddress}
                      >
                        Add Address
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {addressError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{addressError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddressError(null)}
                    className="text-red-600 hover:text-red-800 font-bold ml-2"
                  >
                    &times;
                  </button>
                </div>
              )}

              {isLoadingAddress ? (
                <div className="py-6 flex justify-center">
                  <Loader size="sm" text="Loading address details..." center />
                </div>
              ) : isEditingAddress ? (
                <form onSubmit={handleSaveAddress} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Address Line 1"
                        placeholder="e.g. Plot 123"
                        value={addressForm.addressLine1}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            addressLine1: e.target.value,
                          }))
                        }
                        error={addressFieldErrors.addressLine1}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label="Address Line 2 (Optional)"
                        placeholder="e.g. Near Metro Station"
                        value={addressForm.addressLine2}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            addressLine2: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <Input
                      label="Area"
                      placeholder="e.g. Madhapur"
                      value={addressForm.area}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          area: e.target.value,
                        }))
                      }
                      error={addressFieldErrors.area}
                      required
                    />

                    <Select
                      label="Area Type (Optional)"
                      value={addressForm.areaType}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          areaType: e.target.value,
                        }))
                      }
                      options={[
                        { value: '', label: 'Select area type (optional)' },
                        { value: 'SUPER_BUILT_UP_AREA', label: 'Super Built-up Area' },
                        { value: 'BUILT_UP_AREA', label: 'Built-up Area' },
                        { value: 'PLOT_AREA', label: 'Plot Area' },
                        { value: 'CARPET_AREA', label: 'Carpet Area' },
                      ]}
                    />

                    <Input
                      label="City"
                      placeholder="e.g. Hyderabad"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      error={addressFieldErrors.city}
                      required
                    />

                    <Input
                      label="State"
                      placeholder="e.g. Telangana"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      error={addressFieldErrors.state}
                      required
                    />

                    <Input
                      label="Country"
                      placeholder="e.g. India"
                      value={addressForm.country}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      error={addressFieldErrors.country}
                      required
                    />

                    <Input
                      label="Pincode (6 Digits)"
                      placeholder="e.g. 500081"
                      value={addressForm.pincode}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          pincode: e.target.value,
                        }))
                      }
                      error={addressFieldErrors.pincode}
                      required
                    />

                    <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                      <Input
                        label="Latitude (Optional)"
                        placeholder="e.g. 17.4483"
                        value={addressForm.latitude}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            latitude: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Longitude (Optional)"
                        placeholder="e.g. 78.3915"
                        value={addressForm.longitude}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            longitude: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#D9E0E6]">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      disabled={isSubmittingAddress}
                      onClick={() => {
                        setIsEditingAddress(false)
                        setAddressFieldErrors({})
                        setAddressError(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={isSubmittingAddress}
                      leftIcon={
                        isSubmittingAddress ? <Loader size="xs" /> : undefined
                      }
                    >
                      {isSubmittingAddress
                        ? 'Saving...'
                        : addressData
                        ? 'Update Address'
                        : 'Save Address'}
                    </Button>
                  </div>
                </form>
              ) : addressData ? (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                      <p className="text-[#5B6875] font-medium mb-0.5">Address Line 1</p>
                      <p className="font-semibold text-[#243447]">
                        {addressData.addressLine1}
                      </p>
                    </div>

                    {addressData.addressLine2 ? (
                      <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                        <p className="text-[#5B6875] font-medium mb-0.5">Address Line 2</p>
                        <p className="font-semibold text-[#243447]">
                          {addressData.addressLine2}
                        </p>
                      </div>
                    ) : null}

                    <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                      <p className="text-[#5B6875] font-medium mb-0.5">Area</p>
                      <p className="font-semibold text-[#243447]">{addressData.area}</p>
                    </div>

                    {addressData.areaType ? (
                      <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                        <p className="text-[#5B6875] font-medium mb-0.5">Area Type</p>
                        <p className="font-semibold text-[#243447]">
                          {formatAreaType(addressData.areaType)}
                        </p>
                      </div>
                    ) : null}

                    <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                      <p className="text-[#5B6875] font-medium mb-0.5">City & State</p>
                      <p className="font-semibold text-[#243447]">
                        {addressData.city}, {addressData.state}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                      <p className="text-[#5B6875] font-medium mb-0.5">Country & Pincode</p>
                      <p className="font-semibold text-[#243447]">
                        {addressData.country} — {addressData.pincode}
                      </p>
                    </div>
                  </div>

                  {(addressData.latitude != null || addressData.longitude != null) && (
                    <div className="flex items-center gap-2 text-xs text-[#5B6875] px-1 pt-1">
                      <span className="font-medium text-[#243447]">GPS Coordinates:</span>
                      <span>
                        Latitude: {addressData.latitude ?? '—'}, Longitude: {addressData.longitude ?? '—'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-[#F7F8FA] border border-dashed border-[#D9E0E6] text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#EAF2F7] flex items-center justify-center text-[#315A7D]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#243447]">No address added</h3>
                    <p className="text-xs text-[#5B6875] mt-0.5 max-w-sm mx-auto">
                      This property does not have a registered address yet.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleOpenAddAddress}
                  >
                    Add Address
                  </Button>
                </div>
              )}
            </div>

            {/* Property Specs */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#243447] mb-4">
                Property Dimensions & Specs
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6875] mb-1">
                    <Maximize2 className="w-3.5 h-3.5 text-[#315A7D]" />
                    <span>Total Area</span>
                  </div>
                  <p className="text-lg font-bold text-[#243447]">
                    {property.totalArea != null ? `${Number(property.totalArea).toLocaleString()} sq ft` : '—'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6875] mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#315A7D]" />
                    <span>Year Built</span>
                  </div>
                  <p className="text-lg font-bold text-[#243447]">
                    {property.yearBuilt || '—'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6875] mb-1">
                    <Home className="w-3.5 h-3.5 text-[#315A7D]" />
                    <span>Furnishing</span>
                  </div>
                  <p className="text-sm font-bold text-[#243447] truncate">
                    {property.furnishing || 'Unfurnished'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6875] mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#315A7D]" />
                    <span>Parking</span>
                  </div>
                  <p className="text-sm font-bold text-[#243447] truncate">
                    {property.parking || (property.parkingAvailable ? 'Available' : 'None')}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#D9E0E6] flex items-center justify-between text-xs text-[#5B6875]">
                <span>Property Classification:</span>
                <span className="font-semibold text-[#243447]">
                  {property.propertyType || property.type || '—'}
                </span>
              </div>
            </div>

            {/* Included Amenities */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E6] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B7791F]" />
                  <h2 className="text-base font-semibold text-[#243447]">
                    Included Amenities & Facilities
                  </h2>
                  <span className="text-xs text-[#5B6875] font-semibold">
                    ({propertyAmenities.length}{' '}
                    {propertyAmenities.length === 1 ? 'feature' : 'features'})
                  </span>
                </div>

                {!isAddAmenityOpen && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleOpenAddAmenity}
                    leftIcon={<Plus className="w-3.5 h-3.5 text-[#315A7D]" />}
                  >
                    Add Amenity
                  </Button>
                )}
              </div>

              {amenitiesError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center justify-between">
                  <span>{amenitiesError}</span>
                  <button
                    type="button"
                    onClick={() => setAmenitiesError(null)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Inline Add / Create Amenity Panel */}
              {isAddAmenityOpen && (
                <div className="p-4 rounded-xl border border-[#D9E0E6] bg-[#F7F8FA] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#243447]">
                      {isCreatingNewAmenity
                        ? 'Define New Amenity'
                        : 'Add Amenity to Property'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNewAmenity(!isCreatingNewAmenity)
                          setNewAmenityError(null)
                        }}
                        className="text-xs text-[#315A7D] hover:underline font-semibold"
                      >
                        {isCreatingNewAmenity
                          ? '← Select existing'
                          : '+ Create new custom amenity'}
                      </button>
                    </div>
                  </div>

                  {newAmenityError && (
                    <p className="text-xs text-red-600 font-medium">
                      {newAmenityError}
                    </p>
                  )}

                  {!isCreatingNewAmenity ? (
                    <form
                      onSubmit={handleAddAmenityToProperty}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-xs font-medium text-[#5B6875] mb-1">
                          Select from Available Amenities
                        </label>
                        {unassignedAmenities.length > 0 ? (
                          <select
                            value={selectedAmenityIdToAdd}
                            onChange={(e) =>
                              setSelectedAmenityIdToAdd(e.target.value)
                            }
                            disabled={isSubmittingAmenity}
                            className="w-full text-xs rounded-lg border border-[#D9E0E6] p-2 bg-white text-[#243447] focus:outline-none focus:border-[#315A7D]"
                          >
                            <option value="">-- Choose an amenity --</option>
                            {unassignedAmenities.map((a) => (
                              <option key={a.amenityId} value={a.amenityId}>
                                {a.amenityName}{' '}
                                {a.description ? `(${a.description})` : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-xs text-[#5B6875] italic">
                            All existing system amenities are already assigned
                            to this property, or none exist yet.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 justify-end pt-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          type="button"
                          disabled={isSubmittingAmenity}
                          onClick={() => setIsAddAmenityOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          type="submit"
                          disabled={
                            isSubmittingAmenity || !selectedAmenityIdToAdd
                          }
                          isLoading={isSubmittingAmenity}
                        >
                          Add to Property
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form
                      onSubmit={handleCreateAndAddAmenity}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-xs font-medium text-[#5B6875] mb-1">
                          Amenity Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="e.g. Swimming Pool, EV Charger, High-Speed Wi-Fi"
                          value={newAmenityForm.amenityName}
                          onChange={(e) =>
                            setNewAmenityForm((prev) => ({
                              ...prev,
                              amenityName: e.target.value,
                            }))
                          }
                          disabled={isSubmittingAmenity}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#5B6875] mb-1">
                          Description (Optional)
                        </label>
                        <Input
                          placeholder="e.g. Olympic-sized heated pool available 6 AM - 10 PM"
                          value={newAmenityForm.description}
                          onChange={(e) =>
                            setNewAmenityForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          disabled={isSubmittingAmenity}
                        />
                      </div>
                      <div className="flex items-center gap-2 justify-end pt-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          type="button"
                          disabled={isSubmittingAmenity}
                          onClick={() => {
                            setIsCreatingNewAmenity(false)
                            setIsAddAmenityOpen(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          type="submit"
                          disabled={
                            isSubmittingAmenity ||
                            !newAmenityForm.amenityName.trim()
                          }
                          isLoading={isSubmittingAmenity}
                        >
                          Create & Add
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Amenity list / Loading / Empty State */}
              {isLoadingAmenities ? (
                <div className="py-8 flex justify-center">
                  <Loader
                    size="sm"
                    text="Loading property amenities..."
                    center
                  />
                </div>
              ) : propertyAmenities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {propertyAmenities.map((amenity) => (
                    <div
                      key={amenity.amenityId}
                      className="group relative flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6] text-xs text-[#243447] font-medium hover:border-[#B7791F]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-[#3F7D58] shrink-0" />
                        <div className="min-w-0">
                          <span className="truncate block font-semibold text-[#243447]">
                            {amenity.amenityName}
                          </span>
                          {amenity.description && (
                            <span className="truncate block text-[11px] text-[#5B6875]">
                              {amenity.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isRemovingAmenityId === amenity.amenityId}
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="p-1 rounded-md text-[#8C9BA8] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
                        title={`Remove ${amenity.amenityName} from property`}
                      >
                        {isRemovingAmenityId === amenity.amenityId ? (
                          <Loader size="xs" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center rounded-xl border border-dashed border-[#D9E0E6] bg-[#F7F8FA]/50">
                  <Sparkles className="w-7 h-7 text-[#B7791F]/60 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#243447]">
                    No amenities specified yet.
                  </p>
                  <p className="text-xs text-[#5B6875] max-w-xs mx-auto mt-1 mb-3">
                    Add amenities and facilities to highlight what makes this
                    property special.
                  </p>
                  {!isAddAmenityOpen && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleOpenAddAmenity}
                      leftIcon={<Plus className="w-3.5 h-3.5 text-[#315A7D]" />}
                    >
                      Add First Amenity
                    </Button>
                  )}
                </div>
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

            {/* Buildings & Structures */}
            <div id="buildings-section" className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E6] pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#315A7D]" />
                  <h2 className="text-base font-semibold text-[#243447]">
                    Buildings
                  </h2>
                  <span className="text-xs text-[#5B6875] font-semibold">
                    ({propertyBuildings.length}{' '}
                    {propertyBuildings.length === 1 ? 'building' : 'buildings'})
                  </span>
                </div>

                <Link
                  to={`/owner/properties/${id}/buildings/new`}
                  state={{ propertyId: id, propertyName: property?.name }}
                >
                  <Button
                    variant="outline"
                    size="xs"
                    leftIcon={<Plus className="w-3.5 h-3.5 text-[#315A7D]" />}
                  >
                    Add Building
                  </Button>
                </Link>
              </div>

              {buildingsError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center justify-between">
                  <span>{buildingsError}</span>
                  <button
                    type="button"
                    onClick={() => setBuildingsError(null)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    &times;
                  </button>
                </div>
              )}

              {isLoadingBuildings ? (
                <div className="py-8 flex justify-center">
                  <Loader
                    size="sm"
                    text="Loading property buildings..."
                    center
                  />
                </div>
              ) : propertyBuildings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {propertyBuildings.map((b) => (
                    <div
                      key={b.buildingId}
                      className="group p-4 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6] hover:border-[#315A7D]/40 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-white border border-[#D9E0E6] text-[#315A7D] group-hover:bg-[#315A7D] group-hover:text-white transition-colors">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#243447] group-hover:text-[#315A7D] transition-colors">
                              {b.buildingName}
                            </h3>
                            {(b.propertyName || property.name) && (
                              <p className="text-[11px] text-[#5B6875]">
                                {b.propertyName || property.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {b.description && (
                        <p className="text-xs text-[#5B6875] line-clamp-2">
                          {b.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs pt-1 border-t border-[#D9E0E6]/60">
                        <span className="inline-flex items-center gap-1 text-[#5B6875] font-medium">
                          <Layers className="w-3.5 h-3.5 text-[#315A7D]" />
                          <span>{b.totalFloors ?? '—'} Floors</span>
                        </span>
                        <span>&bull;</span>
                        <span className="inline-flex items-center gap-1 text-[#5B6875] font-medium">
                          <Home className="w-3.5 h-3.5 text-[#3F7D58]" />
                          <span>{b.totalUnits ?? '—'} Units</span>
                        </span>
                      </div>

                      {/* Nested Floors & Units representation */}
                      {Array.isArray(b.floors) && b.floors.length > 0 && (
                        <div className="pt-2 border-t border-[#D9E0E6]/60 space-y-2">
                          <div className="text-[11px] font-semibold text-[#5B6875] uppercase tracking-wider flex items-center justify-between">
                            <span>Floors &amp; Units</span>
                            <span>{b.floors.length} {b.floors.length === 1 ? 'Floor' : 'Floors'}</span>
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                            {b.floors.map((fl) => (
                              <div
                                key={fl.floorId || fl.floorNumber}
                                className="p-2 rounded-lg bg-white border border-[#D9E0E6] text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between font-semibold text-[#243447]">
                                  <span className="flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-[#315A7D]" />
                                    {fl.floorName || `Floor ${fl.floorNumber}`}
                                  </span>
                                  <span className="text-[11px] text-[#5B6875] font-normal">
                                    {Array.isArray(fl.units) ? fl.units.length : 0} {(fl.units?.length === 1) ? 'unit' : 'units'}
                                  </span>
                                </div>
                                {Array.isArray(fl.units) && fl.units.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {fl.units.map((u) => (
                                      <span
                                        key={u.unitId || u.unitNumber}
                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                          u.status === 'OCCUPIED'
                                            ? 'bg-[#EDF7EE] text-[#2A583B] border-[#C6DEC8]'
                                            : 'bg-[#F7F8FA] text-[#5B6875] border-[#D9E0E6]'
                                        }`}
                                        title={`Unit ${u.unitNumber} (${u.unitType || 'Unit'})${u.monthlyRent ? ` - ₹${Number(u.monthlyRent).toLocaleString('en-IN')}/mo` : ''}`}
                                      >
                                        <span>Unit {u.unitNumber}</span>
                                        {u.unitType && (
                                          <span className="text-[9px] opacity-75">
                                            ({u.unitType.replace('_', ' ')})
                                          </span>
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-[#8C9BA8] italic">No units on this floor</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#D9E0E6]/60 flex items-center justify-between gap-2">
                        <Link
                          to={`/owner/buildings/${b.buildingId}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315A7D] hover:text-[#254663] transition-colors"
                        >
                          <span>View Building Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Button
                          variant="outline"
                          size="xs"
                          leftIcon={<Trash2 className="w-3 h-3 text-[#B94A48]" />}
                          onClick={() =>
                            setBuildingDeleteTarget({
                              buildingId: b.buildingId,
                              buildingName: b.buildingName,
                            })
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center rounded-xl border border-dashed border-[#D9E0E6] bg-[#F7F8FA]/50">
                  <Building2 className="w-8 h-8 text-[#315A7D]/40 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#243447]">
                    No buildings added yet.
                  </p>
                  <p className="text-xs text-[#5B6875] max-w-xs mx-auto mt-1 mb-3">
                    Add buildings or towers to structure floors and individual
                    units for this property.
                  </p>
                  <Link
                    to={`/owner/properties/${id}/buildings/new`}
                    state={{ propertyId: id, propertyName: property?.name }}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Building
                    </Button>
                  </Link>
                </div>
              )}
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

            {/* Property Overview Card */}
            <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-sm space-y-3">
              <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#315A7D]" />
                Property Specifications
              </h2>
              <div className="space-y-2 text-xs divide-y divide-[#D9E0E6]">
                <div className="flex justify-between pt-2">
                  <span className="text-[#5B6875]">Property Type:</span>
                  <span className="font-semibold text-[#243447]">
                    {property.propertyType || property.type || '—'}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#5B6875]">Total Area:</span>
                  <span className="font-semibold text-[#243447]">
                    {property.totalArea != null ? `${Number(property.totalArea).toLocaleString()} sq ft` : '—'}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#5B6875]">Year Built:</span>
                  <span className="font-semibold text-[#243447]">
                    {property.yearBuilt || '—'}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#5B6875]">Furnishing:</span>
                  <span className="font-semibold text-[#243447]">
                    {property.furnishing || 'Unfurnished'}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#5B6875]">Parking:</span>
                  <span className="font-semibold text-[#243447]">
                    {property.parking || (property.parkingAvailable ? 'Available' : 'None')}
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
                <Link
                  to={`/owner/buildings/new?propertyId=${property.id}`}
                  state={{ propertyId: property.id, propertyName: property.name }}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    leftIcon={<Plus className="w-4 h-4 text-[#315A7D]" />}
                  >
                    Add Building ({propertyBuildings.length} active)
                  </Button>
                </Link>
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
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  leftIcon={
                    isDeleting ? (
                      <Loader size="xs" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )
                  }
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting Property...' : 'Delete Property'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Building Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(buildingDeleteTarget)}
        onClose={() => !isDeletingBuilding && setBuildingDeleteTarget(null)}
        onConfirm={handleConfirmDeleteBuilding}
        title="Delete Building"
        itemName={buildingDeleteTarget?.buildingName}
        consequenceMessage="This will permanently delete this building along with all of its registered floors and units."
        isLoading={isDeletingBuilding}
      />
    </DashboardLayout>
  )
}
