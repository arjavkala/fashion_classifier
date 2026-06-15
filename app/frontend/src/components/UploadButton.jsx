import React, { useState, useRef } from 'react'

export default function UploadButton({ onUploadSuccess, setLoading }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  const handleChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setError(null)
    setUploading(true)
    setLoading(true)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Upload failed')
      }
      const record = await res.json()
      onUploadSuccess(record)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setLoading(false)
      inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
        id="upload-input"
      />
      <label
        htmlFor="upload-input"
        style={{ backgroundColor: uploading ? '#555' : '#2D6A4F', cursor: uploading ? 'not-allowed' : 'pointer' }}
        className="text-white text-sm font-medium px-4 py-2 rounded-lg select-none transition-colors"
      >
        {uploading ? 'Classifying...' : 'Upload Image'}
      </label>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
