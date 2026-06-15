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
        style={{
          backgroundColor: uploading ? '#555' : '#2D6A4F',
          cursor: uploading ? 'not-allowed' : 'pointer',
          boxShadow: uploading ? 'none' : '0 2px 8px rgba(45,106,79,0.35)'
        }}
        className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-full select-none transition-all"
      >
        {uploading ? (
          <>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.5" strokeDasharray="8 6" />
            </svg>
            Classifying...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Upload
          </>
        )}
      </label>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
