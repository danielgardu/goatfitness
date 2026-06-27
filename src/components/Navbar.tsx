import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Apple } from 'lucide-react'

/**
 * Navbar - Minimal floating glass navbar
 * 
 * Features:
 * - Fixed top positioning
 * - Glass morphism effect
 * - Scroll-triggered blur and border enhancement
 * - App name/logo on left
 * - Download button with Apple icon on right
 * - Mobile-friendly with 44px+ tap targets
 */
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
    >
      <motion.div
        className="max-w-7xl mx-auto"
        animate={{
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: scrolled ? 'blur(24px)' : 'blur(16px)',
          borderColor: scrolled ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
        }}
        transition={{ duration: 0.3 }}
        style={{
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6">
          {/* App Name / Logo */}
          <div className="flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              GOAT
            </span>
          </div>
          
          {/* Download Button */}
          <a
            href="https://apps.apple.com/us/app/goat-ai-fitness-gym-tracker/id6772637653"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-accent hover:bg-accent/90 text-white font-medium text-sm sm:text-base transition-all duration-300 min-h-[44px]"
            style={{
              boxShadow: '0 0 20px rgba(44, 65, 252, 0.3)',
            }}
          >
            <Apple className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">Get</span>
          </a>
        </div>
      </motion.div>
    </motion.nav>
  )
}

export default Navbar
