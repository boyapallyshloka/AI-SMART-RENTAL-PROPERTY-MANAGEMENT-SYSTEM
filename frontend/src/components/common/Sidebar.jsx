import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  LayoutDashboard,
  Building2,
  FileCheck,
  FileText,
  CreditCard,
  Wrench,
  BarChart3,
  Sparkles,
  Search,
  X,
  ArrowLeftRight,
  Users,
  ShieldCheck,
  History,
  Activity,
  Settings,
} from 'lucide-react'
import NavItem from './NavItem'
import { getPendingApplicationsCount } from '../../utils/applicationMockData'

const OWNER_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'properties', label: 'Properties', icon: <Building2 className="w-5 h-5" />, badge: '12' },
  { id: 'applications', label: 'Applications', icon: <FileCheck className="w-5 h-5" />, badge: '3' },
  { id: 'agreements', label: 'Agreements', icon: <FileText className="w-5 h-5" /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-5 h-5" />, badge: '2' },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'ai-insights', label: 'AI Insights', icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
]

const TENANT_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'browse', label: 'Browse Properties', icon: <Search className="w-5 h-5" /> },
  { id: 'my-applications', label: 'My Applications', icon: <FileCheck className="w-5 h-5" />, badge: '1' },
  { id: 'payments', label: 'Payments', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-5 h-5" /> },
  { id: 'agreement', label: 'Agreement', icon: <FileText className="w-5 h-5" /> },
]

const ADMIN_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { id: 'owner-verification', label: 'Owner Verification', icon: <ShieldCheck className="w-5 h-5" />, badge: '3' },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'audit-logs', label: 'Audit Logs', icon: <History className="w-5 h-5" /> },
  { id: 'ai-monitoring', label: 'AI Monitoring', icon: <Activity className="w-5 h-5 text-amber-500" /> },
  { id: 'settings', label: 'System Settings', icon: <Settings className="w-5 h-5" /> },
]

/**
 * Sidebar Component for HomeSphere
 * @param {Object} props
 * @param {'owner' | 'tenant'} props.role
 * @param {string} props.activeItem
 * @param {(item: string) => void} props.onSelect
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(newRole: 'owner' | 'tenant') => void} props.onRoleChange
 */
export default function Sidebar({
  role = 'owner',
  activeItem = 'dashboard',
  onSelect,
  isOpen = false,
  onClose,
  onRoleChange,
}) {
  const navigate = useNavigate()
  const pendingAppsCount = getPendingApplicationsCount()

  const dynamicOwnerMenu = OWNER_MENU.map((item) => {
    if (item.id === 'applications') {
      return { ...item, badge: pendingAppsCount > 0 ? String(pendingAppsCount) : '0' }
    }
    return item
  })

  const menuItems =
    role === 'admin' || role === 'superadmin'
      ? ADMIN_MENU
      : role === 'tenant'
      ? TENANT_MENU
      : dynamicOwnerMenu

  const handleItemClick = (id) => {
    if (onSelect) onSelect(id)
    if (onClose) onClose()

    if (role === 'admin' || role === 'superadmin') {
      if (id === 'dashboard') navigate('/admin/dashboard')
      else if (id === 'users') navigate('/admin/users')
      else if (id === 'owner-verification') navigate('/admin/owner-verification')
      else if (id === 'reports') navigate('/admin/reports')
      else if (id === 'audit-logs') navigate('/admin/audit-logs')
      else if (id === 'ai-monitoring') navigate('/admin/ai-monitoring')
      else if (id === 'settings' || id === 'system-settings') navigate('/admin/system-settings')
    } else if (role === 'owner' || role === 'manager') {
      if (id === 'dashboard') navigate('/owner/dashboard')
      else if (id === 'properties') navigate('/owner/properties')
      else if (id === 'applications') navigate('/owner/applications')
      else if (id === 'agreements') navigate('/owner/agreements')
      else if (id === 'payments') navigate('/owner/payments')
      else if (id === 'maintenance') navigate('/owner/maintenance')
      else if (id === 'reports') navigate('/owner/reports')
      else if (id === 'ai-insights') navigate('/owner/ai-insights')
    } else if (role === 'tenant') {
      if (id === 'dashboard') navigate('/tenant/dashboard')
      else if (id === 'my-applications') navigate('/tenant/applications')
      else if (id === 'agreement') navigate('/tenant/agreement')
      else if (id === 'payments') navigate('/tenant/payments')
      else if (id === 'maintenance') navigate('/tenant/maintenance')
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Branding Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                HomeSphere
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
                Smart Rental AI
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Indicator Banner */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Active Portal
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {role} Portal
              </span>
            </div>
            {onRoleChange && (
              <button
                type="button"
                onClick={() => onRoleChange(role === 'owner' ? 'tenant' : 'owner')}
                title="Switch portal view"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-medium text-[11px] shadow-xs hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Switch</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              isActive={activeItem === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Platform Active
            </span>
            <span className="font-mono text-[11px] text-slate-400">v0.1.0</span>
          </div>
        </div>
      </aside>
    </>
  )
}
