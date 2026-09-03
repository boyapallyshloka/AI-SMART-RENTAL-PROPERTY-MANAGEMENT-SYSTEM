import React, { useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import UIShowcase from './components/common/UIShowcase'
import {
  Button,
  StatusBadge,
  EmptyState,
} from './components/ui'
import {
  Building2,
  Users,
  DollarSign,
  Wrench,
  Plus,
  Sparkles,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
  CreditCard,
} from 'lucide-react'

export default function App() {
  const [role, setRole] = useState('owner')
  const [activeNav, setActiveNav] = useState('dashboard')
  const [viewMode, setViewMode] = useState('dashboard') // 'dashboard' | 'showcase'

  return (
    <DashboardLayout
      defaultRole={role}
      activeItem={activeNav}
      onSelectNav={(item) => setActiveNav(item)}
      topbarActions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'showcase' ? 'primary' : 'outline'}
            onClick={() => setViewMode(viewMode === 'dashboard' ? 'showcase' : 'dashboard')}
          >
            {viewMode === 'dashboard' ? 'Open UI Showcase' : 'Back to Dashboard'}
          </Button>
        </div>
      }
    >
      {({ role: currentRole, activeNav: currentItem }) => {
        if (viewMode === 'showcase') {
          return <UIShowcase />
        }

        return currentRole === 'owner' ? (
          <OwnerDashboardContent activeNav={currentItem} />
        ) : (
          <TenantDashboardContent activeNav={currentItem} />
        )
      }}
    </DashboardLayout>
  )
}

/**
 * Placeholder Content for Owner View
 */
function OwnerDashboardContent({ activeNav }) {
  if (activeNav !== 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
              {activeNav.replace('-', ' ')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Property owner management portal &bull; HomeSphere
            </p>
          </div>
          <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            New {activeNav.slice(0, -1) || 'Entry'}
          </Button>
        </div>

        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
          <EmptyState
            icon={<Building2 className="w-7 h-7" />}
            title={`${activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} Module Loaded`}
            message="This page content area is prepared for the upcoming feature rollout. Navigation and layout structure are fully wired."
            action={{
              label: 'Add First Record',
              onClick: () => alert(`Action triggered for ${activeNav}`),
              variant: 'primary',
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Smart Management Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome to Owner Portal
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80">
            You currently manage 12 rental units across 3 properties with 92% active occupancy.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Properties"
          value="12 Units"
          subtitle="Across 3 buildings"
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
          subtitle="Collected for September"
          change="+4.8% vs Aug"
          icon={<DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        />
        <MetricCard
          title="Open Tickets"
          value="2 Pending"
          subtitle="1 urgent HVAC inspection"
          change="Within SLA"
          icon={<Wrench className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
        />
      </div>

      {/* Recent Properties & Applications Table Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Property Portfolio Status
              </h2>
              <p className="text-xs text-slate-500">Live rental availability overview</p>
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

        {/* Action Panel */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Quick Actions
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
                Sunset Palms #104 has had 4 inquiries. Consider scheduling an open inspection this Saturday.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Placeholder Content for Tenant View
 */
function TenantDashboardContent({ activeNav }) {
  if (activeNav !== 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
              {activeNav.replace('-', ' ')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified Tenant Portal &bull; HomeSphere
            </p>
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
          <EmptyState
            icon={<FileText className="w-7 h-7" />}
            title={`${activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}`}
            message="Your tenant data for this section is connected. Full forms and interactive records will be available in the next release."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tenant Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Lease Active &bull; Unit #302</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hi Elena, Welcome Home!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Your next rent payment of $2,400 is scheduled for October 1st, 2026.
          </p>
        </div>
      </div>

      {/* Tenant Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard
          title="Current Lease"
          value="Unit #302"
          subtitle="Sunset Palms Condos"
          change="Expires July 2027"
          icon={<Building2 className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Rent Payment"
          value="Up to Date"
          subtitle="Last paid: Sep 1, 2026"
          change="Paid via AutoPay"
          icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Maintenance"
          value="0 Open"
          subtitle="All requests resolved"
          change="Standard SLA"
          icon={<Wrench className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* Tenant Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Payment History
            </h2>
            <StatusBadge status="Paid" size="sm" />
          </div>

          <div className="space-y-3">
            {[
              { id: 'INV-2026-09', date: 'Sep 01, 2026', amount: '$2,400.00', status: 'Paid' },
              { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '$2,400.00', status: 'Paid' },
              { id: 'INV-2026-07', date: 'Jul 01, 2026', amount: '$2,400.00', status: 'Paid' },
            ].map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{inv.id}</p>
                  <p className="text-slate-400">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{inv.amount}</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Settled</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Quick Tenant Requests
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Need assistance or maintenance in your rental unit? Submit an instant ticket.
          </p>
          <div className="space-y-2.5">
            <Button variant="primary" className="w-full justify-start" leftIcon={<Wrench className="w-4 h-4" />}>
              Report Maintenance Issue
            </Button>
            <Button variant="secondary" className="w-full justify-start" leftIcon={<FileText className="w-4 h-4" />}>
              Download Lease Agreement PDF
            </Button>
            <Button variant="outline" className="w-full justify-start" leftIcon={<Search className="w-4 h-4" />}>
              Browse Available Storage / Parking
            </Button>
          </div>
        </div>
      </div>
    </div>
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
