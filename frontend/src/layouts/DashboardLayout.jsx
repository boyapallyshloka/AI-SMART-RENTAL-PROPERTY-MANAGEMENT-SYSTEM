import React, { useState } from 'react'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'

/**
 * DashboardLayout Component for HomeSphere
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'owner' | 'tenant'} [props.defaultRole='owner']
 * @param {string} [props.activeItem='dashboard']
 * @param {(item: string) => void} [props.onSelectNav]
 * @param {string} [props.pageTitle]
 * @param {React.ReactNode} [props.topbarActions]
 */
export default function DashboardLayout({
  children,
  defaultRole = 'owner',
  activeItem = 'dashboard',
  onSelectNav,
  pageTitle,
  topbarActions,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState(defaultRole)
  const [currentNav, setCurrentNav] = useState(activeItem)

  const handleNavSelect = (item) => {
    setCurrentNav(item)
    if (onSelectNav) onSelectNav(item)
  }

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole)
    setCurrentNav('dashboard')
  }

  // Determine friendly title from current nav or pageTitle prop
  const displayTitle =
    pageTitle ||
    currentNav
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        role={currentRole}
        activeItem={currentNav}
        onSelect={handleNavSelect}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onRoleChange={handleRoleChange}
      />

      {/* Main Content Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          role={currentRole}
          onRoleChange={handleRoleChange}
          onMenuClick={() => setMobileSidebarOpen(true)}
          title={displayTitle}
          actions={topbarActions}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {typeof children === 'function'
              ? children({ role: currentRole, activeNav: currentNav, setRole: handleRoleChange })
              : children}
          </div>
        </main>
      </div>
    </div>
  )
}
