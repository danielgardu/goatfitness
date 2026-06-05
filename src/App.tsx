import React, { useState, useEffect } from 'react'
import Hero from './components/Hero'
import Footer from './components/Footer'
import TermsPage from './components/TermsPage'
import PrivacyPage from './components/PrivacyPage'

/**
 * GOAT Landing Page
 * 
 * Ultra-minimal, high-fidelity landing page for the GOAT iOS fitness app.
 */
const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  if (currentPath === '/terms') {
    return <TermsPage />
  }

  if (currentPath === '/privacy') {
    return <PrivacyPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Footer />
    </div>
  )
}

export default App
