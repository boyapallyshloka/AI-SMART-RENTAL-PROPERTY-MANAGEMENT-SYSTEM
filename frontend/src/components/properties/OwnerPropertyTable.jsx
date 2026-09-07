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
      <div className="bg-white rounded-lg border border-[#D9E0E6] p-8 shadow-2xs">
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
    <div className="bg-white rounded-lg border border-[#D9E0E6] shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-bold uppercase tracking-wider text-[#5B6875]">
              <th className="py-3.5 pl-6 pr-4">Property</th>
              <th className="py-3.5 px-4">Type & Layout</th>
              <th className="py-3.5 px-4">Occupancy</th>
              <th className="py-3.5 px-4">Rent</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9E0E6] text-sm">
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
                  className="hover:bg-[#F7F8FA] transition-colors group"
                >
                  {/* Property Name & Thumbnail */}
                  <td className="py-4 pl-6 pr-4 min-w-[260px]">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={firstImage}
                        alt={prop.name}
                        className="w-14 h-14 rounded-md object-cover shrink-0 border border-[#D9E0E6] shadow-2xs"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
                        }}
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/owner/properties/${prop.id}`}
                          className="font-semibold text-[#243447] hover:text-[#315A7D] transition-colors line-clamp-1"
                        >
                          {prop.name}
                        </Link>
                        <p className="flex items-center gap-1 text-xs text-[#5B6875] mt-0.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0 text-[#5B6875]" />
                          <span>
                            {prop.address}, {prop.city}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type & Specs */}
                  <td className="py-4 px-4 min-w-[160px]">
                    <span className="inline-block font-medium text-[#243447] text-xs px-2 py-0.5 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] mb-1">
                      {prop.type}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-[#5B6875]">
                      <span className="flex items-center gap-1" title="Bedrooms">
                        <Bed className="w-3.5 h-3.5 text-[#5B6875]" /> {prop.bedrooms} bd
                      </span>
                      <span className="flex items-center gap-1" title="Bathrooms">
                        <Bath className="w-3.5 h-3.5 text-[#5B6875]" /> {prop.bathrooms} ba
                      </span>
                      {prop.area && (
                        <span className="flex items-center gap-1" title="Area">
                          <Maximize2 className="w-3 h-3 text-[#5B6875]" /> {prop.area} sqft
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Occupancy Units */}
                  <td className="py-4 px-4 min-w-[150px]">
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="font-semibold text-[#243447]">
                        {occupied} / {total} Units
                      </span>
                      <span className="text-[11px] text-[#5B6875] font-medium">
                        {occupancyPct}%
                      </span>
                    </div>
                    <div className="w-full bg-[#F7F8FA] border border-[#D9E0E6] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct >= 90
                            ? 'bg-[#3F7D58]'
                            : occupancyPct >= 50
                            ? 'bg-[#315A7D]'
                            : 'bg-[#B7791F]'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </td>

                  {/* Rent */}
                  <td className="py-4 px-4 whitespace-nowrap min-w-[120px]">
                    <span className="font-bold text-[#243447]">
                      ${Number(prop.monthlyRent || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-[#5B6875] font-normal"> / mo</span>
                    {prop.deposit > 0 && (
                      <p className="text-[11px] text-[#5B6875]">
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
                          className="p-1.5 rounded-md text-[#5B6875] hover:text-[#315A7D] hover:bg-[#EAF2F7] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>

                      <Link to={`/owner/properties/${prop.id}/edit`}>
                        <button
                          type="button"
                          aria-label="Edit property"
                          title="Edit Property"
                          className="p-1.5 rounded-md text-[#5B6875] hover:text-[#B7791F] hover:bg-[#FEF7EC] transition-colors"
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
                          className="p-1.5 rounded-md text-[#5B6875] hover:text-[#B94A48] hover:bg-[#FDF2F2] transition-colors"
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
