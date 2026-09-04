import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getStoredApplications } from '../../utils/applicationMockData'
import {
  Button,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  FileCheck,
  Plus,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
} from 'lucide-react'

export default function TenantApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const tenantEmail = (user?.email || 'tenant@homesphere.com').toLowerCase().trim()

  useEffect(() => {
    // Read from shared localStorage data source
    const timer = setTimeout(() => {
      const all = getStoredApplications()
      const myApps = all.filter(
        (app) => (app.email || '').toLowerCase().trim() === tenantEmail
      )
      setApplications(myApps)
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [tenantEmail])

  return (
    <DashboardLayout
      defaultRole="tenant"
      activeItem="my-applications"
      pageTitle="My Applications"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243447]">
              My Rental Applications
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
              Track the status, submission date, and manager review of your property applications
            </p>
          </div>

          <Link to="/tenant/applications/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Submit New Application
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-12 shadow-2xs flex justify-center">
            <Loader text="Loading your rental applications..." size="md" center />
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-8 shadow-2xs">
            <EmptyState
              icon={<FileCheck className="w-8 h-8" />}
              title="No rental applications found"
              message="You haven't submitted any rental applications yet with your account. Select a property and submit an application to get started."
              action={
                <Link to="/tenant/applications/new">
                  <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                    Submit New Application
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          /* Applications Table */
          <div className="bg-white rounded-lg border border-[#D9E0E6] shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#D9E0E6] flex items-center justify-between">
              <span className="text-xs text-[#5B6875]">
                Displaying{' '}
                <strong className="text-[#243447]">
                  {applications.length}
                </strong>{' '}
                active {applications.length === 1 ? 'application' : 'applications'}
              </span>
              <span className="text-xs text-[#315A7D] font-medium">
                Account: {tenantEmail}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-3.5 pl-6 pr-4">Property Name</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Move-In Date</th>
                    <th className="py-3.5 px-4">Monthly Income</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-sm">
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-[#F7F8FA] transition-colors"
                    >
                      {/* Property Name */}
                      <td className="py-4 pl-6 pr-4 font-semibold text-[#243447] min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#315A7D] shrink-0" />
                          <span>{app.propertyName}</span>
                        </div>
                      </td>

                      {/* Unit */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                          {app.unit}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#5B6875]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span>{app.submittedDate}</span>
                        </div>
                      </td>

                      {/* Move-In Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#243447]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                          <span>{app.preferredMoveInDate || '2026-10-01'}</span>
                        </div>
                      </td>

                      {/* Monthly Income */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-[#243447]">
                        ${Number(app.monthlyIncome || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
