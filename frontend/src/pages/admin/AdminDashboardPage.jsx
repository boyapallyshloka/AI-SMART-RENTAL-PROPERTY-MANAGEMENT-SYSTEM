import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button } from '../../components/ui'
import {
  Users,
  Building2,
  UserCheck,
  ShieldAlert,
  Wrench,
  Sparkles,
  History,
  Layers,
  LogOut,
  Shield,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('dashboard')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 6 Summary Metrics for Super Admin
  const summaryMetrics = [
    {
      id: 'total-users',
      label: 'Total Users',
      value: '48',
      subtext: '+12% registered this month',
      icon: <Users className="w-5 h-5 text-[#315A7D]" />,
      bg: 'bg-[#EAF2F7] border-[#D9E0E6]',
      link: '/admin/users',
    },
    {
      id: 'property-owners',
      label: 'Property Owners',
      value: '16',
      subtext: 'Verified building owners',
      icon: <Building2 className="w-5 h-5 text-[#3F7D58]" />,
      bg: 'bg-[#EDF7EE] border-[#C6DEC8]',
      link: '/admin/users',
    },
    {
      id: 'tenants',
      label: 'Tenants',
      value: '32',
      subtext: 'Active resident accounts',
      icon: <UserCheck className="w-5 h-5 text-[#315A7D]" />,
      bg: 'bg-[#EAF2F7] border-[#D9E0E6]',
      link: '/admin/users',
    },
    {
      id: 'pending-verifications',
      label: 'Pending Owner Verifications',
      value: '3',
      subtext: 'Requires admin document review',
      icon: <ShieldAlert className="w-5 h-5 text-[#B7791F]" />,
      bg: 'bg-[#FEF7EC] border-[#F4E2B6]',
      link: '/admin/owner-verification',
    },
    {
      id: 'open-maintenance',
      label: 'Open Maintenance Requests',
      value: '5',
      subtext: 'Across all managed properties',
      icon: <Wrench className="w-5 h-5 text-[#5B6875]" />,
      bg: 'bg-[#F0F4F7] border-[#D9E0E6]',
    },
    {
      id: 'ai-alerts',
      label: 'AI Monitoring Alerts',
      value: '2',
      subtext: 'Predictive anomalies flagged',
      icon: <Sparkles className="w-5 h-5 text-[#B7791F]" />,
      bg: 'bg-[#FEF7EC] border-[#F4E2B6]',
      link: '/admin/ai-monitoring',
    },
  ]

  // Recent Activity List with mock audit-style entries
  const recentActivity = [
    {
      id: 'act-1',
      action: 'Tenant rental application submitted',
      entity: 'Elena Rostova (Sunset Palms #104)',
      category: 'Leasing',
      timestamp: '2026-09-03 14:15:22',
      badgeColor: 'bg-[#EAF2F7] text-[#274B68] border-[#D9E0E6]',
    },
    {
      id: 'act-2',
      action: 'Draft lease agreement generated',
      entity: 'Marcus Vance (AGR-2026-004)',
      category: 'Agreements',
      timestamp: '2026-09-03 13:40:05',
      badgeColor: 'bg-[#EDF7EE] text-[#2A583B] border-[#C6DEC8]',
    },
    {
      id: 'act-3',
      action: 'Owner identity documents uploaded for verification',
      entity: 'Highland Estates Management LLC',
      category: 'Verification',
      timestamp: '2026-09-03 12:10:48',
      badgeColor: 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]',
    },
    {
      id: 'act-4',
      action: 'Rent payment settled via automated ACH',
      entity: 'INV-2026-001 ($3,200)',
      category: 'Billing',
      timestamp: '2026-09-03 10:45:19',
      badgeColor: 'bg-[#EDF7EE] text-[#2A583B] border-[#C6DEC8]',
    },
    {
      id: 'act-5',
      action: 'Predictive maintenance sensor anomaly detected',
      entity: 'AC Condenser unit #302 vibration pattern',
      category: 'Telemetry',
      timestamp: '2026-09-03 09:30:11',
      badgeColor: 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]',
    },
    {
      id: 'act-6',
      action: 'New user registered and authenticated',
      entity: 'tenant@homesphere.com (Role: Tenant)',
      category: 'Security',
      timestamp: '2026-09-02 18:22:40',
      badgeColor: 'bg-[#F0F4F7] text-[#5B6875] border-[#D9E0E6]',
    },
  ]

  return (
    <DashboardLayout
      defaultRole="admin"
      activeItem={activeNav}
      onSelectNav={(item) => setActiveNav(item)}
      pageTitle="Super Admin Dashboard"
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
            leftIcon={<LogOut className="w-3.5 h-3.5 text-[#B94A48]" />}
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
              <h1 className="font-serif text-2xl font-bold text-[#243447] capitalize">
                {activeNav.replace('-', ' ')}
              </h1>
              <p className="text-xs text-[#5B6875] mt-0.5">
                HomeSphere Super Admin Control Center
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#D9E0E6] p-8 shadow-2xs text-center space-y-4">
            <div className="w-12 h-12 rounded-md bg-[#EAF2F7] text-[#315A7D] mx-auto flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#243447]">
                {activeNav
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}{' '}
                Module
              </h2>
              <p className="text-xs sm:text-sm text-[#5B6875] mt-1 max-w-md mx-auto">
                This administrative section is configured. Return to the dashboard to monitor system metrics and audit logs.
              </p>
            </div>
            <Button variant="primary" onClick={() => setActiveNav('dashboard')}>
              Return to Admin Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                  Super Admin Overview
                </h1>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                  Platform Root
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
                System telemetry, user distributions, compliance approvals, and live audit stream
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#5B6875] flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#3F7D58]" />
                All Services Healthy
              </span>
            </div>
          </div>

          {/* 6 Mock Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryMetrics.map((card) => {
              const cardContent = (
                <div
                  className={`rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs transition-colors flex items-start justify-between h-full ${
                    card.link
                      ? 'hover:border-[#315A7D] cursor-pointer group'
                      : ''
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875] block group-hover:text-[#315A7D] transition-colors">
                      {card.label}
                    </span>
                    <div className="text-2xl font-bold tracking-tight text-[#243447] mt-1">
                      {card.value}
                    </div>
                    <span className="text-xs text-[#5B6875] block mt-1">
                      {card.subtext}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-md border ${card.bg} shrink-0 ml-3`}>
                    {card.icon}
                  </div>
                </div>
              )

              return card.link ? (
                <Link key={card.id} to={card.link} className="block">
                  {cardContent}
                </Link>
              ) : (
                <div key={card.id}>{cardContent}</div>
              )
            })}
          </div>

          {/* Recent Activity / Audit Log Table */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-[#D9E0E6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#315A7D]" />
                <h2 className="text-sm font-semibold text-[#243447]">
                  Recent Audit & System Activity
                </h2>
              </div>
              <span className="text-xs text-[#5B6875]">Live platform events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-wider text-[#5B6875]">
                    <th className="py-2.5 pl-4 pr-3">Event / Action</th>
                    <th className="py-2.5 px-3">Subject / Entity</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 pl-3 pr-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E6] text-xs">
                  {recentActivity.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-[#F7F8FA] transition-colors"
                    >
                      {/* Action */}
                      <td className="py-2.5 pl-4 pr-3 font-medium text-[#243447] min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#315A7D]" />
                          <span>{log.action}</span>
                        </div>
                      </td>

                      {/* Subject / Entity */}
                      <td className="py-2.5 px-3 font-medium text-[#5B6875] whitespace-nowrap">
                        {log.entity}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border font-medium ${log.badgeColor}`}
                        >
                          {log.category}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 pl-3 pr-4 text-right whitespace-nowrap font-mono text-[#5B6875]">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
