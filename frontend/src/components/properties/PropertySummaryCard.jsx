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
      <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
            Portfolio Size
          </span>
          <div className="p-2.5 rounded-md bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
            {totalProperties}
          </p>
          <p className="text-xs text-[#5B6875] mt-0.5">
            Active managed real estate
          </p>
        </div>
        <div className="pt-2 border-t border-[#D9E0E6] flex items-center justify-between text-[11px] text-[#5B6875]">
          <span>Multi & Single family</span>
          <span className="text-[#315A7D] font-semibold">100% Listed</span>
        </div>
      </div>

      {/* Total Units */}
      <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
            Total Units
          </span>
          <div className="p-2.5 rounded-md bg-[#EDF7EE] text-[#3F7D58] border border-[#C6DEC8]">
            <Home className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
            {totalUnits}
          </p>
          <p className="text-xs text-[#5B6875] mt-0.5">
            {occupiedUnits} occupied &bull; {availableUnits} available
          </p>
        </div>
        <div className="pt-2 border-t border-[#D9E0E6] flex items-center justify-between text-[11px] text-[#5B6875]">
          <span>Vacant units</span>
          <span className="text-[#3F7D58] font-semibold">
            {availableUnits} Ready
          </span>
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
            Occupancy Rate
          </span>
          <div className="p-2.5 rounded-md bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
            {occupancyRate}%
          </p>
          <div className="w-full bg-[#F7F8FA] border border-[#D9E0E6] h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#315A7D] h-full rounded-full transition-all duration-300"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
        <div className="pt-2 border-t border-[#D9E0E6] flex items-center justify-between text-[11px] text-[#5B6875]">
          <span>Target: &gt;90%</span>
          <span className="text-[#315A7D] font-semibold">Healthy</span>
        </div>
      </div>

      {/* Estimated Monthly Revenue */}
      <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
            Est. Monthly Revenue
          </span>
          <div className="p-2.5 rounded-md bg-[#FEF7EC] text-[#B7791F] border border-[#F4E2B6]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
            ${monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-[#5B6875] mt-0.5">
            Gross lease receivables
          </p>
        </div>
        <div className="pt-2 border-t border-[#D9E0E6] flex items-center justify-between text-[11px] text-[#5B6875]">
          <span>Collection rate</span>
          <span className="text-[#B7791F] font-semibold">98.4%</span>
        </div>
      </div>
    </div>
  )
}
