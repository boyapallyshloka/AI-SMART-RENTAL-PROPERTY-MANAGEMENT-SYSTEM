import React, { useState, useRef, useEffect } from 'react'
import { Bell, Check, Clock, AlertCircle } from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Rent payment received',
    description: 'Unit #304 - $2,250 recorded successfully.',
    time: '12m ago',
    unread: true,
    type: 'payment',
  },
  {
    id: 2,
    title: 'New maintenance request',
    description: 'Unit #108 reported a bathroom plumbing issue.',
    time: '45m ago',
    unread: true,
    type: 'maintenance',
  },
  {
    id: 3,
    title: 'Agreement pending signature',
    description: 'Sarah Jenkins requested lease document review.',
    time: '2h ago',
    unread: true,
    type: 'agreement',
  },
]

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        className="relative p-2 rounded-md text-[#5B6875] hover:text-[#243447] hover:bg-[#EAF2F7] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#315A7D]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B94A48] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B94A48]" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white border border-[#D9E0E6] shadow-md z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#D9E0E6]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#243447]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-[#315A7D] hover:underline flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Mark read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#D9E0E6]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#5B6875]">
                No notifications right now
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-[#F7F8FA] ${
                    item.unread ? 'bg-[#EAF2F7]/50' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-md bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6] shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#243447] truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#5B6875] mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-[#5B6875]">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#315A7D] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-[#D9E0E6] bg-[#F7F8FA] text-center">
            <span className="text-[11px] text-[#5B6875]">
              Real-time property notifications
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
