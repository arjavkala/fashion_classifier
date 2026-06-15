import React from 'react'

const FILTER_LABELS = {
  garment_type: 'Garment Type',
  style: 'Style',
  occasion: 'Occasion',
  season: 'Season',
  material: 'Material',
  pattern: 'Pattern',
  continent: 'Continent',
  country: 'Country',
  city: 'City',
  year: 'Year',
  month: 'Month',
}

const ROW1 = ['garment_type', 'style', 'occasion', 'season', 'material', 'pattern']
const ROW2 = ['continent', 'country', 'city', 'year', 'month']

export default function Filters({ filters, activeFilters, onFilterChange }) {
  const hasAnyActive = Object.values(activeFilters).some(v => v)

  const renderSelect = (key) => {
    const options = filters[key] || []
    if (options.length === 0) return null
    const isActive = !!activeFilters[key]
    return (
      <select
        key={key}
        value={activeFilters[key] || ''}
        onChange={e => onFilterChange(key, e.target.value)}
        style={{ borderColor: isActive ? '#2D6A4F' : undefined, borderWidth: isActive ? '2px' : undefined }}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
      >
        <option value="">All {FILTER_LABELS[key]}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        {ROW1.map(renderSelect)}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {ROW2.map(renderSelect)}
        {hasAnyActive && (
          <button
            onClick={() => Object.keys(activeFilters).forEach(k => onFilterChange(k, ''))}
            className="text-xs text-red-500 underline ml-2"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}
