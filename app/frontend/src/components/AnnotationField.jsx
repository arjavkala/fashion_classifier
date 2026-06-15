import React, { useState } from 'react'

export default function AnnotationField({ recordId, initialAnnotations, initialTags, onSave }) {
  const [text, setText] = useState(initialAnnotations || '')
  const [tags, setTags] = useState(initialTags || [])
  const [tagInput, setTagInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async (annotations, currentTags) => {
    setSaving(true)
    await fetch(`/api/images/${recordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ annotations, annotation_tags: currentTags }),
    })
    onSave(recordId, annotations, currentTags)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const addTag = () => {
    const val = tagInput.trim().replace(/,$/, '')
    if (val && !tags.includes(val)) {
      const newTags = [...tags, val]
      setTags(newTags)
      save(text, newTags)
    }
    setTagInput('')
  }

  const removeTag = (tag) => {
    const newTags = tags.filter(t => t !== tag)
    setTags(newTags)
    save(text, newTags)
  }

  return (
    <div style={{ backgroundColor: '#FEFCE8', borderLeft: '3px solid #F59E0B' }} className="p-3 rounded-r">
      <div className="flex items-center justify-between mb-2">
        <p style={{ color: '#92400E' }} className="text-xs font-medium italic">Your notes</p>
        {saved && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Saved
          </span>
        )}
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={() => { if (text !== (initialAnnotations || '')) save(text, tags) }}
        placeholder="Add notes about this garment..."
        rows={2}
        className="w-full text-xs border border-amber-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
      />

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2 items-center min-h-[24px]">
        {tags.map(tag => (
          <span
            key={tag}
            style={{ backgroundColor: '#FDE68A', color: '#78350F' }}
            className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-red-600 transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder={tags.length === 0 ? 'Add tag...' : '+tag'}
          className="text-xs border border-amber-200 rounded-lg px-2 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-300"
          style={{ width: tags.length === 0 ? '80px' : '56px' }}
        />
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-2">
        <button
          onClick={() => save(text, tags)}
          disabled={saving}
          style={{ backgroundColor: saving ? '#9CA3AF' : '#2D6A4F' }}
          className="text-white text-xs px-3 py-1 rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save note'}
        </button>
      </div>
    </div>
  )
}
