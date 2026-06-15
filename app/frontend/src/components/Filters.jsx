import React from 'react'

const FILTER_LABELS = {
  garment_type: 'Type',
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
  const activeCount = Object.values(activeFilters).filter(v => v).length

  const renderSelect = (key) => {
    const options = filters[key] || []
    if (options.length === 0) return null
    const isActive = !!activeFilters[key]

    return (
      <div key={key} className="relative inline-block">
        <select
          value={activeFilters[key] || ''}
          onChange={e => onFilterChange(key, e.target.value)}
          className="select-pill text-xs rounded-full pl-3 pr-7 py-1.5 cursor-pointer focus:outline-none transition-all"
          style={{
            border: isActive ? '1.5px solid #2D6A4F' : '1.5px solid #E8E6E3',
            backgroundColor: isActive ? '#EBF5EF' : '#FFFFFF',
            color: isActive ? '#2D6A4F' : '#6B7280',
            fontWeight: isActive ? '500' : '400',
          }}
        >
          <option value="">All {FILTER_LABELS[key]}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  const row1Items = ROW1.map(renderSelect).filter(Boolean)
  const row2Items = ROW2.map(renderSelect).filter(Boolean)

  if (row1Items.length === 0 && row2Items.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {row1Items}
      {row1Items.length > 0 && row2Items.length > 0 && (
        <div style={{ width: 1, height: 20, backgroundColor: '#E8E6E3' }} className="mx-1" />
      )}
      {row2Items}
      {activeCount > 0 && (
        <button
          onClick={() => Object.keys(activeFilters).forEach(k => onFilterChange(k, ''))}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 rounded-full px-3 py-1.5 transition-all ml-1"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {activeCount} {activeCount === 1 ? 'filter' : 'filters'}
        </button>
      )}
    </div>
  )
}
