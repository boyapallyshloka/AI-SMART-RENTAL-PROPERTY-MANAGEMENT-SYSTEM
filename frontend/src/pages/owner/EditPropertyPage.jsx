import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import OwnerPropertyForm from '../../components/properties/OwnerPropertyForm'
import {
  getMockPropertyById,
  updateMockProperty,
} from '../../utils/ownerPropertyMockData'
import { Button, EmptyState } from '../../components/ui'
import { ArrowLeft, Building2, Edit } from 'lucide-react'

export default function EditPropertyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const found = getMockPropertyById(id)
    setProperty(found)
  }, [id])

  if (!property) {
    return (
      <DashboardLayout
        defaultRole="owner"
        activeItem="properties"
        pageTitle="Edit Property"
      >
        <div className="max-w-3xl mx-auto py-12">
          <EmptyState
            icon={<Building2 className="w-8 h-8" />}
            title="Property Not Found"
            message={`We could not find any property matching ID "${id}".`}
            action={
              <Link to="/owner/properties">
                <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Properties
                </Button>
              </Link>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

  const handleSubmit = (updatedData) => {
    setIsLoading(true)
    try {
      updateMockProperty(id, updatedData)
      navigate(`/owner/properties/${id}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="properties"
      pageTitle={`Edit ${property.name}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#5B6875]">
          <Link
            to="/owner/properties"
            className="hover:text-[#315A7D] transition-colors"
          >
            Properties
          </Link>
          <span>/</span>
          <Link
            to={`/owner/properties/${property.id}`}
            className="hover:text-[#315A7D] transition-colors truncate max-w-[200px]"
          >
            {property.name}
          </Link>
          <span>/</span>
          <span className="text-[#243447] font-semibold">Edit</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#D9E0E6] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#315A7D] text-white shadow-sm">
              <Edit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                Edit Property Details
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
                Update specifications, rent pricing, amenities, and media assets
              </p>
            </div>
          </div>
        </div>

        {/* Form Pre-populated */}
        <OwnerPropertyForm
          initialData={property}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/owner/properties/${property.id}`)}
          isLoading={isLoading}
          submitLabel="Save Changes"
        />
      </div>
    </DashboardLayout>
  )
}
