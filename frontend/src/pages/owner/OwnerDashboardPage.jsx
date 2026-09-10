import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, Loader } from '../../components/ui'
import {
  Building2,
  Users,
  IndianRupee,
  Wrench,
  Plus,
  ArrowRight,
  CreditCard,
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
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
          <div className="rounded-lg bg-[#315A7D] p-6 sm:p-7 text-white border border-[#274B68] shadow-xs">
            <div className="max-w-2xl space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#274B68] text-[#EAF2F7] border border-[#315A7D]">
                <Building2 className="w-3.5 h-3.5 text-[#EAF2F7]" />
                <span>Portfolio Overview</span>
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
              icon={<Building2 className="w-4 h-4 text-[#315A7D]" />}
            />
            <MetricCard
              title="Active Occupancy"
              value="91.7%"
              subtitle="11 of 12 units occupied"
              icon={<Users className="w-4 h-4 text-[#3F7D58]" />}
            />
            <MetricCard
              title="Monthly Revenue"
              value="₹24,850"
              subtitle="Collected this month"
              icon={<IndianRupee className="w-4 h-4 text-[#315A7D]" />}
            />
            <MetricCard
              title="Open Maintenance"
              value="2 Tickets"
              subtitle="1 plumbing, 1 electrical"
              icon={<Wrench className="w-4 h-4 text-[#B7791F]" />}
            />
          </div>

          {/* Main Grid: Property Status & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Status Table Preview */}
            <div className="lg:col-span-2 rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                <div>
                  <h2 className="text-base font-semibold text-[#243447]">
                    Property Status
                  </h2>
                  <p className="text-xs text-[#5B6875]">Current availability across units</p>
                </div>
                <Link to="/owner/properties">
                  <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View All Units
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-[#D9E0E6]">
                {[
                  { unit: 'Sunset Palms #302', type: '2 Bed, 2 Bath', rent: '₹2,400', status: 'Occupied' },
                  { unit: 'Sunset Palms #104', type: '1 Bed, 1 Bath', rent: '₹1,850', status: 'Available' },
                  { unit: 'Highland Oaks #201', type: '3 Bed, 2 Bath', rent: '₹3,100', status: 'Pending' },
                  { unit: 'Metro Lofts #512', type: 'Studio', rent: '₹1,650', status: 'Occupied' },
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
            <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#243447]">
                  Quick Actions
                </h2>
                <p className="text-xs text-[#5B6875] mt-0.5">Common property tasks</p>
                <div className="space-y-2.5 mt-3">
                  <Link to="/owner/agreements/new" className="block">
                    <Button variant="primary" className="w-full justify-start" leftIcon={<Plus className="w-4 h-4" />}>
                      Create Lease Agreement
                    </Button>
                  </Link>
                  <Link to="/owner/payments" className="block">
                    <Button variant="secondary" className="w-full justify-start" leftIcon={<IndianRupee className="w-4 h-4" />}>
                      Record Rent Payment
                    </Button>
                  </Link>
                  <Link to="/owner/maintenance" className="block">
                    <Button variant="secondary" className="w-full justify-start" leftIcon={<Wrench className="w-4 h-4" />}>
                      Dispatch Maintenance
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D9E0E6]">
                <div className="p-3 rounded-md bg-[#EAF2F7] border border-[#D9E0E6] text-xs">
                  <p className="font-semibold text-[#243447] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#315A7D]" />
                    Suggested Action
                  </p>
                  <p className="text-[#5B6875] mt-1 leading-relaxed">
                    Sunset Palms #104 has 4 pending inquiries. Schedule a viewing to fill the vacancy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Second Grid: Recent Activity & Upcoming */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                <div>
                  <h2 className="text-base font-semibold text-[#243447]">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-[#5B6875]">Latest events across your properties</p>
                </div>
                <Link to="/owner/reports">
                  <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Activity Log
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-[#D9E0E6]">
                {[
                  {
                    description: 'Rent payment received (₹2,400)',
                    property: 'Sunset Palms #302',
                    time: 'Today, 9:42 AM',
                    icon: <CreditCard className="w-4 h-4 text-[#3F7D58]" />,
                  },
                  {
                    description: 'Maintenance ticket resolved (HVAC servicing)',
                    property: 'Metro Lofts #512',
                    time: 'Yesterday, 3:15 PM',
                    icon: <Wrench className="w-4 h-4 text-[#315A7D]" />,
                  },
                  {
                    description: 'New tenant application submitted',
                    property: 'Highland Oaks #201',
                    time: 'Sep 5, 2:30 PM',
                    icon: <FileText className="w-4 h-4 text-[#B7791F]" />,
                  },
                  {
                    description: 'Lease agreement signed by Elena Rostova',
                    property: 'Sunset Palms #104',
                    time: 'Sep 4, 11:15 AM',
                    icon: <CheckCircle2 className="w-4 h-4 text-[#315A7D]" />,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="py-3 flex items-start justify-between gap-3 text-sm">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] flex items-center justify-center shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#243447] text-xs sm:text-sm truncate">
                          {item.description}
                        </p>
                        <p className="text-xs text-[#5B6875] mt-0.5">
                          {item.property}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[#5B6875] whitespace-nowrap shrink-0">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Section */}
            <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
              <div className="border-b border-[#D9E0E6] pb-3">
                <h2 className="text-base font-semibold text-[#243447]">
                  Upcoming
                </h2>
                <p className="text-xs text-[#5B6875]">Scheduled events and deadlines</p>
              </div>

              <div className="divide-y divide-[#D9E0E6]">
                {[
                  {
                    title: 'Property inspection',
                    property: 'Sunset Palms #104',
                    date: 'Tomorrow, 10:00 AM',
                    icon: <Calendar className="w-4 h-4 text-[#315A7D]" />,
                  },
                  {
                    title: 'Lease renewal review',
                    property: 'Highland Oaks #201',
                    date: 'Sep 15, 2026',
                    icon: <FileText className="w-4 h-4 text-[#5B6875]" />,
                  },
                  {
                    title: 'Maintenance follow-up',
                    property: 'Metro Lofts #512',
                    date: 'Sep 18, 2026',
                    icon: <Clock className="w-4 h-4 text-[#B7791F]" />,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="py-3 flex items-start gap-3 text-sm">
                    <div className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#243447] text-xs sm:text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#5B6875] mt-0.5">
                        {item.property} &bull; <span className="text-[#315A7D] font-medium">{item.date}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function MetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">{title}</span>
        <div className="w-8 h-8 rounded-md bg-[#EAF2F7] flex items-center justify-center shrink-0">{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-[#243447]">{value}</p>
        <p className="text-xs text-[#5B6875] mt-1">{subtitle}</p>
      </div>
    </div>
  )
}
