import React, { useState, useEffect, useCallback } from 'react'
import ImageGrid from './components/ImageGrid'
import ImageModal from './components/ImageModal'
import Filters from './components/Filters'
import UploadButton from './components/UploadButton'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function App() {
  const [images, setImages] = useState([])
  const [filters, setFilters] = useState({})
  const [activeFilters, setActiveFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const debouncedQuery = useDebounce(searchQuery, 300)

  const fetchImages = useCallback(async () => {
    const params = new URLSearchParams()
    Object.entries(activeFilters).forEach(([k, v]) => { if (v) params.set(k, v) })
    if (debouncedQuery) params.set('q', debouncedQuery)
    const res = await fetch(`/api/images?${params.toString()}`)
    const data = await res.json()
    setImages(data)
  }, [activeFilters, debouncedQuery])

  useEffect(() => { fetchImages() }, [fetchImages])

  useEffect(() => {
    fetch('/api/images/filters').then(r => r.json()).then(setFilters)
  }, [])

  const refreshFilters = () => fetch('/api/images/filters').then(r => r.json()).then(setFilters)

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleUploadSuccess = (newRecord) => {
    setImages(prev => [newRecord, ...prev])
    refreshFilters()
  }

  const handleAnnotationSave = (id, annotations, tags) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, annotations, annotation_tags: tags } : img
    ))
    if (selectedImage?.id === id) {
      setSelectedImage(prev => ({ ...prev, annotations, annotation_tags: tags }))
    }
  }

  const handleDelete = async (id) => {
    await fetch(`/api/images/${id}`, { method: 'DELETE' })
    setImages(prev => prev.filter(img => img.id !== id))
    setSelectedImage(null)
    refreshFilters()
  }

  const isFiltered = Object.values(activeFilters).some(v => v) || !!debouncedQuery
  const hasFilters = Object.values(filters).some(arr => arr.length > 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7F4' }}>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: '#111111' }}>
        <div className="px-6 md:px-10 py-4 flex items-center gap-4 md:gap-6">

          {/* Brand */}
          <div className="flex-shrink-0 pr-2 md:pr-4 border-r border-white/10">
            <h1 className="font-display text-lg text-white tracking-wide leading-none">Fashion</h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5">Classifier</p>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by style, material, description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-sm text-white placeholder-gray-600 rounded-full px-4 py-2.5 pl-10 focus:outline-none transition-all"
              style={{ backgroundColor: '#1E1E1E', border: '1.5px solid #2A2A2A' }}
              onFocus={e => e.target.style.borderColor = '#3D3D3D'}
              onBlur={e => e.target.style.borderColor = '#2A2A2A'}
            />
          </div>

          {/* Count + Upload */}
          <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xl font-semibold text-white leading-none">{images.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">
                {isFiltered ? 'results' : 'pieces'}
              </p>
            </div>
            <UploadButton onUploadSuccess={handleUploadSuccess} setLoading={setLoading} />
          </div>
        </div>

        {/* Filter bar */}
        {hasFilters && (
          <div
            className="px-6 md:px-10 py-2.5 overflow-x-auto"
            style={{ backgroundColor: '#181818', borderTop: '1px solid #1E1E1E' }}
          >
            <Filters
              filters={filters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}
      </header>

      {/* Grid */}
      <main className="px-6 md:px-10 py-8">
        <ImageGrid
          images={images}
          onCardClick={setSelectedImage}
        />
      </main>

      {/* Upload loading overlay */}
      {loading && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(15,15,20,0.70)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-2xl px-10 py-8 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent mx-auto mb-4" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
            <p className="font-medium text-gray-800">Classifying image...</p>
            <p className="text-xs text-gray-400 mt-1">Claude is analysing your garment</p>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDelete={handleDelete}
          onAnnotationSave={handleAnnotationSave}
        />
      )}
    </div>
  )
}
