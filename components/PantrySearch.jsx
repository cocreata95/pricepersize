'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import './PantrySearch.css'

export default function PantrySearch({ user, onResults }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!user || !query.trim()) {
      onResults(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const searchTerm = query.trim().toLowerCase()
        const { data, error } = await supabase
          .from('pantry_items')
          .select('*')
          .eq('user_id', user.id)
          .or(`item_name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
          .order('updated_at', { ascending: false })
          .limit(20)

        if (error) throw error
        onResults(data || [])
      } catch (err) {
        console.error('Search failed:', err)
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, user])

  const clearSearch = () => {
    setQuery('')
    onResults(null)
  }

  return (
    <div className={`pantry-search ${focused ? 'focused' : ''}`}>
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="Search your pantry..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {query && (
        <button className="search-clear" onClick={clearSearch}>✕</button>
      )}
    </div>
  )
}
