'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import './ReviewItems.css'

export default function ReviewItems({ scanResult, user, onConfirm, onCancel }) {
  const { receipt_id, data } = scanResult
  const [items, setItems] = useState(
    data.items.map((item, i) => ({ ...item, _id: i, selected: true }))
  )
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const handleToggle = (id) => {
    setItems(items.map(item =>
      item._id === id ? { ...item, selected: !item.selected } : item
    ))
  }

  const handleEdit = (id, field, value) => {
    setItems(items.map(item =>
      item._id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleRemove = (id) => {
    setItems(items.filter(item => item._id !== id))
  }

  const selectedItems = items.filter(i => i.selected)

  const handleConfirm = async () => {
    if (selectedItems.length === 0) return
    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      // Save confirmed items to pantry + price history
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/confirm-receipt`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receipt_id,
            user_id: user.id,
            store_name: data.store_name,
            purchase_date: data.purchase_date || new Date().toISOString().split('T')[0],
            total_amount: data.total_amount,
            items: selectedItems.map(({ _id, selected, ...rest }) => rest),
          }),
        }
      )

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      onConfirm?.(result)
    } catch (err) {
      alert(err.message || 'Failed to save items')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="review-overlay">
      <div className="review-modal">
        {/* Header */}
        <div className="review-header">
          <div className="review-header-left">
            <h2 className="review-title">✅ Receipt Scanned</h2>
            <p className="review-meta">
              {data.store_name && <span className="store-name">{data.store_name}</span>}
              {data.purchase_date && <span className="purchase-date">{data.purchase_date}</span>}
              {data.total_amount && <span className="total-amount">Total: ₹{data.total_amount}</span>}
            </p>
          </div>
          <button className="review-close" onClick={onCancel}>✕</button>
        </div>

        {/* Confidence indicator */}
        {data.overall_confidence && (
          <div className={`confidence-bar ${data.overall_confidence >= 0.8 ? 'high' : data.overall_confidence >= 0.6 ? 'medium' : 'low'}`}>
            AI Confidence: {Math.round(data.overall_confidence * 100)}%
          </div>
        )}

        {/* Items list */}
        <div className="review-items">
          <p className="items-count">Review items ({items.length} found):</p>

          {items.map((item) => (
            <div key={item._id} className={`review-item ${!item.selected ? 'deselected' : ''} ${item.confidence < 0.7 ? 'low-confidence' : ''}`}>
              <button
                className={`item-check ${item.selected ? 'checked' : ''}`}
                onClick={() => handleToggle(item._id)}
              >
                {item.selected ? '✓' : ''}
              </button>

              <div className="item-details">
                {editingId === item._id ? (
                  <div className="item-edit-form">
                    <input
                      type="text"
                      className="item-edit-input"
                      value={item.item_name}
                      onChange={(e) => handleEdit(item._id, 'item_name', e.target.value)}
                      autoFocus
                    />
                    <div className="item-edit-row">
                      <input
                        type="number"
                        className="item-edit-small"
                        value={item.size || ''}
                        onChange={(e) => handleEdit(item._id, 'size', e.target.value)}
                        placeholder="Size"
                      />
                      <input
                        type="text"
                        className="item-edit-small"
                        value={item.unit || ''}
                        onChange={(e) => handleEdit(item._id, 'unit', e.target.value)}
                        placeholder="Unit"
                      />
                      <input
                        type="number"
                        className="item-edit-small"
                        value={item.price || ''}
                        onChange={(e) => handleEdit(item._id, 'price', e.target.value)}
                        placeholder="Price"
                      />
                    </div>
                    <button className="item-edit-done" onClick={() => setEditingId(null)}>Done</button>
                  </div>
                ) : (
                  <>
                    <div className="item-name-line">
                      <span className="item-name">
                        {item.brand ? `${item.brand} ` : ''}{item.item_name}
                      </span>
                      {item.size && item.unit && (
                        <span className="item-size">{item.size}{item.unit}</span>
                      )}
                    </div>
                    <div className="item-price-line">
                      {item.price && <span className="item-price">₹{Number(item.price).toFixed(2)}</span>}
                      {item.price_per_unit && (
                        <span className="item-per-unit">₹{Number(item.price_per_unit).toFixed(2)}/{item.unit}</span>
                      )}
                      {item.confidence < 0.7 && (
                        <span className="item-warning">⚠️ Low confidence</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="item-actions">
                <button className="item-edit-btn" onClick={() => setEditingId(editingId === item._id ? null : item._id)}>
                  ✏️
                </button>
                <button className="item-remove-btn" onClick={() => handleRemove(item._id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="review-actions">
          <button className="review-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="review-save"
            onClick={handleConfirm}
            disabled={saving || selectedItems.length === 0}
          >
            {saving ? 'Saving...' : `Save to Pantry (${selectedItems.length} items)`}
          </button>
        </div>
      </div>
    </div>
  )
}
