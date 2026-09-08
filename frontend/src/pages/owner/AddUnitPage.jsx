import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, Input, Select, Textarea, EmptyState } from '../../components/ui'
import { ArrowLeft, Home, Save, Layers, Building } from 'lucide-react'
import {
  getUnitById,
  createUnit,
  updateUnit,
  UNIT_TYPES,
  UNIT_STATUSES,
} from '../../api/unitApi'
import { getFloorById } from '../../api/floorApi'
import { getBuildingById } from '../../api/buildingApi'

export default function AddUnitPage() {
  const { buildingId, floorId, unitId } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(unitId)

  const [floor, setFloor] = useState(null)
  const [building, setBuilding] = useState(null)
  const [formData, setFormData] = useState({
    unitNumber: '',
    unitType: 'APARTMENT',
    area: '',
    bedrooms: '1',
    bathrooms: '1',
    monthlyRent: '',
    securityDeposit: '',
    status: 'VACANT',
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadInitData = async () => {
      try {
        if (isEditMode) {
          const existing = await getUnitById(unitId)
          if (existing) {
            setFormData({
              unitNumber: existing.unitNumber || '',
              unitType: existing.unitType || 'APARTMENT',
              area: String(existing.area ?? ''),
              bedrooms: String(existing.bedrooms ?? '1'),
              bathrooms: String(existing.bathrooms ?? '1'),
              monthlyRent: String(existing.monthlyRent ?? ''),
              securityDeposit: String(existing.securityDeposit ?? ''),
              status: existing.status || 'VACANT',
              description: existing.description || '',
            })
            setFloor(existing.floor)
            setBuilding(existing.floor?.building)
          } else {
            setNotFound(true)
          }
        } else {
          const targetFloor = await getFloorById(floorId)
          if (targetFloor) {
            setFloor(targetFloor)
            const bld = targetFloor.building || (await getBuildingById(buildingId))
            setBuilding(bld)
          } else {
            setNotFound(true)
          }
        }
      } catch (err) {
        console.error('Error loading initial unit form data:', err)
      }
    }
    loadInitData()
  }, [buildingId, floorId, unitId, isEditMode])

  const validate = () => {
    const errs = {}

    if (!formData.unitNumber.trim()) {
      errs.unitNumber = 'Unit number is required (e.g. 101, A-102).'
    }

    if (!formData.unitType) {
      errs.unitType = 'Unit type is required.'
    }

    const areaNum = Number(formData.area)
    if (!formData.area || isNaN(areaNum) || areaNum <= 0) {
      errs.area = 'Area must be a positive number greater than 0.'
    }

    const bedNum = Number(formData.bedrooms)
    if (formData.bedrooms === '' || isNaN(bedNum) || bedNum < 0) {
      errs.bedrooms = 'Bedrooms must be a non-negative number (0 or greater).'
    }

    const bathNum = Number(formData.bathrooms)
    if (formData.bathrooms === '' || isNaN(bathNum) || bathNum < 0) {
      errs.bathrooms = 'Bathrooms must be a non-negative number (0 or greater).'
    }

    const rentNum = Number(formData.monthlyRent)
    if (formData.monthlyRent === '' || isNaN(rentNum) || rentNum < 0) {
      errs.monthlyRent = 'Monthly rent must be 0 or greater.'
    }

    const depositNum = Number(formData.securityDeposit)
    if (formData.securityDeposit === '' || isNaN(depositNum) || depositNum < 0) {
      errs.securityDeposit = 'Security deposit must be 0 or greater.'
    }

    if (!formData.status) {
      errs.status = 'Occupancy status is required.'
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
      const payload = {
        unitNumber: formData.unitNumber.trim(),
        unitType: formData.unitType,
        area: Number(formData.area),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        monthlyRent: Number(formData.monthlyRent),
        securityDeposit: Number(formData.securityDeposit),
        status: formData.status,
        description: formData.description.trim(),
        floorId: floor?.floorId || floorId,
        floor: floor,
      }

      if (isEditMode) {
        await updateUnit(unitId, payload)
        navigate(`/owner/units/${unitId}`)
      } else {
        await createUnit(payload)
        const targetBuildingId = building?.buildingId || buildingId
        const targetFloorId = floor?.floorId || floorId
        navigate(`/owner/buildings/${targetBuildingId}/floors/${targetFloorId}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Back destination
  const targetBuildingId = building?.buildingId || buildingId
  const targetFloorId = floor?.floorId || floorId
  const backDestination = isEditMode
    ? `/owner/units/${unitId}`
    : `/owner/buildings/${targetBuildingId}/floors/${targetFloorId}`

  if (notFound) {
    return (
      <DashboardLayout
        defaultRole="owner"
        activeItem="buildings"
        pageTitle="Record Not Found"
      >
        <div className="max-w-3xl mx-auto py-12 space-y-4">
          <EmptyState
            icon={<Home className="w-8 h-8 text-[#5B6875]" />}
            title={isEditMode ? 'Unit Not Found' : 'Floor Context Not Found'}
            description={
              isEditMode
                ? `Could not find a unit matching ID "${unitId}".`
                : `Target floor "${floorId}" was not found.`
            }
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

  const unitTypeOptions = UNIT_TYPES.map((t) => ({
    value: t,
    label: t === 'APARTMENT' ? 'Apartment' : 'Private Room / Suite',
  }))

  const statusOptions = UNIT_STATUSES.map((s) => ({
    value: s,
    label: s.charAt(0) + s.slice(1).toLowerCase(),
  }))

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="buildings"
      pageTitle={isEditMode ? `Edit Unit ${formData.unitNumber}` : 'Add New Unit'}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5B6875] flex-wrap">
          <Link
            to={backDestination}
            className="inline-flex items-center gap-1 hover:text-[#315A7D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {isEditMode ? `Back to Unit ${formData.unitNumber || ''}` : 'Back to Floor Units'}
            </span>
          </Link>
          <span>/</span>
          <span className="text-[#243447] font-semibold">
            {isEditMode ? 'Edit Unit' : 'Add Unit'}
          </span>
        </div>

        {/* Page Header */}
        <div className="border-b border-[#D9E0E6] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#315A7D] text-white shadow-xs">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                {isEditMode ? `Edit Unit ${formData.unitNumber}` : 'Register New Unit'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
                {building?.buildingName} &bull; {floor?.floorName} (Floor {floor?.floorNumber})
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-[#D9E0E6] p-6 sm:p-7 shadow-2xs space-y-6"
        >
          {/* Location Context Banner (Read-only as required) */}
          <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#243447]">
              <Building className="w-4 h-4 text-[#315A7D]" />
              <span>
                Building: <strong>{building?.buildingName}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#243447]">
              <Layers className="w-4 h-4 text-[#315A7D]" />
              <span>
                Target Floor:{' '}
                <strong>
                  {floor?.floorName} (Level {floor?.floorNumber})
                </strong>
              </span>
            </div>
          </div>

          {/* Section: Unit Overview & Classification */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#315A7D] border-b border-[#D9E0E6] pb-2">
              Unit Overview &amp; Type
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Unit Number / Identifier"
                placeholder="e.g. 101, A-202"
                value={formData.unitNumber}
                onChange={(e) => handleChange('unitNumber', e.target.value)}
                error={errors.unitNumber}
                required
              />

              <Select
                label="Unit Type"
                value={formData.unitType}
                onChange={(e) => handleChange('unitType', e.target.value)}
                options={unitTypeOptions}
                error={errors.unitType}
                required
              />

              <Select
                label="Current Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={statusOptions}
                error={errors.status}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Area (Square Feet)"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 1150"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                error={errors.area}
                required
              />

              <Input
                label="Bedrooms"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 2"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', e.target.value)}
                error={errors.bedrooms}
                required
              />

              <Input
                label="Bathrooms"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 2 or 1.5"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', e.target.value)}
                error={errors.bathrooms}
                required
              />
            </div>
          </div>

          {/* Section: Rental & Financials */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#315A7D] border-b border-[#D9E0E6] pb-2">
              Rental &amp; Deposit
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Rent ($ USD)"
                type="number"
                min="0"
                step="25"
                placeholder="e.g. 3200"
                value={formData.monthlyRent}
                onChange={(e) => handleChange('monthlyRent', e.target.value)}
                error={errors.monthlyRent}
                required
              />

              <Input
                label="Security Deposit ($ USD)"
                type="number"
                min="0"
                step="25"
                placeholder="e.g. 3200"
                value={formData.securityDeposit}
                onChange={(e) => handleChange('securityDeposit', e.target.value)}
                error={errors.securityDeposit}
                required
              />
            </div>
          </div>

          {/* Section: Description */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#315A7D] border-b border-[#D9E0E6] pb-2">
              Description (Optional)
            </h2>

            <Textarea
              label="Unit Description"
              placeholder="Describe layout features, views, balconies, or interior fixtures..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#D9E0E6] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(backDestination)}
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
              {isEditMode ? 'Save Unit Changes' : 'Create Unit'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
