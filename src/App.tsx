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

  // Handle Apple Smart App Banner dynamically
  useEffect(() => {
    const isMainPage = currentPath !== '/terms' && currentPath !== '/privacy';
    let metaTag = document.querySelector('meta[name="apple-itunes-app"]');

    if (isMainPage) {
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'apple-itunes-app');
        metaTag.setAttribute('content', 'app-id=6772637653');
        document.head.appendChild(metaTag);
      }
    } else {
      if (metaTag) {
        document.head.removeChild(metaTag);
      }
    }
  }, [currentPath])

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
