import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge } from '../../components/ui'
import {
  Users,
  Building2,
  UserCheck,
  ShieldAlert,
  Wrench,
  Sparkles,
  Activity,
  History,
  Shield,
  Layers,
  LogOut,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
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
      icon: <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
      link: '/admin/users',
    },
    {
      id: 'property-owners',
      label: 'Property Owners',
      value: '16',
      subtext: 'Verified building owners',
      icon: <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      link: '/admin/users',
    },
    {
      id: 'tenants',
      label: 'Tenants',
      value: '32',
      subtext: 'Active resident accounts',
      icon: <UserCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      bg: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800',
      link: '/admin/users',
    },
    {
      id: 'pending-verifications',
      label: 'Pending Owner Verifications',
      value: '3',
      subtext: 'Requires admin document review',
      icon: <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      link: '/admin/owner-verification',
    },
    {
      id: 'open-maintenance',
      label: 'Open Maintenance Requests',
      value: '5',
      subtext: 'Across all managed properties',
      icon: <Wrench className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
    },
    {
      id: 'ai-alerts',
      label: 'AI Alerts',
      value: '2',
      subtext: 'Predictive anomalies flagged',
      icon: <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
      bg: 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800',
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
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    },
    {
      id: 'act-2',
      action: 'Draft lease agreement generated',
      entity: 'Marcus Vance (AGR-2026-004)',
      category: 'Agreements',
      timestamp: '2026-09-03 13:40:05',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'act-3',
      action: 'Owner identity documents uploaded for verification',
      entity: 'Highland Estates Management LLC',
      category: 'Verification',
      timestamp: '2026-09-03 12:10:48',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    {
      id: 'act-4',
      action: 'Rent payment settled via automated ACH',
      entity: 'INV-2026-001 ($3,200)',
      category: 'Billing',
      timestamp: '2026-09-03 10:45:19',
      badgeColor: 'bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200 dark:border-green-800',
    },
    {
      id: 'act-5',
      action: 'Predictive maintenance sensor anomaly detected',
      entity: 'AC Condenser unit #302 vibration pattern',
      category: 'AI Monitoring',
      timestamp: '2026-09-03 09:30:11',
      badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    },
    {
      id: 'act-6',
      action: 'New user registered and authenticated',
      entity: 'tenant@homesphere.com (Role: Tenant)',
      category: 'Security',
      timestamp: '2026-09-02 18:22:40',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
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
            leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
          >
            Logout
          </Button>
        </div>
      }
    >
      {activeNav !== 'dashboard' ? (
        /* Placeholder for other admin sidebar items */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                {activeNav.replace('-', ' ')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                HomeSphere Super Admin Control Center
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeNav
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}{' '}
                Module
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                This administrative section is queued for future API connectivity. Return to the dashboard to monitor system metrics and audit logs.
              </p>
            </div>
            <Button variant="primary" onClick={() => setActiveNav('dashboard')}>
              Return to Admin Dashboard
            </Button>
          </div>
        </div>
      ) : (
        /* Admin Dashboard View */
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Super Admin Overview
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Platform Root
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                System telemetry, user distributions, compliance approvals, and live audit stream
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Services Healthy
              </span>
            </div>
          </div>

          {/* 6 Mock Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryMetrics.map((card) => {
              const cardContent = (
                <div
                  className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all flex items-start justify-between h-full ${
                    card.link
                      ? 'hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md cursor-pointer group'
                      : 'hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {card.label}
                    </span>
                    <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1.5">
                      {card.value}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                      {card.subtext}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border ${card.bg} shrink-0 ml-3`}>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Recent Audit & System Activity
                </h2>
              </div>
              <span className="text-xs text-slate-500">Live platform events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 pl-6 pr-4">Event / Action</th>
                    <th className="py-3.5 px-4">Subject / Entity</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {recentActivity.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Action */}
                      <td className="py-3.5 pl-6 pr-4 font-medium text-slate-900 dark:text-white min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{log.action}</span>
                        </div>
                      </td>

                      {/* Subject / Entity */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {log.entity}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${log.badgeColor}`}
                        >
                          {log.category}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
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
