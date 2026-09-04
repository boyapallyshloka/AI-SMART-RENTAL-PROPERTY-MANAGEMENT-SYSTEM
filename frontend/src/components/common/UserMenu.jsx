import React, { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, ChevronDown, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/**
 * UserMenu Component for Topbar
 * Updated to use HomeSphere Primary Blue #315A7D (replaces bright purple avatar)
 *
 * @param {Object} props
 * @param {'owner' | 'tenant'} [props.role]
 * @param {() => void} [props.onLogout]
 */
export default function UserMenu({ role, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  let auth = null
  try {
    auth = useAuth()
  } catch (e) {
    // Graceful fallback if used outside AuthProvider
  }

  const effectiveRole = role || auth?.user?.role || 'owner'
  const userInfo = {
    name: auth?.user?.name || (effectiveRole === 'owner' ? 'Marcus Vance' : 'Elena Rostova'),
    email: auth?.user?.email || (effectiveRole === 'owner' ? 'owner@homesphere.com' : 'tenant@homesphere.com'),
    roleLabel: auth?.user?.roleLabel || (effectiveRole === 'owner' ? 'Property Owner' : 'Verified Tenant'),
    avatarText: auth?.user?.avatarText || (effectiveRole === 'owner' ? 'MV' : 'ER'),
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogoutClick = () => {
    setIsOpen(false)
    if (onLogout) {
      onLogout()
    } else if (auth?.logout) {
      auth.logout()
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md hover:bg-[#EAF2F7] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#315A7D]"
      >
        <div className="w-8 h-8 rounded-md bg-[#315A7D] text-white flex items-center justify-center text-xs font-semibold shadow-xs">
          {userInfo.avatarText}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-[#243447] leading-tight">
            {userInfo.name}
          </p>
          <p className="text-[11px] text-[#5B6875] capitalize">
            {userInfo.roleLabel}
          </p>
        </div>
        <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[#5B6875]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-lg bg-white border border-[#D9E0E6] shadow-md z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#D9E0E6] bg-[#F7F8FA]">
            <p className="text-xs font-semibold text-[#243447]">
              {userInfo.name}
            </p>
            <p className="text-[11px] text-[#5B6875] truncate">
              {userInfo.email}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
              <Shield className="w-3 h-3" />
              <span>{userInfo.roleLabel}</span>
            </div>
          </div>

          <div className="p-1.5 text-xs text-[#243447]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#EAF2F7] transition-colors"
            >
              <User className="w-4 h-4 text-[#5B6875]" />
              <span>My Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#EAF2F7] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#5B6875]" />
              <span>Account Settings</span>
            </button>
          </div>

          <div className="p-1.5 border-t border-[#D9E0E6]">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[#B94A48] hover:bg-[#FDF2F2] transition-colors font-medium text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
