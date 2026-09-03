import React from 'react'

/**
 * Status style configurations for HomeSphere
 */
const STATUS_CONFIG = {
  available: {
    label: 'Available',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  occupied: {
    label: 'Occupied',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  pending: {
    label: 'Pending',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  'under review': {
    label: 'Under Review',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  'underreview': {
    label: 'Under Review',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  approved: {
    label: 'Approved',
    badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    dot: 'bg-teal-500',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  paid: {
    label: 'Paid',
    badge: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
    dot: 'bg-green-500',
  },
  overdue: {
    label: 'Overdue',
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    dot: 'bg-red-500 animate-pulse',
  },
  open: {
    label: 'Open',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    dot: 'bg-indigo-500',
  },
  assigned: {
    label: 'Assigned',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    dot: 'bg-cyan-500',
  },
  'in progress': {
    label: 'In Progress',
    badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  'inprogress': {
    label: 'In Progress',
    badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  resolved: {
    label: 'Resolved',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-700',
    dot: 'bg-emerald-600',
  },
  closed: {
    label: 'Closed',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  active: {
    label: 'Active',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  draft: {
    label: 'Draft',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  'pending signature': {
    label: 'Pending Signature',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  success: {
    label: 'Success',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  warning: {
    label: 'Warning',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  failed: {
    label: 'Failed',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
}

/**
 * StatusBadge Component for HomeSphere
 * Supports: Available, Occupied, Pending, Approved, Rejected, Paid, Overdue, Open, Assigned, In Progress, Resolved, Closed
 *
 * @param {Object} props
 * @param {string} props.status
 * @param {'sm' | 'md'} [props.size='md']
 * @param {boolean} [props.withDot=true]
 * @param {string} [props.className='']
 */
export default function StatusBadge({
  status = '',
  size = 'md',
  withDot = true,
  className = '',
}) {
  const normalizedKey = String(status).trim().toLowerCase()
  const config = STATUS_CONFIG[normalizedKey] || {
    label: status,
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors select-none ${
        sizeClasses[size] || sizeClasses.md
      } ${config.badge} ${className}`}
    >
      {withDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label || status}</span>
    </span>
  )
}
