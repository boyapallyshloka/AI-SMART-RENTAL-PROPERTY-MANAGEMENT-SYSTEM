import React from 'react'
import { Menu, ArrowLeftRight } from 'lucide-react'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

/**
 * Enterprise Topbar Component for HomeSphere Dashboard
 * High contrast with #243447 headings and #5B6875 secondary text
 *
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-[#D9E0E6] transition-colors">
      {/* Left section: Hamburger button & page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
          className="p-2 -ml-1 text-[#5B6875] hover:text-[#243447] hover:bg-[#EAF2F7] rounded-md lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#315A7D]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875] hidden sm:inline">
            HomeSphere /
          </span>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#243447] capitalize tracking-normal">
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#D9E0E6] bg-[#EAF2F7] text-[#243447] hover:bg-[#D9E6F0] transition-colors text-xs font-medium"
            title="Toggle between Owner and Tenant views"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#5B6875]" />
            <span className="hidden md:inline">Viewing as:</span>
            <span className="capitalize font-semibold">{role}</span>
          </button>
        )}

        {actions}

        {/* Notification Bell */}
        <NotificationBell />

        <div className="h-5 w-px bg-[#D9E0E6] mx-0.5" />

        {/* User Profile & Logout */}
        <UserMenu role={role} />
      </div>
    </header>
  )
}
