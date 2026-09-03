import React from 'react'
import { Home, ShieldCheck, Sparkles, Building2 } from 'lucide-react'

/**
 * AuthLayout Component for HomeSphere
 * Provides a clean split shell for Login, Register, and Forgot Password views.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.title='Welcome back']
 * @param {string} [props.subtitle='Sign in to manage your smart rental properties and leases']
 */
export default function AuthLayout({
  children,
  title = 'Welcome back',
  subtitle = 'Sign in to manage your smart rental properties and leases',
}) {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left Brand Visual Side (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white overflow-hidden border-r border-slate-800">
        {/* Subtle background glow effect */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/40">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">HomeSphere</span>
            <span className="block text-[11px] font-semibold tracking-wider uppercase text-indigo-400">
              AI Smart Property Management
            </span>
          </div>
        </div>

        {/* Central Value Proposition */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Autonomous Rental Ecosystem</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Managing properties and tenant leases with automated intelligence.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time lease tracking, automated rent reconciliations, instant maintenance dispatching, and predictive occupancy forecasting.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Full Portfolio View</p>
                <p className="text-[11px] text-slate-400">Owners & managers</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Bank-Grade Security</p>
                <p className="text-[11px] text-slate-400">Encrypted payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} HomeSphere Technologies Inc.</span>
          <span>Privacy & Terms</span>
        </div>
      </div>

      {/* Right Content Side */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Header */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold">HomeSphere</span>
              <span className="block text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400">
                Smart Rental AI
              </span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form / Content Container */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
