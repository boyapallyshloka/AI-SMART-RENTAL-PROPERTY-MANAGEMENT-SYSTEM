import React, { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, ChevronDown, Shield } from 'lucide-react'

/**
 * UserMenu Component for Topbar
 * @param {Object} props
 * @param {'owner' | 'tenant'} [props.role='owner']
 * @param {() => void} [props.onLogout]
 */
export default function UserMenu({ role = 'owner', onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const userInfo = {
    name: role === 'owner' ? 'Marcus Vance' : 'Elena Rostova',
    email: role === 'owner' ? 'marcus@homesphere.dev' : 'elena.r@homesphere.dev',
    roleLabel: role === 'owner' ? 'Property Owner' : 'Verified Tenant',
    avatarText: role === 'owner' ? 'MV' : 'ER',
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
          {userInfo.avatarText}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            {userInfo.name}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
            {userInfo.roleLabel}
          </p>
        </div>
        <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {userInfo.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {userInfo.email}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Shield className="w-3 h-3" />
              <span>{userInfo.roleLabel}</span>
            </div>
          </div>

          <div className="p-1.5 text-xs text-slate-700 dark:text-slate-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>My Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Account Settings</span>
            </button>
          </div>

          <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                if (onLogout) onLogout()
                else alert('Logout clicked (Placeholder)')
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium text-xs"
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
