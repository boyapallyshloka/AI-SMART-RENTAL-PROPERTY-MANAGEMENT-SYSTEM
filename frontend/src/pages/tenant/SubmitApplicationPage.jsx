import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getProperties, getPropertyDetails } from '../../api/propertyApi'
import { createApplication } from '../../api/applicationApi'
import {
  Button,
  Input,
  Select,
  Textarea,
  StatusBadge,
} from '../../components/ui'
import {
  FileCheck,
  Building2,
  IndianRupee,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Upload,
  RefreshCw,
} from 'lucide-react'

// INR Currency Formatter
const formatInr = (amount) => {
  if (amount == null || isNaN(Number(amount))) return null
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function SubmitApplicationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlPropertyId = searchParams.get('propertyId') || ''
  const urlUnitId = searchParams.get('unitId') || ''

  // Properties and Units from real backend API
  const [properties, setProperties] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState(urlPropertyId)
  const [propertyDetails, setPropertyDetails] = useState(null)
  const [units, setUnits] = useState([])
  const [selectedUnitId, setSelectedUnitId] = useState(urlUnitId)

  // Loading states
  const [isLoadingProps, setIsLoadingProps] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [loadError, setLoadError] = useState(null)

  // Applicant contact & financial information
  const [applicantName, setApplicantName] = useState(user?.name || user?.username || 'Elena Vance')
  const [applicantEmail, setApplicantEmail] = useState(user?.email || 'tenant@homesphere.com')
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210')
  const [monthlyIncome, setMonthlyIncome] = useState('85000')
  const [employer, setEmployer] = useState('Senior Software Engineer')
  const [moveInDate, setMoveInDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  )
  const [message, setMessage] = useState('')

  // Document Filenames (Visual form preservation)
  const [idFileName, setIdFileName] = useState('driver_license.pdf')
  const [incomeProofFileName, setIncomeProofFileName] = useState('salary_slips_recent.pdf')
  const [rentalHistoryFileName, setRentalHistoryFileName] = useState('prior_landlord_reference.pdf')

  // UI state
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  // Load properties on mount
  useEffect(() => {
    let isMounted = true
    const loadPropertiesList = async () => {
      setIsLoadingProps(true)
      setLoadError(null)
      try {
        const list = await getProperties()
        if (!isMounted) return
        const validList = Array.isArray(list) ? list : []
        setProperties(validList)

        // Select initial property
        if (urlPropertyId && validList.some((p) => String(p.propertyId || p.id) === String(urlPropertyId))) {
          setSelectedPropertyId(String(urlPropertyId))
        } else if (validList.length > 0) {
          setSelectedPropertyId(String(validList[0].propertyId || validList[0].id))
        }
      } catch (err) {
        console.error('Failed to load properties for application:', err)
        if (isMounted) {
          setLoadError(err?.message || 'Failed to load property list. Please try again.')
          setProperties([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingProps(false)
        }
      }
    }

    loadPropertiesList()
    return () => {
      isMounted = false
    }
  }, [urlPropertyId])

  // Load property details and units when selectedPropertyId changes
  useEffect(() => {
    if (!selectedPropertyId) {
      setPropertyDetails(null)
      setUnits([])
      setSelectedUnitId('')
      return
    }

    let isMounted = true
    const loadDetails = async () => {
      setIsLoadingDetails(true)
      try {
        const data = await getPropertyDetails(selectedPropertyId)
        if (!isMounted) return
        setPropertyDetails(data)

        // Flatten units across buildings -> floors -> units
        const rawUnits = (data?.buildings || []).flatMap((b) =>
          (b.floors || []).flatMap((f) =>
            (f.units || []).map((u) => ({
              ...u,
              buildingName: b.building?.buildingName,
              floorName:
                f.floor?.floorName ||
                (f.floor?.floorNumber != null ? `Floor ${f.floor.floorNumber}` : null),
            }))
          )
        )
        setUnits(rawUnits)

        // Pre-select unit if urlUnitId is present, or choose first unit
        if (urlUnitId && rawUnits.some((u) => String(u.unitId) === String(urlUnitId))) {
          setSelectedUnitId(String(urlUnitId))
        } else if (rawUnits.length > 0) {
          // Prefer available unit if possible
          const firstVacant = rawUnits.find((u) => (u.status || '').toUpperCase() === 'AVAILABLE')
          setSelectedUnitId(String(firstVacant ? firstVacant.unitId : rawUnits[0].unitId))
        } else {
          setSelectedUnitId('')
        }
      } catch (err) {
        console.error(`Failed to load details for property ${selectedPropertyId}:`, err)
        if (isMounted) {
          setPropertyDetails(null)
          setUnits([])
          setSelectedUnitId('')
        }
      } finally {
        if (isMounted) {
          setIsLoadingDetails(false)
        }
      }
    }

    loadDetails()
    return () => {
      isMounted = false
    }
  }, [selectedPropertyId, urlUnitId])

  // Selected Property and Unit objects
  const selectedProperty = useMemo(() => {
    return properties.find(
      (p) => String(p.propertyId || p.id) === String(selectedPropertyId)
    )
  }, [properties, selectedPropertyId])

  const selectedUnitObj = useMemo(() => {
    return units.find((u) => String(u.unitId) === String(selectedUnitId))
  }, [units, selectedUnitId])

  // Property dropdown options
  const propertyOptions = useMemo(() => {
    return properties.map((p) => {
      const pid = p.propertyId || p.id
      const type = p.propertyType ? ` (${String(p.propertyType).toLowerCase()})` : ''
      return {
        value: String(pid),
        label: `${p.propertyName || p.name || 'Property #' + pid}${type}`,
      }
    })
  }, [properties])

  // Unit dropdown options
  const unitOptions = useMemo(() => {
    if (units.length === 0) {
      return [{ value: '', label: '-- No units configured for this property --' }]
    }
    return [
      { value: '', label: '-- Select a Unit to Apply --' },
      ...units.map((u) => {
        const rentText = u.monthlyRent != null ? ` - ${formatInr(u.monthlyRent)}/mo` : ''
        const bedsText = u.bedrooms != null ? ` (${u.bedrooms === 0 ? 'Studio' : `${u.bedrooms} Bed`})` : ''
        const statusText = u.status ? ` [${u.status}]` : ''
        return {
          value: String(u.unitId),
          label: `Unit ${u.unitNumber || u.unitId}${bedsText}${rentText}${statusText}`,
        }
      }),
    ]
  }, [units])

  // Address formatted
  const formattedAddress = useMemo(() => {
    const addr = propertyDetails?.address
    if (!addr) return null
    const parts = [addr.addressLine1, addr.area, addr.city, addr.state, addr.pincode].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }, [propertyDetails])

  const validate = () => {
    const errs = {}
    if (!selectedPropertyId) errs.property = 'Please select a property'
    if (!selectedUnitId) errs.unit = 'Please select a specific unit to apply for'
    if (!applicantName.trim()) errs.applicantName = 'Applicant name is required'
    if (!applicantEmail.trim()) errs.applicantEmail = 'Email address is required'
    if (!phone.trim()) errs.phone = 'Phone number is required'
    if (!moveInDate) {
      errs.moveInDate = 'Preferred move-in date is required'
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(moveInDate)
      if (selectedDate < today) {
        errs.moveInDate = 'Preferred move-in date cannot be in the past'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Strictly submit only fields supported by backend RentalApplicationCreateRequest
      const payload = {
        unitId: Number(selectedUnitId),
        preferredMoveInDate: moveInDate || null,
        message: message && message.trim() ? message.trim() : null,
      }

      const result = await createApplication(payload)

      const appId = result?.applicationId ? `#${result.applicationId}` : ''
      const appStatus = result?.status || 'PENDING'

      setSuccessMessage(
        `Your rental application ${appId} for Unit ${selectedUnitObj?.unitNumber || ''} at ${
          selectedProperty?.propertyName || 'the property'
        } has been submitted successfully! Status: ${appStatus}. Redirecting to your applications...`
      )

      setTimeout(() => {
        navigate('/tenant/applications')
      }, 1800)
    } catch (err) {
      console.error('Failed to submit rental application:', err)
      let errorMsg =
        err?.message || 'Failed to submit rental application. Please check your inputs and try again.'

      if (err?.status === 400 && err?.message) {
        errorMsg = err.message
      } else if (err?.status === 404) {
        errorMsg =
          err?.message || 'Tenant profile or unit record not found. Please ensure your account is set up.'
      } else if (err?.isAuthError || err?.status === 401) {
        errorMsg = 'Your session has expired. Please sign in again.'
      } else if (err?.isForbidden || err?.status === 403) {
        errorMsg = 'Access restricted: Only authenticated tenants can submit rental applications.'
      }

      setSubmitError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="my-applications"
      pageTitle="Submit Rental Application"
    >
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5B6875]">
          <Link
            to="/tenant/applications"
            className="inline-flex items-center gap-1 hover:text-[#315A7D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Applications</span>
          </Link>
          <span>/</span>
          <span className="text-[#243447] font-medium">New Application</span>
        </div>

        {/* Success Notification */}
        {successMessage && (
          <div className="p-4 rounded-lg bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-[#3F7D58] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Submit Error Notification */}
        {submitError && (
          <div className="p-4 rounded-lg bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#E02424] shrink-0" />
              <span>{submitError}</span>
            </div>
          </div>
        )}

        {/* Load Error Notification */}
        {loadError && (
          <div className="p-4 rounded-lg bg-[#FEF7EC] border border-[#F4E2B6] text-[#8A5B16] text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#8A5B16] shrink-0" />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white text-[#8A5B16] border border-[#F4E2B6] text-xs font-semibold hover:bg-[#FEF7EC]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-[#315A7D] text-white">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243447]">
                  Apply for a Rental Unit
                </h1>
                <StatusBadge status="Available" size="sm" />
              </div>
              <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
                Submit an official rental application directly to the property manager
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Property & Unit Selection */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <Building2 className="w-4 h-4 text-[#315A7D]" />
              1. Target Property & Unit
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Select Property"
                  options={propertyOptions}
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  error={errors.property}
                  disabled={isLoadingProps}
                  required
                />
              </div>

              <div>
                <Select
                  label="Select Unit"
                  options={unitOptions}
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  error={errors.unit}
                  disabled={isLoadingDetails || units.length === 0}
                  required
                />
              </div>
            </div>

            {/* Selected Property Details banner */}
            {selectedProperty && (
              <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-xs text-[#5B6875] space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-sm text-[#243447]">
                    {selectedProperty.propertyName || selectedProperty.name}
                  </span>
                  {selectedProperty.propertyType && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF2F7] text-[#315A7D] uppercase">
                      {selectedProperty.propertyType}
                    </span>
                  )}
                </div>
                {formattedAddress && <p className="text-[#5B6875]">{formattedAddress}</p>}
              </div>
            )}

            {/* Selected Unit Details card */}
            {selectedUnitObj && (
              <div className="p-3.5 rounded-md bg-[#EAF2F7]/50 border border-[#315A7D]/20 text-xs text-[#243447] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#315A7D]">
                    Selected: Unit {selectedUnitObj.unitNumber}
                  </span>
                  {selectedUnitObj.status && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EDF7EE] text-[#2A583B] border border-[#C6DEC8]">
                      {selectedUnitObj.status}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[#5B6875]">
                  {selectedUnitObj.monthlyRent != null && (
                    <span>
                      Monthly Rent: <strong className="text-[#315A7D]">{formatInr(selectedUnitObj.monthlyRent)}/mo</strong>
                    </span>
                  )}
                  {selectedUnitObj.securityDeposit != null && (
                    <span>
                      Security Deposit: <strong className="text-[#243447]">{formatInr(selectedUnitObj.securityDeposit)}</strong>
                    </span>
                  )}
                  {selectedUnitObj.bedrooms != null && (
                    <span>Layout: {selectedUnitObj.bedrooms === 0 ? 'Studio' : `${selectedUnitObj.bedrooms} Bed`}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Personal & Contact Information */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <User className="w-4 h-4 text-[#315A7D]" />
              2. Applicant Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Jordan Taylor"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  error={errors.applicantName}
                  leftIcon={<User className="w-4 h-4 text-[#5B6875]" />}
                  required
                />
              </div>

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="tenant@example.com"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  error={errors.applicantEmail}
                  leftIcon={<Mail className="w-4 h-4 text-[#5B6875]" />}
                  required
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  leftIcon={<Phone className="w-4 h-4 text-[#5B6875]" />}
                  required
                />
              </div>

              <div>
                <Input
                  label="Preferred Move-In Date"
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  error={errors.moveInDate}
                  leftIcon={<Calendar className="w-4 h-4 text-[#5B6875]" />}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Employment Information */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <IndianRupee className="w-4 h-4 text-[#3F7D58]" />
              3. Employment & Monthly Income
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Monthly Gross Income (₹)"
                  type="number"
                  placeholder="e.g. 85000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  leftIcon={<IndianRupee className="w-4 h-4 text-[#5B6875]" />}
                  helperText="Verified in tenant profile"
                />
              </div>

              <div>
                <Input
                  label="Employer / Occupation"
                  placeholder="e.g. Software Engineer at Tech Corp"
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  leftIcon={<Briefcase className="w-4 h-4 text-[#5B6875]" />}
                />
              </div>
            </div>

            <div>
              <Textarea
                label="Optional Message or Notes for Property Manager"
                placeholder="Include details about preferred lease term, co-occupants, references, or specific questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Section 4: Document Uploads (Filename Placeholder) */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
              <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#315A7D]" />
                4. Supporting Documents (Filenames)
              </h2>
              <span className="text-[11px] text-[#5B6875]">Verified Profile Mode</span>
            </div>

            <p className="text-xs text-[#5B6875]">
              Document verification files registered under your tenant account.
            </p>

            <div className="space-y-3">
              <div>
                <Input
                  label="Government Photo ID Filename"
                  placeholder="e.g. aadhaar_pan_card.pdf"
                  value={idFileName}
                  onChange={(e) => setIdFileName(e.target.value)}
                  leftIcon={<Upload className="w-4 h-4 text-[#5B6875]" />}
                />
              </div>

              <div>
                <Input
                  label="Proof of Income Filename"
                  placeholder="e.g. paystubs_recent.pdf"
                  value={incomeProofFileName}
                  onChange={(e) => setIncomeProofFileName(e.target.value)}
                  leftIcon={<Upload className="w-4 h-4 text-[#5B6875]" />}
                />
              </div>

              <div>
                <Input
                  label="Rental Reference / History Filename (Optional)"
                  placeholder="e.g. landlord_recommendation.pdf"
                  value={rentalHistoryFileName}
                  onChange={(e) => setRentalHistoryFileName(e.target.value)}
                  leftIcon={<Upload className="w-4 h-4 text-[#5B6875]" />}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/tenant/applications">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>

            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
