import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import OwnerPropertyForm from '../../components/properties/OwnerPropertyForm'
import { createProperty, buildPropertyRequestPayload } from '../../api/propertyApi'
import { ArrowLeft, Building2, AlertCircle } from 'lucide-react'

export default function AddPropertyPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (data) => {
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const payload = buildPropertyRequestPayload(data)
      const response = await createProperty(payload)
      const created = response?.data || response
      const createdId = created?.propertyId || created?.id
      if (createdId) {
        navigate(`/owner/properties/${createdId}`, {
          state: { toastMessage: 'Property published successfully.' },
        })
      } else {
        navigate('/owner/properties', {
          state: { toastMessage: 'Property published successfully.' },
        })
      }
    } catch (err) {
      console.error('Failed to create property:', err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to publish property. Please check your inputs and try again.'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="properties"
      pageTitle="Add Property"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5B6875]">
          <Link
            to="/owner/properties"
            className="inline-flex items-center gap-1 hover:text-[#315A7D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Properties</span>
          </Link>
          <span>/</span>
          <span className="text-[#243447] font-semibold">
            Add New Property
          </span>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold ml-4"
            >
              &times;
            </button>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-[#D9E0E6] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#315A7D] text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                Add New Property
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
                Register a new rental building, condo, or single-family residence
              </p>
            </div>
          </div>
        </div>

        {/* Property Form */}
        <OwnerPropertyForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/owner/properties')}
          isLoading={isLoading}
          submitLabel="Publish Property"
        />
      </div>
    </DashboardLayout>
  )
}
