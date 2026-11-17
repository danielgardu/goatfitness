import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Carousel from './Carousel'
import SEOContent from './SEOContent'
import GoatExperience from './GoatExperience'
import { useCopy } from '../i18n'

/**
 * Hero - The main landing page section
 */
const Hero: React.FC = () => {
  const { scrollY } = useScroll()
  const textWipePosition = useTransform(scrollY, [0, 300], ['100% 0', '0% 0'])
  const t = useCopy()

  return (
    <section className="relative flex flex-col bg-black min-h-screen">
      <div
        data-safari-hero
        className="relative h-[100svh] w-full overflow-hidden bg-[#0846ff]"
      >
        <GoatExperience />
        <div data-safari-fade className="absolute bottom-0 left-0 right-0 h-[16vh] z-[1] pointer-events-none bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div data-safari-mask className="absolute bottom-0 left-0 right-0 h-16 z-[1] pointer-events-none bg-black" style={{ maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }} />
      </div>

      {/* Content Area below the Parallax */}
      <div id="download-section" className="relative z-40 bg-black flex flex-col items-center pb-24 w-full">
        
        {/* Dynamic Carousel Section removed (was duplicate) */}
        {/* Download Button */}
        <motion.div
          className="relative flex flex-col items-center mt-8 sm:mt-12 mb-0 z-50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <a
            href="https://apps.apple.com/app/id6772637653"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-10 py-4 sm:px-12 sm:py-5 rounded-full bg-accent hover:bg-accent/90 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 0 40px rgba(44, 65, 252, 0.5)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-bold text-2xl sm:text-3xl leading-none tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{t.downloadBig}</span>
              <span className="text-[10px] sm:text-xs text-white/80 tracking-widest font-medium uppercase mt-1 leading-none block text-center">
                {t.downloadSub}
              </span>
            </div>
          </a>
          <motion.p 
            className="mt-5 text-lg sm:text-xl font-bold text-center max-w-md text-balance text-transparent bg-clip-text inline-block"
            style={{ 
              fontFamily: 'Space Grotesk, sans-serif',
              backgroundImage: 'linear-gradient(90deg, #ffffff 0%, #ffffff 50%, rgba(255,255,255,0.2) 55%, rgba(255,255,255,0.2) 100%)',
              backgroundSize: '200% 100%',
              backgroundPosition: textWipePosition,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t.watchNote}
          </motion.p>
        </motion.div>

        {/* Carousel */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Carousel />
        </motion.div>
        
        {/* Activities scroller */}
        <div className="w-full mt-16 relative z-50">
          <SEOContent />
        </div>
        
      </div>
      
    </section>
  )
}

export default Hero
