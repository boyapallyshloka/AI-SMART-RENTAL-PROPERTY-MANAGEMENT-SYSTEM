import React from 'react'
import PropertyCard from './PropertyCard'
import {
  Home,
  SearchX,
  ArrowUpDown,
  Sparkles,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react'

/**
 * PropertyGrid Component
 * Renders a responsive grid of property cards or a helpful empty state.
 *
 * @param {Object} props
 * @param {Array} props.properties - List of filtered properties
 * @param {Function} [props.onSelectProperty] - Callback when property is clicked
 * @param {string} [props.sortBy] - Current sort key
 * @param {Function} [props.onSortChange] - Callback when sort changes
 * @param {Function} [props.onResetFilters] - Callback to reset all filters
 * @param {Array} [props.favoriteIds=[]] - Array of property IDs marked as favorites
 * @param {Function} [props.onToggleFavorite] - Callback for toggling favorite
 * @param {boolean} [props.isLoading=false] - Loading indicator
 */
export default function PropertyGrid({
  properties = [],
  onSelectProperty,
  sortBy = 'ai_match',
  onSortChange,
  onResetFilters,
  favoriteIds = [],
  onToggleFavorite,
  isLoading = false,
}) {
  // Empty State handler
  if (!isLoading && properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center my-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
          <SearchX className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          No matching properties found
        </h3>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          We couldn’t find any rental listings matching all your filter criteria.
          Try adjusting your budget range, expanding locations, or clearing your filters.
        </p>

        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All Filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Results Bar & Sorting Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Available Rentals</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked with personalized HomeSphere AI Tenant Matching
          </p>
        </div>

        {/* Sort selector */}
        {onSortChange && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ai_match">Best AI Match</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="bedrooms_desc">Most Bedrooms</option>
              <option value="area_desc">Largest Area</option>
            </select>
          </div>
        )}
      </div>

      {/* Responsive Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onSelect={onSelectProperty}
            isFavorite={favoriteIds.includes(property.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  )
}
