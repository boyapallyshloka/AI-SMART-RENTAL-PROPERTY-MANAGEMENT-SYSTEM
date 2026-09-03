import React from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge, Button, EmptyState } from '../ui'
import {
  Eye,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Plus,
} from 'lucide-react'

/**
 * OwnerPropertyTable Component
 * @param {Object} props
 * @param {Array} props.properties
 * @param {(id: string) => void} props.onDelete
 */
export default function OwnerPropertyTable({ properties = [], onDelete }) {
  if (properties.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <EmptyState
          icon={<Building2 className="w-8 h-8" />}
          title="No properties found"
          message="Try adjusting your search query or filter settings, or list a new property to get started."
          action={
            <Link to="/owner/properties/add">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Add Property
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 pl-6 pr-4">Property</th>
              <th className="py-3.5 px-4">Type & Layout</th>
              <th className="py-3.5 px-4">Occupancy</th>
              <th className="py-3.5 px-4">Rent</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
            {properties.map((prop) => {
              const total = Number(prop.totalUnits) || 1
              const occupied = Number(prop.occupiedUnits) || 0
              const occupancyPct = Math.round((occupied / total) * 100)
              const firstImage =
                Array.isArray(prop.images) && prop.images[0]
                  ? prop.images[0]
                  : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'

              return (
                <tr
                  key={prop.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Property Name & Thumbnail */}
                  <td className="py-4 pl-6 pr-4 min-w-[260px]">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={firstImage}
                        alt={prop.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700/80 shadow-xs"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
                        }}
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/owner/properties/${prop.id}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                        >
                          {prop.name}
                        </Link>
                        <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                          <span>
                            {prop.address}, {prop.city}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type & Specs */}
                  <td className="py-4 px-4 min-w-[160px]">
                    <span className="inline-block font-medium text-slate-800 dark:text-slate-200 text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 mb-1">
                      {prop.type}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1" title="Bedrooms">
                        <Bed className="w-3.5 h-3.5 text-slate-400" /> {prop.bedrooms} bd
                      </span>
                      <span className="flex items-center gap-1" title="Bathrooms">
                        <Bath className="w-3.5 h-3.5 text-slate-400" /> {prop.bathrooms} ba
                      </span>
                      {prop.area && (
                        <span className="flex items-center gap-1" title="Area">
                          <Maximize2 className="w-3 h-3 text-slate-400" /> {prop.area} sqft
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Occupancy Units */}
                  <td className="py-4 px-4 min-w-[150px]">
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {occupied} / {total} Units
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {occupancyPct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct >= 90
                            ? 'bg-emerald-500'
                            : occupancyPct >= 50
                            ? 'bg-sky-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </td>

                  {/* Rent */}
                  <td className="py-4 px-4 whitespace-nowrap min-w-[120px]">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${Number(prop.monthlyRent || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-normal"> / mo</span>
                    {prop.deposit > 0 && (
                      <p className="text-[11px] text-slate-400">
                        ${Number(prop.deposit).toLocaleString()} dep
                      </p>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 whitespace-nowrap min-w-[110px]">
                    <StatusBadge status={prop.status} size="sm" />
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap min-w-[140px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/owner/properties/${prop.id}`}>
                        <button
                          type="button"
                          aria-label="View property details"
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>

                      <Link to={`/owner/properties/${prop.id}/edit`}>
                        <button
                          type="button"
                          aria-label="Edit property"
                          title="Edit Property"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 dark:text-slate-400 dark:hover:text-amber-300 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>

                      {onDelete && (
                        <button
                          type="button"
                          aria-label="Delete property"
                          title="Delete Property"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to remove "${prop.name}" from your portfolio?`
                              )
                            ) {
                              onDelete(prop.id)
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
