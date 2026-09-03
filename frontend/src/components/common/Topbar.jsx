import React from 'react'
import { Menu, Search, ArrowLeftRight } from 'lucide-react'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

/**
 * Topbar Component for HomeSphere Dashboard
 * @param {Object} props
 * @param {() => void} props.onMenuClick
 * @param {'owner' | 'tenant'} props.role
 * @param {(newRole: 'owner' | 'tenant') => void} [props.onRoleChange]
 * @param {string} [props.title='Dashboard']
 * @param {React.ReactNode} [props.actions]
 */
export default function Topbar({
  onMenuClick,
  role = 'owner',
  onRoleChange,
  title = 'Dashboard',
  actions,
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left section: Hamburger button & page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
          className="p-2 -ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline">
            HomeSphere /
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize">
            {title}
          </h2>
        </div>
      </div>

      {/* Right section: Role switcher, Notifications, User Profile, Custom Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Pill */}
        {onRoleChange && (
          <button
            type="button"
            onClick={() => onRoleChange(role === 'owner' ? 'tenant' : 'owner')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-xs font-semibold shadow-2xs"
            title="Toggle between Owner and Tenant views"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Viewing as:</span>
            <span className="capitalize">{role}</span>
          </button>
        )}

        {actions}

        {/* Notification Bell */}
        <NotificationBell />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User Profile & Logout */}
        <UserMenu role={role} />
      </div>
    </header>
  )
}
