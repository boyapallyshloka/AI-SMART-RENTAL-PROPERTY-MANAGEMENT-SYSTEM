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
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/owner/properties"
            className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Properties</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">
            Add New Property
          </span>
        </div>

        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Add New Property
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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
