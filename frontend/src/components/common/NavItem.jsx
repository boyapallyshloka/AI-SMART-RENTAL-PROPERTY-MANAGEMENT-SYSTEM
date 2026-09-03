import React from 'react'

/**
 * NavItem component for Sidebar navigation
 * @param {Object} props
 * @param {React.ReactNode} props.icon
 * @param {string} props.label
 * @param {boolean} [props.isActive=false]
 * @param {() => void} [props.onClick]
 * @param {string|number} [props.badge]
 */
export default function NavItem({
  icon,
  label,
  isActive = false,
  onClick,
  badge,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 select-none ${
        isActive
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`shrink-0 transition-transform duration-150 ${
            isActive
              ? 'text-white'
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
          }`}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      {badge !== undefined && (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 transition-colors ${
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
