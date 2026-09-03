import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, EmptyState } from '../../components/ui'
import {
  Building2,
  Users,
  DollarSign,
  Wrench,
  Plus,
  Sparkles,
  Layers,
  LogOut,
} from 'lucide-react'

export default function OwnerDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('dashboard')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <DashboardLayout
      defaultRole={user?.role || 'owner'}
      activeItem={activeNav}
      onSelectNav={(item) => setActiveNav(item)}
      topbarActions={
        <div className="flex items-center gap-2">
          <Link to="/ui-showcase">
            <Button size="sm" variant="outline" leftIcon={<Layers className="w-3.5 h-3.5" />}>
              UI Showcase
            </Button>
          </Link>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
          >
            Logout
          </Button>
        </div>
      }
    >
      {activeNav !== 'dashboard' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                {activeNav.replace('-', ' ')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Property Owner Management Portal &bull; HomeSphere
              </p>
            </div>
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add {activeNav.slice(0, -1) || 'Record'}
            </Button>
          </div>

          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
            <EmptyState
              icon={<Building2 className="w-7 h-7" />}
              title={`${activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} Module Loaded`}
              message="This section is configured and protected for property owners. Full data records and forms will be enabled in subsequent milestones."
            />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Smart Management Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {user?.name || 'Marcus'}!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/80">
                You are managing 12 rental units across 3 properties with 92% active occupancy.
              </p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              title="Total Properties"
              value="12 Units"
              subtitle="Across 3 properties"
              change="+2 this quarter"
              icon={<Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            />
            <MetricCard
              title="Active Occupancy"
              value="91.7%"
              subtitle="11 of 12 occupied"
              change="Optimal rate"
              icon={<Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            />
            <MetricCard
              title="Monthly Revenue"
              value="$24,850"
              subtitle="Collected this month"
              change="+4.8% vs last month"
              icon={<DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            />
            <MetricCard
              title="Open Maintenance"
              value="2 Tickets"
              subtitle="1 plumbing, 1 electrical"
              change="Within SLA"
              icon={<Wrench className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            />
          </div>

          {/* Portfolio Status Table Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Property Portfolio Status
                  </h2>
                  <p className="text-xs text-slate-500">Live rental availability</p>
                </div>
                <Button size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Unit
                </Button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { unit: 'Sunset Palms #302', type: '2 Bed, 2 Bath', rent: '$2,400', status: 'Occupied' },
                  { unit: 'Sunset Palms #104', type: '1 Bed, 1 Bath', rent: '$1,850', status: 'Available' },
                  { unit: 'Highland Oaks #201', type: '3 Bed, 2 Bath', rent: '$3,100', status: 'Pending' },
                  { unit: 'Metro Lofts #512', type: 'Studio', rent: '$1,650', status: 'Occupied' },
                ].map((prop, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{prop.unit}</p>
                      <p className="text-xs text-slate-400">{prop.type} &bull; {prop.rent}/mo</p>
                    </div>
                    <StatusBadge status={prop.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Owner Quick Actions
              </h2>
              <div className="space-y-2.5">
                <Button variant="primary" className="w-full justify-start" leftIcon={<Plus className="w-4 h-4" />}>
                  Create Lease Agreement
                </Button>
                <Button variant="secondary" className="w-full justify-start" leftIcon={<DollarSign className="w-4 h-4" />}>
                  Record Rent Payment
                </Button>
                <Button variant="secondary" className="w-full justify-start" leftIcon={<Wrench className="w-4 h-4" />}>
                  Dispatch Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start" leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}>
                  Generate AI Market Report
                </Button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs">
                  <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                    AI Recommendation
                  </p>
                  <p className="text-indigo-700/80 dark:text-indigo-300/80 mt-1">
                    Sunset Palms #104 has 4 pending tenant inquiries. Schedule an open inspection this Saturday to maximize lease velocity.
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
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
          {change}
        </span>
      </div>
    </div>
  )
}
