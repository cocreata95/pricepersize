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

      const formData = new FormData()
      formData.append('receipt', file)
      formData.append('userId', user.id)

      if (!supabase) throw new Error('Service unavailable')
      const { data: { session } } = await supabase.auth.getSession()
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

      // Debug logging — check browser console
      console.log('=== RECEIPT SCAN DEBUG ===')
      console.log('Supabase URL:', supabaseUrl)
      console.log('Anon key present:', !!anonKey, 'length:', anonKey?.length)
      console.log('Session present:', !!session)
      console.log('Access token present:', !!session?.access_token, 'length:', session?.access_token?.length)
      console.log('User ID:', user.id)
      console.log('File:', file.name, file.type, file.size, 'bytes')

      const authToken = session?.access_token || anonKey
      console.log('Using auth token type:', session?.access_token ? 'session' : 'anon_key')
      console.log('Auth token first 20 chars:', authToken?.substring(0, 20))

      const functionUrl = `${supabaseUrl}/functions/v1/receipt_scan`
      console.log('Calling:', functionUrl)

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': anonKey,
        },
        body: formData,
      })

      console.log('Response status:', response.status, response.statusText)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      // Always read the body so we surface the real error
      let result
      const responseText = await response.text()
      console.log('Response body:', responseText)
      
      try {
        result = JSON.parse(responseText)
      } catch {
        throw new Error(`Function returned ${response.status}: ${responseText || response.statusText}`)
      }

      if (!response.ok) {
        throw new Error(result?.error || result?.message || result?.msg || `Function error (${response.status}): ${responseText}`)
      }

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
