import React, { useEffect, useState } from 'react'
import AnnotationField from './AnnotationField'
import { resolveColor } from '../utils/colorUtils'

export default function ImageModal({ image, onClose, onDelete, onAnnotationSave }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const filename = image.file_path ? image.file_path.split('/').pop() : ''

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const loc = image.location
    ? [image.location.city, image.location.country, image.location.continent].filter(Boolean).join(', ')
    : null

  const addedDate = image.created_at
    ? new Date(image.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const attrs = [
    { label: 'Occasion', value: image.occasion },
    { label: 'Season', value: image.season },
    { label: 'Pattern', value: image.pattern },
    { label: 'Material', value: image.material },
    { label: 'Consumer Profile', value: image.consumer_profile },
    { label: 'Trend Notes', value: image.trend_notes },
  ].filter(a => a.value)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ backgroundColor: 'rgba(15,15,20,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl overflow-hidden w-full flex shadow-2xl"
        style={{ maxWidth: '960px', maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left: Image */}
        <div className="flex-shrink-0 bg-gray-100 relative" style={{ width: '44%' }}>
          <img
            src={`/uploads/${filename}`}
            alt={image.garment_type || 'garment'}
            className="w-full h-full object-cover"
            style={{ maxHeight: '92vh' }}
          />
          {/* Type badge on image */}
          {image.garment_type && (
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }}>
              <p className="text-white text-sm font-medium capitalize tracking-wide">{image.garment_type}</p>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex-1 thin-scroll overflow-y-auto flex flex-col" style={{ padding: '32px' }}>

          {/* Top row: style + close */}
          <div className="flex justify-between items-start mb-5">
            <div>
              {image.style && (
                <p className="font-display text-xl text-gray-900 capitalize leading-snug">{image.style}</p>
              )}
              {(loc || addedDate) && (
                <p className="text-xs text-gray-400 mt-1">
                  {loc && <span>📍 {loc}</span>}
                  {loc && addedDate && <span className="mx-2">·</span>}
                  {addedDate && <span>{addedDate}</span>}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-colors"
              style={{ backgroundColor: '#F3F4F6', color: '#9CA3AF' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#E5E7EB'; e.currentTarget.style.color = '#374151' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#9CA3AF' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Description */}
          {image.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{image.description}</p>
          )}

          <div style={{ height: 1, backgroundColor: '#F3F4F6' }} className="mb-5" />

          {/* Attribute grid */}
          {attrs.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-5">
              {attrs.map(({ label, value }) => (
                <div key={label} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F8F7F4' }}>
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
                  <p className="text-sm font-medium capitalize" style={{ color: '#374151' }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Color palette */}
          {image.color_palette && image.color_palette.length > 0 && (
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider mb-2.5" style={{ color: '#9CA3AF' }}>Color Palette</p>
              <div className="flex flex-wrap gap-3">
                {image.color_palette.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: resolveColor(c), border: '1.5px solid #F0EEE9', width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }}
                    />
                    <span className="text-xs capitalize" style={{ color: '#6B7280' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 1, backgroundColor: '#F3F4F6' }} className="mb-5" />

          {/* Annotations */}
          <AnnotationField
            recordId={image.id}
            initialAnnotations={image.annotations}
            initialTags={image.annotation_tags}
            onSave={onAnnotationSave}
          />

          {/* Delete */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Remove this garment?</span>
                <button
                  onClick={() => onDelete(image.id)}
                  className="text-xs text-white px-3 py-1.5 rounded-full transition-colors"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs transition-colors"
                style={{ color: '#9CA3AF' }}
                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
              >
                Delete garment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
