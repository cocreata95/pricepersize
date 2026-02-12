'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import './ReceiptScanner.css'

export default function ReceiptScanner({ user, onScanComplete, onAuthRequired }) {
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleScan = async (file) => {
    if (!user) {
      onAuthRequired?.()
      return
    }

    setScanning(true)
    setError(null)
    setProgress('Uploading receipt...')

    try {
      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a JPG, PNG, or WebP image')
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image too large. Max 10MB.')
      }

      setProgress('Scanning with AI...')

      // Call Supabase Edge Function
      const formData = new FormData()
      formData.append('receipt', file)
      formData.append('userId', user.id)

      if (!supabase) throw new Error('Service unavailable')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/receipt_scan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      )

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to scan receipt')
      }

      setProgress('Done!')
      onScanComplete?.(result)

    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
      setProgress('')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) handleScan(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleScan(file)
  }

  return (
    <section className="receipt-scanner" id="receipt-scanner">
      <div className="scanner-container">
        <div className="scanner-header">
          <span className="scanner-badge">New</span>
          <h2 className="scanner-title">📸 Scan Your Receipt</h2>
          <p className="scanner-subtitle">
            Snap a photo of your grocery receipt. Our AI extracts every item, price, 
            and size — building your personal pantry instantly.
          </p>
        </div>

        {/* Value Props */}
        <div className="scanner-benefits">
          <div className="benefit">
            <span className="benefit-icon">🧠</span>
            <span className="benefit-text">AI reads items, prices & sizes</span>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🏠</span>
            <span className="benefit-text">Auto-builds your pantry list</span>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🔍</span>
            <span className="benefit-text">Search before buying duplicates</span>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''} ${scanning ? 'scanning' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !scanning && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={handleFileSelect}
            className="file-input"
          />

          {scanning ? (
            <div className="scan-progress">
              <div className="scan-spinner"></div>
              <span className="scan-text">{progress}</span>
            </div>
          ) : (
            <>
              <div className="upload-icon">📷</div>
              <p className="upload-main">
                {dragActive ? 'Drop your receipt here' : 'Tap to scan receipt'}
              </p>
              <p className="upload-sub">Take a photo or upload from gallery</p>
              <p className="upload-formats">JPG, PNG, WebP • Max 10MB</p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="scan-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Sign in prompt for non-authenticated users */}
        {!user && (
          <div className="auth-prompt">
            <p className="auth-prompt-text">
              <button className="auth-prompt-btn" onClick={onAuthRequired}>
                Sign in
              </button> to scan receipts and track your pantry
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
