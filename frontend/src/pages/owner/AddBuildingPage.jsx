import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, Input, Select, Textarea, EmptyState } from '../../components/ui'
import { ArrowLeft, Building, Save } from 'lucide-react'
import {
  getBuildingById,
  createBuilding,
  updateBuilding,
} from '../../api/buildingApi'
import { getProperties } from '../../api/propertyApi'

export default function AddBuildingPage() {
  const { buildingId } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(buildingId)

  const [properties, setProperties] = useState([])
  const [formData, setFormData] = useState({
    buildingName: '',
    totalFloors: '1',
    totalUnits: '0',
    description: '',
    propertyId: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Load properties and existing building data if in edit mode
  useEffect(() => {
    const loadInitData = async () => {
      try {
        const props = await getProperties()
        setProperties(props || [])

        if (isEditMode) {
          const existing = await getBuildingById(buildingId)
          if (existing) {
            setFormData({
              buildingName: existing.buildingName || '',
              totalFloors: String(existing.totalFloors ?? 1),
              totalUnits: String(existing.totalUnits ?? 0),
              description: existing.description || '',
              propertyId: existing.propertyId || existing.property?.id || '',
            })
          } else {
            setNotFound(true)
          }
        } else if (props && props.length > 0) {
          setFormData((prev) => ({
            ...prev,
            propertyId: prev.propertyId || props[0].id,
          }))
        }
      } catch (err) {
        console.error('Error loading initial building form data:', err)
      }
    }
    loadInitData()
  }, [buildingId, isEditMode])

  const validate = () => {
    const errs = {}

    if (!formData.buildingName.trim()) {
      errs.buildingName = 'Building name is required.'
    }

    const floorsNum = Number(formData.totalFloors)
    if (!formData.totalFloors || isNaN(floorsNum) || !Number.isInteger(floorsNum) || floorsNum <= 0) {
      errs.totalFloors = 'Total floors must be a positive integer (at least 1).'
    }

    const unitsNum = Number(formData.totalUnits)
    if (formData.totalUnits === '' || isNaN(unitsNum) || !Number.isInteger(unitsNum) || unitsNum < 0) {
      errs.totalUnits = 'Total units must be a non-negative integer (0 or greater).'
    }

    if (!formData.propertyId) {
      errs.propertyId = 'Associated property is required.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const selectedProp = properties.find((p) => String(p.id) === String(formData.propertyId))
      const propertyRef = selectedProp
        ? {
            id: selectedProp.id,
            name: selectedProp.name,
            type: selectedProp.type,
            address: selectedProp.address,
            city: selectedProp.city,
            state: selectedProp.state,
            zipCode: selectedProp.zipCode,
          }
        : null

      const payload = {
        buildingName: formData.buildingName.trim(),
        totalFloors: Number(formData.totalFloors),
        totalUnits: Number(formData.totalUnits),
        description: formData.description.trim(),
        propertyId: formData.propertyId,
        property: propertyRef,
      }

      if (isEditMode) {
        await updateBuilding(buildingId, payload)
        navigate(`/owner/buildings/${buildingId}`)
      } else {
        await createBuilding(payload)
        navigate('/owner/buildings')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (notFound) {
    return (
      <DashboardLayout
        defaultRole="owner"
        activeItem="buildings"
        pageTitle="Building Not Found"
      >
        <div className="max-w-3xl mx-auto py-12 space-y-4">
          <EmptyState
            icon={<Building className="w-8 h-8 text-[#5B6875]" />}
            title="Building Not Found"
            description={`Could not locate a building with ID "${buildingId}".`}
            action={
              <Link to="/owner/buildings">
                <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Buildings
                </Button>
              </Link>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

  const propertyOptions = [
    { value: '', label: '-- Select Associated Property --' },
    ...properties.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.city}, ${p.state || 'CA'})`,
    })),
  ]

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="buildings"
      pageTitle={isEditMode ? 'Edit Building' : 'Add Building'}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5B6875] flex-wrap">
          <Link
            to={isEditMode ? `/owner/buildings/${buildingId}` : '/owner/buildings'}
            className="inline-flex items-center gap-1 hover:text-[#315A7D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'Back to Building Details' : 'Back to Buildings'}</span>
          </Link>
          <span>/</span>
          <span className="text-[#243447] font-semibold">
            {isEditMode ? 'Edit Building' : 'Add New Building'}
          </span>
        </div>

        {/* Page Header */}
        <div className="border-b border-[#D9E0E6] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#315A7D] text-white shadow-xs">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                {isEditMode ? 'Edit Building' : 'Add New Building'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
                {isEditMode
                  ? 'Update building specifications, floor count, and property association.'
                  : 'Register a residential tower, garden block, or commercial pavilion.'}
              </p>
            </div>
          </div>
        </div>

        {/* Building Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-[#D9E0E6] p-6 sm:p-7 shadow-2xs space-y-6"
        >
          {/* Section: Building Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#315A7D] border-b border-[#D9E0E6] pb-2">
              Building Specifications
            </h2>

            <div>
              <Input
                label="Building Name"
                placeholder="e.g. Sunset Palms - Tower Alpha"
                value={formData.buildingName}
                onChange={(e) => handleChange('buildingName', e.target.value)}
                error={errors.buildingName}
                required
              />
            </div>

            <div>
              <Select
                label="Associated Property"
                value={formData.propertyId}
                onChange={(e) => handleChange('propertyId', e.target.value)}
                options={propertyOptions}
                error={errors.propertyId}
                required
              />
              <p className="text-[11px] text-[#5B6875] mt-1">
                The master property portfolio to which this building belongs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Total Floors"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 4"
                value={formData.totalFloors}
                onChange={(e) => handleChange('totalFloors', e.target.value)}
                error={errors.totalFloors}
                required
              />

              <Input
                label="Total Units"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 8"
                value={formData.totalUnits}
                onChange={(e) => handleChange('totalUnits', e.target.value)}
                error={errors.totalUnits}
                required
              />
            </div>

            <div>
              <Textarea
                label="Description (Optional)"
                placeholder="Provide details about building amenities, architecture, or entrance locations..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#D9E0E6] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(isEditMode ? `/owner/buildings/${buildingId}` : '/owner/buildings')
              }
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isEditMode ? 'Save Changes' : 'Create Building'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
