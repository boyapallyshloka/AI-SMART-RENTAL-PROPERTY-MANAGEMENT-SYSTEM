import React, { useState } from 'react'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'

/**
 * DashboardLayout Component for HomeSphere
 * Canvas background: #F7F8FA, Main Text: #243447
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'owner' | 'tenant' | 'admin'} [props.defaultRole='owner']
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

  React.useEffect(() => {
    if (displayTitle) {
      document.title = `${displayTitle} | HomeSphere`
    }
  }, [displayTitle])

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA] text-[#243447] font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        role={currentRole}
        activeItem={currentNav}
        onSelect={handleNavSelect}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onRoleChange={handleRoleChange}
      />

      {/* Main Content Area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-[#F7F8FA]">
        {/* Top Header Bar */}
        <Topbar
          role={currentRole}
          title={displayTitle}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onRoleChange={handleRoleChange}
          actions={topbarActions}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
