import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getMockProperties } from '../../utils/ownerPropertyMockData'
import { getStoredApplications } from '../../utils/applicationMockData'
import { addAgreement } from '../../utils/agreementMockData'
import {
  Button,
  Input,
  Select,
  Textarea,
  StatusBadge,
} from '../../components/ui'
import {
  FileText,
  Building2,
  User,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Shield,
  FileCheck,
} from 'lucide-react'

export default function CreateAgreementPage() {
  const navigate = useNavigate()

  // Dropdown data sources
  const [properties, setProperties] = useState([])
  const [applicants, setApplicants] = useState([])

  // Form Fields
  const [tenantName, setTenantName] = useState('')
  const [tenantEmail, setTenantEmail] = useState('')
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [unit, setUnit] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('')
  const [startDate, setStartDate] = useState('2026-10-01')
  const [endDate, setEndDate] = useState('2027-09-30')
  const [rentDueDay, setRentDueDay] = useState('1st of the month')
  const [noticePeriod, setNoticePeriod] = useState('60 days')
  const [notes, setNotes] = useState(
    'Standard 12-month residential lease. No subleasing without written consent. Landlord responsible for building maintenance and water services.'
  )

  // Validation & UI State
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const propList = getMockProperties()
    const appList = getStoredApplications()

    setProperties(propList)
    setApplicants(appList)

    // Pre-populate with first property & tenant if available
    if (propList.length > 0) {
      setSelectedPropertyId(propList[0].id)
      setUnit('Unit #302')
      setMonthlyRent(String(propList[0].rent || 3400))
      setSecurityDeposit(String(propList[0].rent || 3400))
    }

    if (appList.length > 0) {
      setTenantName(appList[0].applicantName)
      setTenantEmail(appList[0].email || '')
    }
  }, [])

  // When property selection changes, auto-update rent & unit suggestions
  const handlePropertyChange = (propId) => {
    setSelectedPropertyId(propId)
    const selected = properties.find((p) => String(p.id) === String(propId))
    if (selected) {
      setMonthlyRent(String(selected.rent || 3000))
      setSecurityDeposit(String(selected.rent || 3000))
    }
  }

  // When applicant selection changes, auto-fill tenant info
  const handleApplicantSelect = (appName) => {
    setTenantName(appName)
    const found = applicants.find((a) => a.applicantName === appName)
    if (found) {
      setTenantEmail(found.email || '')
      if (found.propertyName) {
        const matchingProp = properties.find((p) => p.name === found.propertyName)
        if (matchingProp) {
          setSelectedPropertyId(matchingProp.id)
        }
      }
      if (found.unit) {
        setUnit(found.unit)
      }
    }
  }

  const selectedProperty = properties.find(
    (p) => String(p.id) === String(selectedPropertyId)
  )

  const propertyOptions = properties.map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.city}, ${p.state})`,
  }))

  const applicantOptions = [
    { value: '', label: '-- Custom Tenant Name --' },
    ...applicants.map((a) => ({
      value: a.applicantName,
      label: `${a.applicantName} (${a.propertyName || 'Applicant'})`,
    })),
  ]

  const rentDueDayOptions = [
    { value: '1st of the month', label: '1st of the month' },
    { value: '5th of the month', label: '5th of the month' },
    { value: '15th of the month', label: '15th of the month' },
    { value: 'Last day of the month', label: 'Last day of the month' },
  ]

  const noticePeriodOptions = [
    { value: '30 days', label: '30 days notice' },
    { value: '60 days', label: '60 days notice' },
    { value: '90 days', label: '90 days notice' },
  ]

  const validate = () => {
    const errs = {}
    if (!tenantName.trim()) errs.tenantName = 'Tenant name is required'
    if (!selectedPropertyId) errs.property = 'Please select a property'
    if (!unit.trim()) errs.unit = 'Unit number is required'
    if (!monthlyRent || Number(monthlyRent) <= 0) {
      errs.monthlyRent = 'Please enter a valid monthly rent'
    }
    if (!securityDeposit || Number(securityDeposit) < 0) {
      errs.securityDeposit = 'Please enter a security deposit amount'
    }
    if (!startDate) errs.startDate = 'Start date is required'
    if (!endDate) errs.endDate = 'End date is required'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    const agreementPayload = {
      tenantName: tenantName.trim(),
      tenantEmail: tenantEmail.trim(),
      propertyName: selectedProperty?.name || 'Selected Property',
      unit: unit.trim(),
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit),
      startDate,
      endDate,
      rentDueDay,
      noticePeriod,
      notes: notes.trim(),
      status: 'Draft',
    }

    addAgreement(agreementPayload)

    // Redirect to /owner/agreements with success notification
    navigate('/owner/agreements', {
      state: {
        successMessage: `Draft lease agreement for ${tenantName.trim()} (${unit.trim()}) created successfully!`,
      },
    })
  }

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="agreements"
      pageTitle="Create Lease Agreement"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5B6875]">
          <Link
            to="/owner/agreements"
            className="inline-flex items-center gap-1 hover:text-[#315A7D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Agreements</span>
          </Link>
          <span>/</span>
          <span className="text-[#243447] font-semibold">
            New Lease Agreement
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#315A7D] text-white shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                  Create Lease Agreement
                </h1>
                <StatusBadge status="Draft" size="sm" />
              </div>
              <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
                Draft a legally binding residential lease agreement with custom financial terms
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Tenant & Application Selection */}
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <User className="w-4 h-4 text-[#315A7D]" />
              1. Tenant Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Select from Approved Applicants (Optional)"
                  options={applicantOptions}
                  onChange={(e) => handleApplicantSelect(e.target.value)}
                  helperText="Select to auto-populate tenant name and email"
                />
              </div>

              <div>
                <Input
                  label="Tenant Full Legal Name"
                  placeholder="e.g. David Chen"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  error={errors.tenantName}
                  leftIcon={<User className="w-4 h-4 text-[#5B6875]" />}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Tenant Email Address"
                  type="email"
                  placeholder="tenant@example.com"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  leftIcon={<FileCheck className="w-4 h-4 text-[#5B6875]" />}
                  helperText="Used for sending digital signature notifications"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Property & Unit Assignment */}
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <Building2 className="w-4 h-4 text-[#315A7D]" />
              2. Property & Leased Unit
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Property"
                  options={propertyOptions}
                  value={selectedPropertyId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  error={errors.property}
                  required
                />
              </div>

              <div>
                <Input
                  label="Unit Number"
                  placeholder="e.g. Unit #302"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  error={errors.unit}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Terms & Rent Schedule */}
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <DollarSign className="w-4 h-4 text-[#3F7D58]" />
              3. Financial Terms
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Monthly Rent ($)"
                  type="number"
                  placeholder="e.g. 3400"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  error={errors.monthlyRent}
                  leftIcon={<DollarSign className="w-4 h-4 text-[#5B6875]" />}
                  required
                />
              </div>

              <div>
                <Input
                  label="Security Deposit ($)"
                  type="number"
                  placeholder="e.g. 3400"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  error={errors.securityDeposit}
                  leftIcon={<Shield className="w-4 h-4 text-[#5B6875]" />}
                  required
                />
              </div>

              <div>
                <Select
                  label="Rent Due Day"
                  options={rentDueDayOptions}
                  value={rentDueDay}
                  onChange={(e) => setRentDueDay(e.target.value)}
                />
              </div>

              <div>
                <Select
                  label="Notice Period"
                  options={noticePeriodOptions}
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Lease Duration Dates & Notes */}
          <div className="bg-white rounded-2xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <Calendar className="w-4 h-4 text-[#315A7D]" />
              4. Lease Term Dates & Special Provisions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Lease Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  error={errors.startDate}
                  leftIcon={<Calendar className="w-4 h-4 text-[#5B6875]" />}
                  required
                />
              </div>

              <div>
                <Input
                  label="Lease End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  error={errors.endDate}
                  leftIcon={<Clock className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>
            </div>

            <div>
              <Textarea
                label="Agreement Notes, Rules & Special Terms"
                placeholder="Specify pet clauses, parking stalls, utility responsibilities, or HOA regulations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/owner/agreements">
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
              Save as Draft Agreement
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
