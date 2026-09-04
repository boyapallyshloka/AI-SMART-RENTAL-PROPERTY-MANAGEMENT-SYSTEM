import React, { useState } from 'react'
import {
  Button,
  Input,
  Select,
  Textarea,
  StatusBadge,
  Loader,
  EmptyState,
} from '../ui'
import {
  Plus,
  Trash2,
  Download,
  Mail,
  Building2,
  Wrench,
  DollarSign,
  Sparkles,
  Layers,
} from 'lucide-react'

export default function UIShowcase() {
  const [btnLoading, setBtnLoading] = useState(false)
  const [sampleText, setSampleText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Available')

  const allStatuses = [
    'Available',
    'Occupied',
    'Pending',
    'Approved',
    'Rejected',
    'Paid',
    'Overdue',
    'Open',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
  ]

  const propertyTypeOptions = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condominium' },
    { value: 'single_family', label: 'Single Family Home' },
    { value: 'townhouse', label: 'Townhouse' },
  ]

  return (
    <div className="space-y-10">
      <div className="border-b border-[#D9E0E6] pb-4">
        <h2 className="text-xl font-bold text-[#243447]">
          HomeSphere UI Component Showcase
        </h2>
        <p className="text-xs text-[#5B6875] mt-1">
          Reusable UI library primitives including buttons, inputs, badges, loaders, and empty states.
        </p>
      </div>

      {/* 1. Buttons Showcase */}
      <section className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-4">
          <div>
            <h3 className="text-base font-semibold text-[#243447] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#315A7D]" />
              Button Variants & Sizes
            </h3>
            <p className="text-xs text-[#5B6875]">
              Primary, secondary, danger, outline with sizes, icons, and loading states
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBtnLoading(!btnLoading)}
          >
            Toggle Loading ({btnLoading ? 'Active' : 'Off'})
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-[#5B6875] uppercase tracking-wider mb-3">
              Variants
            </h4>
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Primary Button
              </Button>
              <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                Secondary Button
              </Button>
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                Danger Button
              </Button>
              <Button variant="outline">
                Outline Button
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#5B6875] uppercase tracking-wider mb-3">
              Sizes & States
            </h4>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm" variant="primary">Small</Button>
              <Button size="md" variant="primary">Medium</Button>
              <Button size="lg" variant="primary">Large</Button>
              <Button variant="primary" isLoading={btnLoading}>
                {btnLoading ? 'Saving...' : 'Dynamic Loading'}
              </Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Status Badges Showcase */}
      <section className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-6">
        <div className="border-b border-[#D9E0E6] pb-4">
          <h3 className="text-base font-semibold text-[#243447] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#315A7D]" />
            Status Badges (All 12 Required Labels)
          </h3>
          <p className="text-xs text-[#5B6875]">
            Color-coded status indicators for properties, tenancies, payments, and tickets
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {allStatuses.map((st) => (
            <div
              key={st}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#D9E0E6] bg-[#F7F8FA] gap-2"
            >
              <StatusBadge status={st} size="md" />
              <span className="text-[10px] text-[#5B6875] font-mono">{st}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Form Inputs Showcase */}
      <section className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-6">
        <div className="border-b border-[#D9E0E6] pb-4">
          <h3 className="text-base font-semibold text-[#243447]">
            Form Controls & Validation States
          </h3>
          <p className="text-xs text-[#5B6875]">
            Standard input, error input, select dropdown, and textarea
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Property Name"
            placeholder="e.g. Sunset Heights Unit 4B"
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            helperText="Enter a recognizable identification name"
            leftIcon={<Building2 className="w-4 h-4" />}
            required
          />

          <Input
            label="Monthly Rent (Error state)"
            placeholder="e.g. 1850"
            defaultValue="invalid_amount"
            error="Please enter a valid positive numeric amount"
            leftIcon={<DollarSign className="w-4 h-4" />}
            required
          />

          <Select
            label="Property Type"
            options={propertyTypeOptions}
            helperText="Categorize for tenancy agreements"
          />

          <Select
            label="Filter Status"
            options={allStatuses.map((s) => ({ value: s.toLowerCase(), label: s }))}
            value={selectedStatus.toLowerCase()}
            onChange={(e) => setSelectedStatus(e.target.value)}
          />

          <Textarea
            label="Special Instructions"
            placeholder="Provide any gate codes or entry instructions..."
            rows={3}
            helperText="Maximum 250 characters"
          />

          <Textarea
            label="Maintenance Notes (Error state)"
            rows={3}
            defaultValue="Issue: Pipe leakage"
            error="Notes must specify room location and severity"
            required
          />
        </div>
      </section>

      {/* 4. Loader Showcase */}
      <section className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-[#243447]">
          Loader Spinners
        </h3>
        <div className="flex flex-wrap items-center gap-8 py-2">
          <Loader size="xs" className="text-[#315A7D]" />
          <Loader size="sm" className="text-[#315A7D]" />
          <Loader size="md" className="text-[#315A7D]" />
          <Loader size="lg" className="text-[#315A7D]" />
          <Loader size="xl" className="text-[#315A7D]" />
          <Loader size="md" text="Syncing HomeSphere data..." className="text-[#315A7D]" />
        </div>
      </section>

      {/* 5. Empty State Showcase */}
      <section className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-[#243447]">
          EmptyState Component
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmptyState
            icon={<Building2 className="w-7 h-7" />}
            title="No properties listed yet"
            message="Get started by listing your first rental unit to track tenants, leases, and payments."
            action={
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => alert('Add Property action clicked')}
              >
                Add Property
              </Button>
            }
          />

          <EmptyState
            icon={<Wrench className="w-7 h-7" />}
            title="No open maintenance tickets"
            message="All property service requests are resolved. New tenant requests will appear here."
            action={{
              label: 'Create Work Order',
              onClick: () => alert('Create Work Order clicked'),
              variant: 'outline',
            }}
          />
        </div>
      </section>
    </div>
  )
}
