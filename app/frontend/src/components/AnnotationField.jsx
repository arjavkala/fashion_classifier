import React, { useState } from 'react'

export default function AnnotationField({ recordId, initialAnnotations, initialTags, onSave }) {
  const [text, setText] = useState(initialAnnotations || '')
  const [tags, setTags] = useState(initialTags || [])
  const [tagInput, setTagInput] = useState('')
  const [saved, setSaved] = useState(false)

  const save = async (annotations, currentTags) => {
    await fetch(`/api/images/${recordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ annotations, annotation_tags: currentTags }),
    })
    onSave(recordId, annotations, currentTags)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim().replace(/,$/, '')
      if (val && !tags.includes(val)) {
        const newTags = [...tags, val]
        setTags(newTags)
        save(text, newTags)
      }
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    const newTags = tags.filter(t => t !== tag)
    setTags(newTags)
    save(text, newTags)
  }

  return (
    <div
      style={{ backgroundColor: '#FEFCE8', borderLeft: '3px solid #F59E0B' }}
      className="mt-3 p-3 rounded-r"
    >
      <p style={{ color: '#92400E' }} className="text-xs italic mb-2">Your notes</p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={() => save(text, tags)}
        placeholder="Add notes about this garment..."
        rows={2}
        className="w-full text-xs border border-amber-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
      />

      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map(tag => (
          <span
            key={tag}
            style={{ backgroundColor: '#FDE68A', color: '#78350F' }}
            className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="font-bold hover:text-red-600">×</button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add tag..."
          className="text-xs border border-amber-200 rounded px-2 py-0.5 bg-white focus:outline-none w-24"
        />
      </div>

      {saved && <p className="text-xs text-green-600 mt-1">Saved</p>}
    </div>
  )
}
