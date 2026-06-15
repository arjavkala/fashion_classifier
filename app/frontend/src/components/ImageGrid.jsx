import React from 'react'
import { resolveColor } from '../utils/colorUtils'

function extractFilename(filePath) {
  return filePath ? filePath.split('/').pop() : ''
}

function locationString(location) {
  if (!location) return null
  const parts = [location.city, location.country].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

export default function ImageGrid({ images, onCardClick }) {
  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div style={{ width: 64, height: 64, backgroundColor: '#EBF5EF', borderRadius: '50%' }} className="flex items-center justify-center mb-4 mx-auto">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 4v20M4 14h20" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="font-display text-xl text-gray-400 mb-1">Your library is empty</p>
        <p className="text-sm text-gray-400">Upload your first garment to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map(img => {
        const filename = extractFilename(img.file_path)
        const loc = locationString(img.location)
        const hasNotes = !!(img.annotations || (img.annotation_tags && img.annotation_tags.length > 0))

        return (
          <div
            key={img.id}
            onClick={() => onCardClick && onCardClick(img)}
            className="card-hover bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm"
          >
            {/* Portrait image with overlay */}
            <div className="relative img-overlay" style={{ aspectRatio: '3/4' }}>
              <img
                src={`/uploads/${filename}`}
                alt={img.garment_type || 'garment'}
                className="w-full h-full object-cover"
              />
              {/* Garment type badge overlaid on image */}
              {img.garment_type && (
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 z-10">
                  <span className="text-white text-xs font-medium capitalize tracking-wide truncate block">
                    {img.garment_type}
                  </span>
                </div>
              )}
              {/* Annotation indicator */}
              {hasNotes && (
                <div
                  className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full z-10"
                  style={{ backgroundColor: '#F59E0B' }}
                  title="Has notes"
                />
              )}
            </div>

            {/* Card body */}
            <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1.5">
              {img.style && (
                <p className="text-sm font-medium text-gray-800 capitalize leading-snug">{img.style}</p>
              )}

              {img.description && (
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{img.description}</p>
              )}

              {/* Chips row */}
              <div className="flex flex-wrap gap-1 mt-0.5">
                {img.occasion && (
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    {img.occasion}
                  </span>
                )}
                {img.season && (
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    {img.season}
                  </span>
                )}
              </div>

              {/* Color swatches */}
              {img.color_palette && img.color_palette.length > 0 && (
                <div className="flex gap-1 items-center mt-0.5">
                  {img.color_palette.map((c, i) => (
                    <span
                      key={i}
                      title={c}
                      style={{ backgroundColor: resolveColor(c), border: '1.5px solid #F0EEE9', width: 12, height: 12, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}
                    />
                  ))}
                </div>
              )}

              {loc && (
                <p className="text-xs text-gray-300 mt-0.5">{loc}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
