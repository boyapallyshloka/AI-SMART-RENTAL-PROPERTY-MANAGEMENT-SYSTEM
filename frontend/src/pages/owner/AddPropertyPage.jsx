import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import OwnerPropertyForm from '../../components/properties/OwnerPropertyForm'
import { addMockProperty } from '../../utils/ownerPropertyMockData'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function AddPropertyPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (data) => {
    setIsLoading(true)
    try {
      const created = addMockProperty(data)
      navigate(`/owner/properties/${created.id}`)
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
