import React, { useState, useEffect } from 'react'
import Hero from './components/Hero'
import Footer from './components/Footer'
import TermsPage from './components/TermsPage'
import PrivacyPage from './components/PrivacyPage'
import SafariEdges from './components/SafariEdges'

/**
 * GOAT AI Fitness homepage.
 * initialPath is passed in so the tree can render without window during prerender.
 */
const App: React.FC<{ initialPath?: string }> = ({ initialPath = '/' }) => {
  const [currentPath, setCurrentPath] = useState(initialPath)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }

    handleLocationChange()
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

  let page = (
    <div className="min-h-screen bg-background">
      <Hero />
      <Footer />
    </div>
  )

  if (currentPath === '/terms') page = <TermsPage />
  if (currentPath === '/privacy') page = <PrivacyPage />

  return (
    <>
      <SafariEdges />
      {page}
    </>
  )
}

export default App
