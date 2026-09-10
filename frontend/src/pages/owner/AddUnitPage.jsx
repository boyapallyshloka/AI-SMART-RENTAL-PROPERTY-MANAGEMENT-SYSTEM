import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, Input, Select, Textarea, EmptyState, Loader } from '../../components/ui'
import { ArrowLeft, Home, Save, Layers, Building, Lock, AlertCircle } from 'lucide-react'
import {
  getUnitById,
  createUnit,
  updateUnit,
  formatUnitRequest,
  UNIT_TYPES,
  UNIT_STATUSES,
} from '../../api/unitApi'
import { getFloorById } from '../../api/floorApi'
import { getBuildingById } from '../../api/buildingApi'

export default function AddUnitPage() {
  const { buildingId, floorId, unitId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(unitId)

  const effectiveFloorId = floorId || searchParams.get('floorId')
  const effectiveBuildingId = buildingId || searchParams.get('buildingId')

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
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadInitData = async () => {
      setIsPageLoading(true)
      setErrorMessage('')
      try {
        if (isEditMode) {
          const res = await getUnitById(unitId)
          const existing = res?.data || res || null
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

            const uFloorId = existing.floorId || existing.floor?.floorId
            const uBuildingId = existing.buildingId || existing.floor?.building?.buildingId

            let flr = null
            if (uFloorId) {
              try {
                const fRes = await getFloorById(uFloorId)
                flr = fRes?.data || fRes || null
              } catch {
                flr = null
              }
            }
            if (!flr && (existing.floor || existing.floorName)) {
              flr = {
                floorId: uFloorId,
                floorName: existing.floorName || existing.floor?.floorName,
                floorNumber: existing.floorNumber ?? existing.floor?.floorNumber,
              }
            }
            setFloor(flr)

            let bld = null
            const bId = uBuildingId || flr?.buildingId || flr?.building?.buildingId
            if (bId) {
              try {
                const bRes = await getBuildingById(bId)
                bld = bRes?.data || bRes || null
              } catch {
                bld = null
              }
            }
            if (!bld && (existing.buildingName || flr?.buildingName)) {
              bld = {
                buildingId: bId,
                buildingName: existing.buildingName || flr?.buildingName,
              }
            }
            setBuilding(bld)
          } else {
            setNotFound(true)
          }
        } else {
          const targetFloorId = effectiveFloorId
          if (targetFloorId) {
            try {
              const fRes = await getFloorById(targetFloorId)
              const targetFloor = fRes?.data || fRes || null
              if (targetFloor) {
                setFloor(targetFloor)
                const bId =
                  targetFloor.buildingId ||
                  targetFloor.building?.buildingId ||
                  effectiveBuildingId
                if (bId) {
                  try {
                    const bRes = await getBuildingById(bId)
                    setBuilding(bRes?.data || bRes || targetFloor.building || null)
                  } catch {
                    setBuilding(targetFloor.building || null)
                  }
                }
              } else {
                setNotFound(true)
              }
            } catch (fErr) {
              console.error('Error fetching target floor:', fErr)
              setNotFound(true)
            }
          } else {
            setNotFound(true)
          }
        }
      } catch (err) {
        console.error('Error loading initial unit form data:', err)
        setErrorMessage(
          err?.response?.data?.message ||
            err?.data?.message ||
            err?.message ||
            'Failed to load unit context.'
        )
      } finally {
        setIsPageLoading(false)
      }
    }
    loadInitData()
  }, [buildingId, floorId, unitId, isEditMode, effectiveFloorId, effectiveBuildingId])

  const validate = () => {
    const errs = {}

    if (!formData.unitNumber || !formData.unitNumber.trim()) {
      errs.unitNumber = 'Unit number is required (e.g. 101, A-102).'
    }

    if (!formData.unitType || !['APARTMENT', 'ROOM'].includes(formData.unitType.toUpperCase())) {
      errs.unitType = 'Unit type must be APARTMENT or ROOM.'
    }

    const validStatuses = ['VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']
    if (!formData.status || !validStatuses.includes(formData.status.toUpperCase())) {
      errs.status = 'Occupancy status must be VACANT, OCCUPIED, RESERVED, or MAINTENANCE.'
    }

    const areaNum = Number(formData.area)
    if (formData.area === '' || formData.area === null || isNaN(areaNum) || areaNum < 0) {
      errs.area = 'Area must be 0 or greater.'
    }

    const bedNum = Number(formData.bedrooms)
    if (
      formData.bedrooms === '' ||
      formData.bedrooms === null ||
      isNaN(bedNum) ||
      bedNum < 0 ||
      !Number.isInteger(bedNum)
    ) {
      errs.bedrooms = 'Bedrooms must be a non-negative integer (0 or greater).'
    }

    const bathNum = Number(formData.bathrooms)
    if (formData.bathrooms === '' || formData.bathrooms === null || isNaN(bathNum) || bathNum < 0) {
      errs.bathrooms = 'Bathrooms must be 0 or greater.'
    }

    const rentNum = Number(formData.monthlyRent)
    if (formData.monthlyRent === '' || formData.monthlyRent === null || isNaN(rentNum) || rentNum < 0) {
      errs.monthlyRent = 'Monthly rent must be 0 or greater.'
    }

    const depositNum = Number(formData.securityDeposit)
    if (formData.securityDeposit === '' || formData.securityDeposit === null || isNaN(depositNum) || depositNum < 0) {
      errs.securityDeposit = 'Security deposit must be 0 or greater.'
    }

    const targetFloorId = Number(floor?.floorId || effectiveFloorId)
    if (!targetFloorId || isNaN(targetFloorId) || targetFloorId <= 0) {
      errs.floorId = 'Valid floor association is required.'
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
    if (isSubmitting) return
    if (!validate()) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const targetFloorId = Number(floor?.floorId || effectiveFloorId)
      const payload = formatUnitRequest({
        unitNumber: formData.unitNumber,
        unitType: formData.unitType,
        area: formData.area,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        monthlyRent: formData.monthlyRent,
        securityDeposit: formData.securityDeposit,
        status: formData.status,
        description: formData.description,
        floorId: targetFloorId,
      })

      if (isEditMode) {
        await updateUnit(unitId, payload)
        navigate(`/owner/units/${unitId}`, {
          state: {
            toastMessage: `Unit "${payload.unitNumber}" was updated successfully.`,
          },
        })
      } else {
        await createUnit(payload)
        const targetBId = building?.buildingId || effectiveBuildingId
        navigate(`/owner/buildings/${targetBId}/floors/${targetFloorId}`, {
          state: {
            toastMessage: `Unit "${payload.unitNumber}" was created successfully.`,
          },
        })
      }
    } catch (err) {
      console.error('Failed to save unit:', err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        'Failed to save unit. Please check the entered values and try again.'
      setErrorMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Back destination
  const targetBuildingId = building?.buildingId || effectiveBuildingId
  const targetFloorId = floor?.floorId || effectiveFloorId
  const backDestination = isEditMode
    ? `/owner/units/${unitId}`
    : `/owner/buildings/${targetBuildingId}/floors/${targetFloorId}`

  if (isPageLoading) {
    return (
      <DashboardLayout
        defaultRole="owner"
        activeItem="buildings"
        pageTitle={isEditMode ? 'Loading Unit...' : 'Loading Floor Context...'}
      >
        <div className="flex items-center justify-center min-h-[350px]">
          <Loader text={isEditMode ? 'Loading unit data...' : 'Loading floor details...'} />
        </div>
      </DashboardLayout>
    )
  }

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
                : `Target floor "${effectiveFloorId}" was not found.`
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

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-[#FDF2F2] border border-[#F8D7DA] text-[#B94A48] text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B94A48] shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-[#B94A48] hover:text-[#8C3836] text-base leading-none px-1"
            >
              &times;
            </button>
          </div>
        )}

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
                Building: <strong>{building?.buildingName || 'Assigned Building'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#243447]">
              <Layers className="w-4 h-4 text-[#315A7D]" />
              <span>
                Target Floor:{' '}
                <strong>
                  {floor?.floorName || `Floor ${floor?.floorNumber ?? ''}`} (Level {floor?.floorNumber ?? 0})
                </strong>
              </span>
            </div>
          </div>

          {/* Floor Locking Note in Edit Mode */}
          {isEditMode && (
            <div className="flex items-center gap-2 text-xs text-[#5B6875] bg-[#F7F8FA] px-3.5 py-2.5 rounded-lg border border-[#D9E0E6]">
              <Lock className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
              <span>Floor and building assignment are locked to this unit's registered location.</span>
            </div>
          )}

          {errors.floorId && (
            <p className="text-xs text-[#B94A48] font-medium">{errors.floorId}</p>
          )}

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
                min="0"
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
                label="Monthly Rent (₹ INR)"
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
                label="Security Deposit (₹ INR)"
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
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
