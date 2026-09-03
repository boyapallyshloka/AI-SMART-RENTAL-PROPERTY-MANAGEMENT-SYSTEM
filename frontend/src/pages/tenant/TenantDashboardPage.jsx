import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, EmptyState } from '../../components/ui'
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Wrench,
  FileText,
  Search,
  Layers,
  LogOut,
} from 'lucide-react'

export default function TenantDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('dashboard')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <DashboardLayout
      defaultRole="tenant"
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
                Verified Tenant Portal &bull; HomeSphere
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
            <EmptyState
              icon={<FileText className="w-7 h-7" />}
              title={`${activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}`}
              message="Your tenant data for this section is connected. Interactive features will be enabled in subsequent updates."
            />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tenant Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
            <div className="relative z-10 max-w-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Tenancy &bull; Unit #302</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {user?.name || 'Elena'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Your next lease payment of $2,400 is scheduled for October 1st, 2026.
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <MetricCard
              title="Current Unit"
              value="Unit #302"
              subtitle="Sunset Palms Condominiums"
              change="Lease active until July 2027"
              icon={<Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            />
            <MetricCard
              title="Payment Status"
              value="Current"
              subtitle="Last paid: Sep 1, 2026 ($2,400)"
              change="AutoPay Enabled"
              icon={<CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            />
            <MetricCard
              title="Maintenance"
              value="0 Open"
              subtitle="All service tickets resolved"
              change="Standard Response SLA"
              icon={<Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            />
          </div>

          {/* Recent Records & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Payment History
                </h2>
                <StatusBadge status="Paid" size="sm" />
              </div>

              <div className="space-y-3">
                {[
                  { id: 'INV-2026-09', date: 'Sep 01, 2026', amount: '$2,400.00' },
                  { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '$2,400.00' },
                  { id: 'INV-2026-07', date: 'Jul 01, 2026', amount: '$2,400.00' },
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
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Quick Tenant Actions
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Submit maintenance tickets or review your signed lease agreement instantly.
              </p>
              <div className="space-y-2.5">
                <Button variant="primary" className="w-full justify-start" leftIcon={<Wrench className="w-4 h-4" />}>
                  Submit Maintenance Request
                </Button>
                <Button variant="secondary" className="w-full justify-start" leftIcon={<FileText className="w-4 h-4" />}>
                  View Signed Lease Document
                </Button>
                <Button variant="outline" className="w-full justify-start" leftIcon={<Search className="w-4 h-4" />}>
                  Explore Nearby Amenities & Storage
                </Button>
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
