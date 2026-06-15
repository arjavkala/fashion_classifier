import React from 'react'
import AnnotationField from './AnnotationField'

function extractFilename(filePath) {
  return filePath ? filePath.split('/').pop() : ''
}

function ColorDot({ color }) {
  return (
    <span
      title={color}
      style={{ backgroundColor: color, border: '1px solid #ccc', display: 'inline-block', width: 14, height: 14, borderRadius: '50%' }}
    />
  )
}

function locationString(location) {
  if (!location) return null
  const parts = [location.continent, location.country, location.city].filter(Boolean)
  return parts.length ? parts.join(' > ') : null
}

export default function ImageGrid({ images, onAnnotationSave }) {
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-center">
        <p>No images yet. Upload your first garment photo.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map(img => {
        const filename = extractFilename(img.file_path)
        const loc = locationString(img.location)

        return (
          <div key={img.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="relative aspect-square bg-gray-100">
              <img
                src={`/uploads/${filename}`}
                alt={img.garment_type || 'garment'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-3 flex flex-col gap-2 flex-1">
              <div className="flex flex-wrap gap-1">
                {img.garment_type && (
                  <span style={{ backgroundColor: '#2D6A4F' }} className="text-white text-xs px-2 py-0.5 rounded-full">
                    {img.garment_type}
                  </span>
                )}
                {img.style && (
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    {img.style}
                  </span>
                )}
              </div>

              {img.description && (
                <p className="text-xs text-gray-600 line-clamp-2">{img.description}</p>
              )}

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                {img.occasion && <span>Occasion: {img.occasion}</span>}
                {img.season && <span>Season: {img.season}</span>}
                {img.material && <span>Material: {img.material}</span>}
                {img.pattern && <span>Pattern: {img.pattern}</span>}
              </div>

              {img.color_palette && img.color_palette.length > 0 && (
                <div className="flex gap-1 items-center flex-wrap">
                  {img.color_palette.map((c, i) => <ColorDot key={i} color={c} />)}
                </div>
              )}

              {loc && (
                <p className="text-xs text-gray-400 italic">{loc}</p>
              )}

              <AnnotationField
                recordId={img.id}
                initialAnnotations={img.annotations}
                initialTags={img.annotation_tags}
                onSave={onAnnotationSave}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
