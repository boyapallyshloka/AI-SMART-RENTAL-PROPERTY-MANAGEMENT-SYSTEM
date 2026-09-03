import React from 'react'
import { FolderOpen } from 'lucide-react'
import Button from './Button'

/**
 * EmptyState Component for HomeSphere
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {React.ReactNode | { label: string, onClick: () => void, variant?: 'primary'|'secondary'|'danger'|'outline', icon?: React.ReactNode }} [props.action]
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.className='']
 */
export default function EmptyState({
  title,
  message,
  action,
  icon,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 transition-all ${className}`}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-950/20">
        {icon || <FolderOpen className="w-7 h-7" aria-hidden="true" />}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
        {title}
      </h3>

      {message && (
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 mb-6">
          {message}
        </p>
      )}

      {action && (
        <div className="mt-1">
          {React.isValidElement(action) ? (
            action
          ) : typeof action === 'object' && action !== null ? (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              leftIcon={action.icon}
            >
              {action.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}
