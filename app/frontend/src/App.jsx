import React, { useState, useEffect, useCallback } from 'react'
import ImageGrid from './components/ImageGrid'
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

export default function App() {
  const [images, setImages] = useState([])
  const [filters, setFilters] = useState({})
  const [activeFilters, setActiveFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const debouncedQuery = useDebounce(searchQuery, 300)

  const fetchImages = useCallback(async () => {
    const params = new URLSearchParams()
    Object.entries(activeFilters).forEach(([k, v]) => { if (v) params.set(k, v) })
    if (debouncedQuery) params.set('q', debouncedQuery)
    const res = await fetch(`/api/images?${params.toString()}`)
    const data = await res.json()
    setImages(data)
  }, [activeFilters, debouncedQuery])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  useEffect(() => {
    fetch('/api/images/filters')
      .then(r => r.json())
      .then(setFilters)
  }, [])

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleUploadSuccess = (newRecord) => {
    setImages(prev => [newRecord, ...prev])
    fetch('/api/images/filters').then(r => r.json()).then(setFilters)
  }

  const handleAnnotationSave = (id, annotations, tags) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, annotations, annotation_tags: tags } : img
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ backgroundColor: '#1a1a2e' }} className="py-6 px-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white">Fashion Classifier</h1>
        <p className="text-gray-300 text-sm mt-1">AI-powered garment inspiration library</p>
      </header>

      <div className="px-8 py-4 flex items-center gap-4 bg-white border-b border-gray-200">
        <input
          type="text"
          placeholder="Search descriptions, annotations, tags..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <UploadButton onUploadSuccess={handleUploadSuccess} setLoading={setLoading} />
      </div>

      <div className="px-8 py-3 bg-white border-b border-gray-100">
        <Filters
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <main className="px-8 py-6">
        <ImageGrid images={images} onAnnotationSave={handleAnnotationSave} />
      </main>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl px-8 py-6 shadow-xl text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Classifying image...</p>
          </div>
        </div>
      )}
    </div>
  )
}
