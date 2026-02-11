'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ReceiptScanner from '@/components/ReceiptScanner'
import ReviewItems from '@/components/ReviewItems'
import Pantry from '@/components/Pantry'
import QuickTagCheck from '@/components/QuickTagCheck'
import Calculator from '@/components/Calculator'
import WhyErrors from '@/components/WhyErrors'
import Results from '@/components/Results'
import AuthModal from '@/components/AuthModal'
import Footer from '@/components/Footer'

export default function Home() {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [results, setResults] = useState(null)

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        if (session?.user) setShowAuth(false)
      }
    )
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleScanComplete = (result) => {
    setScanResult(result)
  }

  const handleConfirmItems = () => {
    setScanResult(null)
    // Scroll to pantry to show saved items
    document.getElementById('pantry')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleResults = (result) => {
    setResults(result)
  }

  const handleReset = () => {
    setResults(null)
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app">
      <Header user={user} onSignInClick={() => setShowAuth(true)} />
      <main className="main-content">
        <Hero />
        <ReceiptScanner
          user={user}
          onScanComplete={handleScanComplete}
          onAuthRequired={() => setShowAuth(true)}
        />
        <Pantry user={user} />
        <QuickTagCheck />
        <Calculator onResults={handleResults} />
        <WhyErrors />
        <Results result={results} onReset={handleReset} />
      </main>
      <Footer />

      {/* Modals */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={(u) => setUser(u)}
        />
      )}
      {scanResult && (
        <ReviewItems
          scanResult={scanResult}
          user={user}
          onConfirm={handleConfirmItems}
          onCancel={() => setScanResult(null)}
        />
      )}
    </div>
  )
}
