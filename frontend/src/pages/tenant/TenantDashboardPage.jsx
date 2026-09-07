import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, Loader } from '../../components/ui'
import {
  Building2,
  CreditCard,
  Wrench,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react'

export default function TenantDashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="dashboard"
      pageTitle="Tenant Dashboard"
    >
      {loading ? (
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-12 shadow-2xs flex justify-center">
          <Loader text="Loading tenancy dashboard..." size="md" center />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tenant Welcome Banner */}
          <div className="rounded-lg bg-[#315A7D] p-6 sm:p-8 text-white border border-[#274B68] shadow-xs">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#274B68] text-[#EAF2F7] border border-[#315A7D]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#EAF2F7]" />
                <span>Active Tenancy &bull; Unit #302</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
                Welcome back, {user?.name || 'Elena'}!
              </h1>
              <p className="text-xs sm:text-sm text-[#EAF2F7]/90">
                Your next lease payment of $2,400 is scheduled for October 1st, 2026.
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Current Unit"
              value="Unit #302"
              subtitle="Sunset Palms Condominiums"
              change="Lease active until July 2027"
              icon={<Building2 className="w-4 h-4 text-[#315A7D]" />}
            />
            <MetricCard
              title="Payment Status"
              value="Current"
              subtitle="Last paid: Sep 1, 2026 ($2,400)"
              change="AutoPay Enabled"
              icon={<CreditCard className="w-4 h-4 text-[#3F7D58]" />}
            />
            <MetricCard
              title="Maintenance"
              value="0 Open"
              subtitle="All service tickets resolved"
              change="Standard Response SLA"
              icon={<Wrench className="w-4 h-4 text-[#5B6875]" />}
            />
          </div>

          {/* Recent Records & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                <h2 className="text-base font-semibold text-[#243447]">
                  Payment History
                </h2>
                <StatusBadge status="Paid" size="sm" />
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'INV-2026-09', date: 'Sep 01, 2026', amount: '$2,400.00' },
                  { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '$2,400.00' },
                  { id: 'INV-2026-07', date: 'Jul 01, 2026', amount: '$2,400.00' },
                ].map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-xs">
                    <div>
                      <p className="font-semibold text-[#243447]">{inv.id}</p>
                      <p className="text-[#5B6875]">{inv.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#243447]">{inv.amount}</p>
                      <span className="text-[10px] text-[#2A583B] font-semibold">Settled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-4">
              <div className="border-b border-[#D9E0E6] pb-3">
                <h2 className="text-base font-semibold text-[#243447]">
                  Tenant Actions
                </h2>
              </div>
              <p className="text-xs text-[#5B6875]">
                Submit maintenance requests or review your signed lease agreement anytime.
              </p>
              <div className="space-y-2">
                <Link to="/tenant/maintenance/new" className="block">
                  <Button variant="primary" className="w-full justify-start" leftIcon={<Wrench className="w-4 h-4" />}>
                    Submit Maintenance Request
                  </Button>
                </Link>
                <Link to="/tenant/agreement" className="block">
                  <Button variant="secondary" className="w-full justify-start" leftIcon={<FileText className="w-4 h-4" />}>
                    View Signed Lease Document
                  </Button>
                </Link>
                <Link to="/tenant/properties" className="block">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Search className="w-4 h-4" />}>
                    Explore Available Listings
                  </Button>
                </Link>
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
