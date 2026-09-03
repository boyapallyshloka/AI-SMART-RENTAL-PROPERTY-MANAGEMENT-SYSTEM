import React, { useId } from 'react'

/**
 * Select Component for HomeSphere
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {Array<{value: string|number, label: string, disabled?: boolean}> | Array<string>} [props.options]
 * @param {string} [props.placeholder]
 * @param {string} [props.className='']
 * @param {string} [props.id]
 */
export default function Select({
  label,
  error,
  helperText,
  options = [],
  placeholder,
  children,
  className = '',
  id,
  disabled = false,
  required = false,
  ...props
}) {
  const generatedId = useId()
  const selectId = id || generatedId
  const errorId = `${selectId}-error`
  const helperId = `${selectId}-helper`

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        <select
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`appearance-none block w-full rounded-lg text-sm transition-all duration-150 border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:cursor-not-allowed cursor-pointer ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options && options.length > 0
            ? options.map((opt) => {
                const isObj = typeof opt === 'object' && opt !== null
                const value = isObj ? opt.value : opt
                const optLabel = isObj ? opt.label : opt
                const isDisabled = isObj ? opt.disabled : false
                return (
                  <option key={String(value)} value={value} disabled={isDisabled}>
                    {optLabel}
                  </option>
                )
              })
            : children}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-rose-500">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
