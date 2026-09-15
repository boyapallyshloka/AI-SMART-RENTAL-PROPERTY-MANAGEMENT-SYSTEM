import React from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { ROLES } from '../../utils/roles'
import {
  Building2,
  FileCheck,
  Wrench,
  ShieldCheck,
  Info,
  Clock,
  UserCheck,
} from 'lucide-react'

export default function ManagerDashboardPage() {
  const { user } = useAuth()

  const displayName = user?.name || user?.fullName || user?.username || 'Property Manager'
  const displayEmail = user?.email || ''

  return (
    <DashboardLayout
      defaultRole={ROLES.PROPERTY_MANAGER}
      activeItem="dashboard"
      pageTitle="Manager Dashboard"
    >
      <div className="space-y-6 pb-12">
        {/* Welcome Banner */}
        <div className="rounded-lg bg-[#315A7D] p-6 sm:p-7 text-white border border-[#274B68] shadow-xs">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#274B68] text-[#EAF2F7] border border-[#315A7D]">
              <UserCheck className="w-3.5 h-3.5 text-[#EAF2F7]" />
              <span>Manager Portal</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-[#EAF2F7]/90 leading-relaxed">
              Welcome to the HomeSphere Property Manager Portal. Manage operational tasks, review prospective tenant applications, and coordinate unit inspections.
            </p>
            {displayEmail && (
              <p className="text-xs text-[#EAF2F7]/75 pt-1">
                Signed in as <strong className="text-white">{displayEmail}</strong> (Property Manager)
              </p>
            )}
          </div>
        </div>

        {/* Operational Scope Overview */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#5B6875] mb-3">
            Operational Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Property Oversight Card */}
            <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#EAF2F7] text-[#315A7D]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#243447]">
                    Property Oversight
                  </h3>
                  <span className="text-xs text-[#5B6875]">Portfolio Management</span>
                </div>
              </div>
              <p className="text-xs text-[#5B6875] leading-relaxed">
                Supervise building structures, floor plans, and unit availability across managed rental properties.
              </p>
            </div>

            {/* Application Reviews Card */}
            <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#EAF2F7] text-[#315A7D]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#243447]">
                    Rental Applications
                  </h3>
                  <span className="text-xs text-[#5B6875]">Tenant Onboarding</span>
                </div>
              </div>
              <p className="text-xs text-[#5B6875] leading-relaxed">
                Review and process prospective tenant applications submitted for assigned property units.
              </p>
            </div>

            {/* Maintenance & Services Card */}
            <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#EAF2F7] text-[#315A7D]">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#243447]">
                    Maintenance & Service
                  </h3>
                  <span className="text-xs text-[#5B6875]">Resident Requests</span>
                </div>
              </div>
              <p className="text-xs text-[#5B6875] leading-relaxed">
                Track and coordinate service tickets, resident repair requests, and maintenance vendor dispatches.
              </p>
            </div>
          </div>
        </div>

        {/* Manager Architecture Notice */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs flex items-start gap-3">
          <Info className="w-5 h-5 text-[#315A7D] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#243447]">
              Manager Portal Active
            </h4>
            <p className="text-xs text-[#5B6875] leading-relaxed">
              Your session is authenticated as a Property Manager. Navigation is configured to provide dedicated manager operational workflows.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
