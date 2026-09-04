import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  addMaintenanceRequest,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
} from '../../utils/maintenanceMockData'
import { getStoredAgreements } from '../../utils/agreementMockData'
import {
  Button,
  Input,
  Select,
  Textarea,
  StatusBadge,
} from '../../components/ui'
import {
  Wrench,
  Building2,
  Calendar,
  AlertTriangle,
  Upload,
  ArrowLeft,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react'

export default function CreateMaintenanceRequestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Pre-fill tenant details from user profile and active agreement
  const tenantName = user?.name || 'Elena Rostova'
  const tenantEmail = user?.email || 'tenant@homesphere.com'
  const [propertyName, setPropertyName] = useState('Sunset Palms Luxury Residences')
  const [unitNumber, setUnitNumber] = useState('Unit #104')

  // Form Fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Plumbing')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')
  const [preferredVisitDate, setPreferredVisitDate] = useState('2026-09-08')
  const [attachmentFileName, setAttachmentFileName] = useState('issue_photo.jpg')

  // UI & Validation State
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Try to auto-detect property & unit from tenant's active agreement
    try {
      const agreements = getStoredAgreements()
      const myAgr = agreements.find(
        (a) =>
          (a.tenantEmail || '').toLowerCase().trim() === tenantEmail.toLowerCase().trim() ||
          (a.tenantName || '').toLowerCase().trim() === tenantName.toLowerCase().trim()
      )
      if (myAgr) {
        if (myAgr.propertyName) setPropertyName(myAgr.propertyName)
        if (myAgr.unit) setUnitNumber(myAgr.unit)
      }
    } catch (e) {}
  }, [tenantEmail, tenantName])

  const categoryOptions = MAINTENANCE_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }))

  const priorityOptions = MAINTENANCE_PRIORITIES.map((pri) => ({
    value: pri,
    label: `${pri} Priority`,
  }))

  const validate = () => {
    const errs = {}
    if (!title.trim()) errs.title = 'Issue title or summary is required'
    if (!category) errs.category = 'Please select a maintenance category'
    if (!priority) errs.priority = 'Please select a priority level'
    if (!description.trim()) errs.description = 'Please describe the issue or repair needed'
    if (!preferredVisitDate) errs.preferredVisitDate = 'Preferred visit date is required'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    const newRequestData = {
      tenantName,
      tenantEmail,
      propertyName,
      unitNumber,
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
      preferredVisitDate,
      attachmentFileName: attachmentFileName.trim(),
      status: 'Open',
    }

    addMaintenanceRequest(newRequestData)

    // Redirect to /tenant/maintenance with confirmation banner
    navigate('/tenant/maintenance', {
      state: {
        successMessage: `Maintenance request "${title.trim()}" submitted successfully. Ticket created with Open status.`,
      },
    })
  }

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="maintenance"
      pageTitle="Create Maintenance Request"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5B6875]">
          <Link
            to="/tenant/maintenance"
            className="inline-flex items-center gap-1 hover:text-[#315A7D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Maintenance</span>
          </Link>
          <span>/</span>
          <span className="text-[#243447] font-medium">
            New Maintenance Request
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-[#315A7D] text-white">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243447]">
                  Request Maintenance
                </h1>
                <StatusBadge status="Open" size="sm" />
              </div>
              <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
                Report an issue or request a facility repair for your rental unit
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Pre-filled Tenant & Property Information */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <Building2 className="w-4 h-4 text-[#315A7D]" />
              1. Location & Tenant Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                  Tenant
                </label>
                <div className="p-2.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-sm font-medium text-[#243447] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#5B6875] shrink-0" />
                  <span className="truncate">{tenantName}</span>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                  Leased Property
                </label>
                <div className="p-2.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-sm font-medium text-[#243447] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#5B6875] shrink-0" />
                  <span className="truncate">{propertyName}</span>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                  Unit Number
                </label>
                <div className="p-2.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-sm font-medium text-[#243447]">
                  {unitNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Issue Details */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <Wrench className="w-4 h-4 text-[#315A7D]" />
              2. Repair Information
            </h2>

            <div>
              <Input
                label="Issue Title / Short Summary"
                placeholder="e.g. Kitchen faucet leaking around base"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Category"
                  options={categoryOptions}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  error={errors.category}
                  required
                />
              </div>

              <div>
                <Select
                  label="Priority Level"
                  options={priorityOptions}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  error={errors.priority}
                  required
                />
              </div>
            </div>

            <div>
              <Textarea
                label="Detailed Description"
                placeholder="Describe what happened, exact location, when it started, and any symptoms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Section 3: Scheduling & Attachments */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <Calendar className="w-4 h-4 text-[#315A7D]" />
              3. Scheduling & Photos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Preferred Visit Date"
                  type="date"
                  value={preferredVisitDate}
                  onChange={(e) => setPreferredVisitDate(e.target.value)}
                  error={errors.preferredVisitDate}
                  leftIcon={<Calendar className="w-4 h-4 text-[#5B6875]" />}
                  helperText="Date when maintenance technician may inspect"
                  required
                />
              </div>

              <div>
                <Input
                  label="Photo / Attachment (Filename Only)"
                  placeholder="e.g. broken_latch_photo.jpg"
                  value={attachmentFileName}
                  onChange={(e) => setAttachmentFileName(e.target.value)}
                  leftIcon={<Upload className="w-4 h-4 text-[#5B6875]" />}
                  helperText="Filename placeholder (mock mode)"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/tenant/maintenance">
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
              Submit Maintenance Request
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
