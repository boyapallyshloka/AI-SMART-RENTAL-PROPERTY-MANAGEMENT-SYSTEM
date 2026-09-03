import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getMockProperties } from '../../utils/ownerPropertyMockData'
import { addApplication } from '../../utils/applicationMockData'
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
  DollarSign,
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
} from 'lucide-react'

export default function SubmitApplicationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Properties list from mock data
  const [properties, setProperties] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')

  // Applicant contact & financial information
  const [applicantName, setApplicantName] = useState(user?.name || 'Elena Rostova')
  const [applicantEmail, setApplicantEmail] = useState(user?.email || 'tenant@homesphere.com')
  const [phone, setPhone] = useState('(415) 555-0182')
  const [monthlyIncome, setMonthlyIncome] = useState('8500')
  const [employer, setEmployer] = useState('Senior Product Designer at NovaTech Inc.')
  const [moveInDate, setMoveInDate] = useState('2026-10-01')
  const [message, setMessage] = useState('')

  // Document Filenames (Filename only - no real upload)
  const [idFileName, setIdFileName] = useState('driver_license_jordan.pdf')
  const [incomeProofFileName, setIncomeProofFileName] = useState('paystubs_recent_3mo.pdf')
  const [rentalHistoryFileName, setRentalHistoryFileName] = useState('prior_landlord_reference.pdf')

  // UI state
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const list = getMockProperties()
    setProperties(list)
    if (list.length > 0) {
      setSelectedPropertyId(list[0].id)
      setSelectedUnit('Unit #101')
    }
  }, [])

  // Selected property object
  const selectedProperty = properties.find((p) => String(p.id) === String(selectedPropertyId))

  const propertyOptions = properties.map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.city}, ${p.state})`,
  }))

  const unitOptions = [
    { value: 'Unit #101', label: 'Unit #101 - 1 Bed, 1 Bath ($2,450/mo)' },
    { value: 'Unit #202', label: 'Unit #202 - 2 Bed, 2 Bath ($3,200/mo)' },
    { value: 'Unit #304', label: 'Unit #304 - 2 Bed, 2.5 Bath ($3,800/mo)' },
    { value: 'Penthouse #501', label: 'Penthouse #501 - 3 Bed, 3 Bath ($5,400/mo)' },
  ]

  const validate = () => {
    const errs = {}
    if (!applicantName.trim()) errs.applicantName = 'Applicant name is required'
    if (!applicantEmail.trim()) errs.applicantEmail = 'Email address is required'
    if (!phone.trim()) errs.phone = 'Phone number is required'
    if (!monthlyIncome || Number(monthlyIncome) <= 0) {
      errs.monthlyIncome = 'Please enter a valid monthly income'
    }
    if (!employer.trim()) errs.employer = 'Employer or occupation is required'
    if (!moveInDate) errs.moveInDate = 'Preferred move-in date is required'
    if (!selectedPropertyId) errs.property = 'Please select a property'
    if (!selectedUnit) errs.unit = 'Please select a unit'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    // Construct application payload
    const newApplication = {
      applicantName: applicantName.trim(),
      email: applicantEmail.trim(),
      phone: phone.trim(),
      employmentStatus: employer.trim(),
      propertyName: selectedProperty?.name || 'Selected Property',
      unit: selectedUnit,
      monthlyIncome: Number(monthlyIncome),
      preferredMoveInDate: moveInDate,
      message: message.trim(),
      documents: [
        { title: 'ID Proof', filename: idFileName },
        { title: 'Income Proof', filename: incomeProofFileName },
        { title: 'Rental History', filename: rentalHistoryFileName },
      ].filter((d) => Boolean(d.filename)),
    }

    // Persist to mock data and localStorage
    addApplication(newApplication)

    setSuccessMessage(
      `Your rental application for ${selectedProperty?.name || 'the selected property'} has been submitted successfully! Redirecting to applications...`
    )

    // Redirect to /tenant/applications after brief timeout so user sees confirmation
    setTimeout(() => {
      navigate('/tenant/applications')
    }, 1500)
  }

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="my-applications"
      pageTitle="Submit Rental Application"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/tenant/dashboard"
            className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">
            Rental Application
          </span>
        </div>

        {/* Success Notification */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Apply for a Rental Unit
                </h1>
                <StatusBadge status="Available" size="sm" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Complete and submit your tenant profile for property manager review
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Property & Unit Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              1. Desired Property & Unit
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Select Property"
                  options={propertyOptions}
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  error={errors.property}
                  required
                />
              </div>

              <div>
                <Select
                  label="Select Unit"
                  options={unitOptions}
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  error={errors.unit}
                  required
                />
              </div>
            </div>

            {selectedProperty && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedProperty.name}
                  </span>
                  <span className="text-slate-400 block">
                    {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
                  </span>
                </div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  ${selectedProperty.rent?.toLocaleString()}/mo
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Personal & Contact Information */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
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
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
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
                  leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Employment Information */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              3. Employment & Monthly Income
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Monthly Gross Income ($)"
                  type="number"
                  placeholder="e.g. 8500"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  error={errors.monthlyIncome}
                  leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
                  helperText="Required for rent-to-income verification"
                  required
                />
              </div>

              <div>
                <Input
                  label="Employer / Occupation"
                  placeholder="e.g. Software Engineer at Tech Corp"
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  error={errors.employer}
                  leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>
            </div>

            <div>
              <Textarea
                label="Optional Message or Notes for Property Manager"
                placeholder="Include details about lease duration, co-occupants, pets, or parking needs..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Section 4: Document Uploads (Filename Placeholder) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                4. Supporting Documents (Filenames)
              </h2>
              <span className="text-[11px] text-slate-400">Mock Filename Mode</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide filenames for your verification files. Real document uploads will connect to secure cloud storage in a future release.
            </p>

            <div className="space-y-3">
              <div>
                <Input
                  label="Government Photo ID Filename"
                  placeholder="e.g. passport_scan.pdf"
                  value={idFileName}
                  onChange={(e) => setIdFileName(e.target.value)}
                  leftIcon={<Upload className="w-4 h-4 text-slate-400" />}
                  helperText="Driver's License, State ID, or Passport"
                />
              </div>

              <div>
                <Input
                  label="Proof of Income Filename"
                  placeholder="e.g. paystubs_recent.pdf"
                  value={incomeProofFileName}
                  onChange={(e) => setIncomeProofFileName(e.target.value)}
                  leftIcon={<Upload className="w-4 h-4 text-slate-400" />}
                  helperText="Recent paystubs, W-2, or offer letter"
                />
              </div>

              <div>
                <Input
                  label="Rental Reference / History Filename (Optional)"
                  placeholder="e.g. landlord_recommendation.pdf"
                  value={rentalHistoryFileName}
                  onChange={(e) => setRentalHistoryFileName(e.target.value)}
                  leftIcon={<Upload className="w-4 h-4 text-slate-400" />}
                  helperText="Prior landlord reference letter or ledger"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/tenant/dashboard">
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
