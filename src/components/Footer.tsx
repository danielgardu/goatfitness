import React from 'react'

/**
 * Footer - Ultra minimal legal footer
 */
const Footer: React.FC = () => {
  return (
    <footer className="py-12 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm">
          <a
            href="/terms"
            className="text-text-muted hover:text-white transition-colors duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.05rem' }}
          >
            Terms of Service
          </a>
          <a
            href="/privacy"
            className="text-text-muted hover:text-white transition-colors duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.05rem' }}
          >
            Privacy Policy
          </a>
        </div>
        
        <p className="text-center text-text-muted/60 text-xs mt-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          © 2026 GOAT
        </p>
      </div>
    </footer>
  )
}

export default Footer
