import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, Loader } from '../../components/ui'
import {
  Building2,
  Users,
  DollarSign,
  Wrench,
  Sparkles,
  Plus,
  ArrowRight,
} from 'lucide-react'

export default function OwnerDashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="dashboard"
      pageTitle="Owner Dashboard"
    >
      {loading ? (
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-12 shadow-2xs flex justify-center">
          <Loader text="Loading property portfolio..." size="md" center />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="rounded-lg bg-[#315A7D] p-6 sm:p-8 text-white border border-[#274B68] shadow-xs">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#274B68] text-[#EAF2F7] border border-[#315A7D]">
                <Sparkles className="w-3.5 h-3.5 text-[#EAF2F7]" />
                <span>Portfolio Overview & Analytics</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
                Welcome back, {user?.name || 'Marcus'}!
              </h1>
              <p className="text-xs sm:text-sm text-[#EAF2F7]/90">
                You are managing 12 rental units across 3 properties with 91.7% active occupancy.
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Properties"
              value="12 Units"
              subtitle="Across 3 properties"
              change="+2 this quarter"
              icon={<Building2 className="w-4 h-4 text-[#315A7D]" />}
            />
            <MetricCard
              title="Active Occupancy"
              value="91.7%"
              subtitle="11 of 12 occupied"
              change="Optimal rate"
              icon={<Users className="w-4 h-4 text-[#3F7D58]" />}
            />
            <MetricCard
              title="Monthly Revenue"
              value="$24,850"
              subtitle="Collected this month"
              change="+4.8% vs last month"
              icon={<DollarSign className="w-4 h-4 text-[#315A7D]" />}
            />
            <MetricCard
              title="Open Maintenance"
              value="2 Tickets"
              subtitle="1 plumbing, 1 electrical"
              change="Within SLA"
              icon={<Wrench className="w-4 h-4 text-[#B7791F]" />}
            />
          </div>

          {/* Portfolio Status Table Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                <div>
                  <h2 className="text-base font-semibold text-[#243447]">
                    Property Portfolio Status
                  </h2>
                  <p className="text-xs text-[#5B6875]">Live rental availability</p>
                </div>
                <Link to="/owner/properties">
                  <Button size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    View All Units
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-[#D9E0E6]">
                {[
                  { unit: 'Sunset Palms #302', type: '2 Bed, 2 Bath', rent: '$2,400', status: 'Occupied' },
                  { unit: 'Sunset Palms #104', type: '1 Bed, 1 Bath', rent: '$1,850', status: 'Available' },
                  { unit: 'Highland Oaks #201', type: '3 Bed, 2 Bath', rent: '$3,100', status: 'Pending' },
                  { unit: 'Metro Lofts #512', type: 'Studio', rent: '$1,650', status: 'Occupied' },
                ].map((prop, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-[#243447]">{prop.unit}</p>
                      <p className="text-xs text-[#5B6875]">{prop.type} &bull; {prop.rent}/mo</p>
                    </div>
                    <StatusBadge status={prop.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
              <h2 className="text-base font-semibold text-[#243447]">
                Owner Quick Actions
              </h2>
              <div className="space-y-2.5">
                <Link to="/owner/agreements/new" className="block">
                  <Button variant="primary" className="w-full justify-start" leftIcon={<Plus className="w-4 h-4" />}>
                    Create Lease Agreement
                  </Button>
                </Link>
                <Link to="/owner/payments" className="block">
                  <Button variant="secondary" className="w-full justify-start" leftIcon={<DollarSign className="w-4 h-4" />}>
                    Record Rent Payment
                  </Button>
                </Link>
                <Link to="/owner/maintenance" className="block">
                  <Button variant="secondary" className="w-full justify-start" leftIcon={<Wrench className="w-4 h-4" />}>
                    Dispatch Maintenance
                  </Button>
                </Link>
              </div>

              <div className="pt-3 border-t border-[#D9E0E6]">
                <div className="p-3 rounded-md bg-[#EAF2F7] border border-[#D9E0E6] text-xs">
                  <p className="font-semibold text-[#243447] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#315A7D]" />
                    Occupancy Recommendation
                  </p>
                  <p className="text-[#5B6875] mt-1 leading-relaxed">
                    Sunset Palms #104 has 4 pending tenant inquiries. Schedule an inspection this Saturday to optimize lease velocity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function MetricCard({ title, value, subtitle, change, icon }) {
  return (
    <div className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">{title}</span>
        <div className="w-8 h-8 rounded-md bg-[#EAF2F7] flex items-center justify-center">{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-[#243447]">{value}</p>
        <p className="text-xs text-[#5B6875] mt-0.5">{subtitle}</p>
      </div>
      <div className="pt-2 border-t border-[#D9E0E6]">
        <span className="text-[11px] font-medium text-[#315A7D]">
          {change}
        </span>
      </div>
    </div>
  )
}
