import React from 'react'
import { Building2, Users, DollarSign, Home } from 'lucide-react'

/**
 * KPI Summary Cards for Owner Properties
 * @param {Object} props
 * @param {Array} props.properties
 */
export default function PropertySummaryCard({ properties = [] }) {
  const totalProperties = properties.length

  const totalUnits = properties.reduce(
    (sum, p) => sum + (Number(p.totalUnits) || 1),
    0
  )

  const occupiedUnits = properties.reduce(
    (sum, p) => sum + (Number(p.occupiedUnits) || 0),
    0
  )

  const occupancyRate =
    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

  const monthlyRevenue = properties.reduce(
    (sum, p) =>
      sum + (Number(p.monthlyRent) || 0) * (Number(p.occupiedUnits) || 1),
    0
  )

  const availableUnits = Math.max(0, totalUnits - occupiedUnits)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Properties */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Portfolio Size
          </span>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalProperties}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active managed real estate
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Multi & Single family</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">100% Listed</span>
        </div>
      </div>

      {/* Total Units */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Units
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
            <Home className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalUnits}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {occupiedUnits} occupied &bull; {availableUnits} available
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Vacant units</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {availableUnits} Ready
          </span>
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Occupancy Rate
          </span>
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {occupancyRate}%
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Target: &gt;90%</span>
          <span className="text-sky-600 dark:text-sky-400 font-semibold">Healthy</span>
        </div>
      </div>

      {/* Estimated Monthly Revenue */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Est. Monthly Revenue
          </span>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            ${monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gross lease receivables
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>AutoPay collection</span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">Active</span>
        </div>
      </div>
    </div>
  )
}
