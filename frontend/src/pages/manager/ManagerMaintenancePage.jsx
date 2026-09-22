import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { ROLES } from '../../utils/roles'
import {
  Wrench,
  ArrowLeft,
  Building2,
  ListFilter,
  CheckCircle2,
  Users,
  History,
  Info,
  Layers,
} from 'lucide-react'
import { Button } from '../../components/ui'

/**
 * Planned operational capabilities for the Maintenance workspace.
 * Strictly informational — no operational actions or fake state.
 */
const PLANNED_CAPABILITIES = [
  {
    title: 'Maintenance Request Tracking',
    description:
      'Monitor and filter tenant-submitted service tickets, problem descriptions, and urgency levels across assigned properties.',
    icon: <ListFilter className="w-5 h-5 text-[#315A7D]" />,
  },
  {
    title: 'Property & Unit Association',
    description:
      'Directly link service requests to specific buildings, floors, and individual rental units within your assigned portfolio.',
    icon: <Building2 className="w-5 h-5 text-[#315A7D]" />,
  },
  {
    title: 'Request Status Management',
    description:
      'Track and update the operational lifecycle of work requests from initial intake to in-progress and completion.',
    icon: <CheckCircle2 className="w-5 h-5 text-[#315A7D]" />,
  },
  {
    title: 'Service & Contractor Assignment',
    description:
      'Coordinate and dispatch internal maintenance technicians or external service vendors to resolve property issues.',
    icon: <Users className="w-5 h-5 text-[#315A7D]" />,
  },
  {
    title: 'Maintenance History & Audits',
    description:
      'Maintain an organized record of past repairs, service resolutions, and property maintenance logs.',
    icon: <History className="w-5 h-5 text-[#315A7D]" />,
  },
]

/**
 * ManagerMaintenancePage
 *
 * Professional frontend shell for Manager Maintenance & Service Requests.
 * Honestly reflects that real maintenance operations are awaiting backend API integration.
 * Strictly adheres to Phase 5A: no mock data, no fake counts, and no unauthorized API calls.
 */
export default function ManagerMaintenancePage() {
  return (
    <DashboardLayout
      defaultRole={ROLES.PROPERTY_MANAGER}
      activeItem="maintenance"
      pageTitle="Maintenance & Service Requests"
    >
      <div className="space-y-6 pb-12 max-w-5xl">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              to="/manager/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315A7D] hover:text-[#274B68] transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243447]">
                Maintenance & Service Requests
              </h1>
              <span className="font-mono text-xs font-bold text-[#315A7D] bg-[#EAF2F7] px-2.5 py-0.5 rounded-md border border-[#D9E0E6]">
                Integration Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5B6875]">
              Monitor and coordinate maintenance requests across your assigned properties.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link to="/manager/properties">
              <Button variant="secondary" size="sm" leftIcon={<Building2 className="w-3.5 h-3.5" />}>
                Assigned Properties
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Integration-Ready State Card */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-8 sm:p-12 shadow-2xs text-center space-y-5">
          <div className="w-14 h-14 rounded-xl bg-[#EAF2F7] border border-[#D9E0E6] flex items-center justify-center text-[#315A7D] mx-auto shadow-2xs">
            <Wrench className="w-7 h-7" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0F4F7] text-[#5B6875] border border-[#D9E0E6] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
              <span>Service Connection: Awaiting Backend API</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#243447] tracking-tight">
              Maintenance management is ready for backend integration
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6875] leading-relaxed">
              Maintenance request tracking will become available here once the maintenance service is
              connected. This workspace is prepared for property-level request management, status
              tracking, and service coordination.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/manager/dashboard">
              <Button variant="primary" size="sm">
                Return to Dashboard
              </Button>
            </Link>
            <Link to="/manager/applications">
              <Button variant="outline" size="sm">
                View Applications
              </Button>
            </Link>
          </div>
        </div>

        {/* Planned Capabilities Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#315A7D]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B6875]">
              Planned Capabilities
            </h3>
          </div>
          <p className="text-xs text-[#5B6875]">
            The following capabilities are prepared for implementation once backend maintenance
            endpoints are available:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {PLANNED_CAPABILITIES.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-2.5"
              >
                <div className="p-2 w-fit rounded-lg bg-[#EAF2F7] border border-[#D9E0E6]">
                  {item.icon}
                </div>
                <h4 className="text-sm font-semibold text-[#243447]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#5B6875] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Notice Card */}
        <div className="bg-[#F7F8FA] border border-[#D9E0E6] rounded-lg p-4 text-xs text-[#5B6875] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#315A7D] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#243447]">Integration Note:</strong> This page is a dedicated
            Manager Maintenance UI shell. Live maintenance ticket querying and status operations will
            be wired directly upon release of the official HomeSphere Maintenance REST API.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
