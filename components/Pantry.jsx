'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import PantrySearch from './PantrySearch'
import './Pantry.css'

export default function Pantry({ user }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('have') // 'have' | 'used_up' | 'all'
  const [searchResults, setSearchResults] = useState(null)

  const fetchItems = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      let query = supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('Failed to fetch pantry:', err)
    } finally {
      setLoading(false)
    }
  }, [user, filter])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const toggleStatus = async (itemId, currentStatus) => {
    const newStatus = currentStatus === 'have' ? 'used_up' : 'have'
    try {
      const { error } = await supabase
        .from('pantry_items')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', itemId)
      if (error) throw error
      setItems(items.map(i => i.id === itemId ? { ...i, status: newStatus } : i))
    } catch (err) {
      console.error('Failed to update:', err)
    }
  }

  const deleteItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', itemId)
      if (error) throw error
      setItems(items.filter(i => i.id !== itemId))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const displayItems = searchResults !== null ? searchResults : items
  const haveCount = items.filter(i => i.status === 'have').length
  const usedCount = items.filter(i => i.status === 'used_up').length

  if (!user) {
    return (
      <section className="pantry-section" id="pantry">
        <div className="pantry-container">
          <div className="pantry-header-info">
            <span className="pantry-emoji">🏠</span>
            <h2 className="pantry-title">Your Pantry</h2>
            <p className="pantry-desc">
              Track what you have at home. Never buy duplicates again.
            </p>
          </div>
          <div className="pantry-auth-prompt">
            <p>Sign in to view and manage your pantry inventory.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pantry-section" id="pantry">
      <div className="pantry-container">
        <div className="pantry-header-info">
          <span className="pantry-emoji">🏠</span>
          <h2 className="pantry-title">Your Pantry</h2>
          <p className="pantry-desc">
            {haveCount} items in stock · {usedCount} used up
          </p>
        </div>

        {/* Search */}
        <PantrySearch user={user} onResults={setSearchResults} />

        {/* Filters */}
        <div className="pantry-filters">
          <button
            className={`filter-btn ${filter === 'have' ? 'active' : ''}`}
            onClick={() => { setFilter('have'); setSearchResults(null); }}
          >
            In Stock ({haveCount})
          </button>
          <button
            className={`filter-btn ${filter === 'used_up' ? 'active' : ''}`}
            onClick={() => { setFilter('used_up'); setSearchResults(null); }}
          >
            Used Up ({usedCount})
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { setFilter('all'); setSearchResults(null); }}
          >
            All ({items.length})
          </button>
        </div>

        {/* Items */}
        <div className="pantry-list">
          {loading ? (
            <div className="pantry-loading">
              <div className="pantry-spinner"></div>
              <span>Loading pantry...</span>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="pantry-empty">
              {searchResults !== null
                ? <p>No matching items found</p>
                : <p>No items yet. Scan a receipt to add items!</p>
              }
            </div>
          ) : (
            displayItems.map(item => (
              <div key={item.id} className={`pantry-item ${item.status}`}>
                <div className="pantry-item-main">
                  <div className="pantry-item-info">
                    <div className="pantry-item-name">
                      {item.brand && <span className="pantry-brand">{item.brand}</span>}
                      {item.item_name}
                    </div>
                    <div className="pantry-item-meta">
                      {item.size && item.unit && (
                        <span className="pantry-size">{item.size}{item.unit}</span>
                      )}
                      {item.last_price && (
                        <span className="pantry-price">₹{Number(item.last_price).toFixed(2)}</span>
                      )}
                      {item.last_store && (
                        <span className="pantry-store">{item.last_store}</span>
                      )}
                    </div>
                  </div>

                  <div className="pantry-item-actions">
                    <button
                      className={`status-toggle ${item.status}`}
                      onClick={() => toggleStatus(item.id, item.status)}
                      title={item.status === 'have' ? 'Mark as used up' : 'Mark as in stock'}
                    >
                      {item.status === 'have' ? '✓ Have' : '↩ Restock'}
                    </button>
                    <button
                      className="pantry-delete"
                      onClick={() => deleteItem(item.id)}
                      title="Remove from pantry"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
