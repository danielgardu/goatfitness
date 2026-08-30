import React from 'react'

/**
 * Footer - Ultra minimal legal footer
 */
const APP_STORE_URL = 'https://apps.apple.com/us/app/goat-ai-fitness-gym-tracker/id6772637653'

const Footer: React.FC = () => {
  return (
    <footer className="py-12 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-14 sm:mb-16">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-10 py-4 sm:px-12 sm:py-5 rounded-full bg-accent hover:bg-accent/90 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 0 40px rgba(44, 65, 252, 0.5)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="font-bold text-xl sm:text-2xl tracking-wide">Download now</span>
          </a>
        </div>
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
