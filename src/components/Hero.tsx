import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Carousel from './Carousel'
import SEOContent from './SEOContent'

/**
 * Hero - The main landing page section
 */
const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  
  // Parallax effects
  // Background moves slightly down as we scroll down
  const bgY = useTransform(scrollY, [0, 1000], ['0%', '15%'])
  // Foreground moves up slightly to create depth
  const fgY = useTransform(scrollY, [0, 1000], ['0%', '-15%'])
  // Text moves somewhere in between
  const textY = useTransform(scrollY, [0, 1000], ['0%', '5%'])
  // Chevron fades out when scrolling down
  const chevronOpacity = useTransform(scrollY, [0, 300], [1, 0])
  // Scroll-linked wipe effect for the subtitle
  const textWipePosition = useTransform(scrollY, [0, 300], ['100% 0', '0% 0'])

  return (
    <section className="relative flex flex-col bg-black min-h-screen">
      
      {/* Parallax Header Area */}
      <div 
        ref={containerRef}
        className="relative h-[100vh] w-full flex items-center justify-center overflow-hidden bg-black"
      >
        {/* Background Layer */}
        <motion.div 
          className="absolute inset-0 z-0 origin-top"
          style={{ y: bgY, scale: 1.02 }} // Slight scale to avoid showing edges on scroll
        >
          <img src="/fondo.webp" alt="Background" className="w-full h-full object-cover object-[50%_50%] md:object-[50%_55%]" />
        </motion.div>

        {/* Text Layer */}
        <motion.div 
          className="absolute z-10 flex justify-start w-full top-[25%] md:top-[25%] pl-[2%] md:pl-[20%]"
          style={{ y: textY }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-[clamp(4.5rem,15vw,6rem)] md:text-[clamp(5rem,9.5vw,9.5rem)] font-bold tracking-tight text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] -rotate-[40deg] flex" style={{ fontFamily: 'Righteous, cursive' }}>
            {["G", "O", "A", "T"].map((letter, i) => (
              <motion.span
                key={i}
                className="inline-block cursor-pointer relative z-40"
                onClick={(e) => e.stopPropagation()}
                whileHover={{ 
                  y: -15, 
                  scale: 1.15, 
                  rotate: i % 2 === 0 ? 8 : -8, 
                  color: '#2C41FC', 
                  textShadow: '0px 0px 25px rgba(44, 65, 252, 0.9)' 
                }}
                whileTap={{ 
                  scale: 0.85, 
                  y: 5,
                  rotate: i % 2 === 0 ? -10 : 10,
                  color: '#2C41FC', 
                  textShadow: '0px 0px 15px rgba(44, 65, 252, 0.9)' 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
              >
                {letter}
              </motion.span>
            ))}
          </h1>
        </motion.div>

        {/* Foreground Layer */}
        <motion.div 
          className="absolute inset-0 z-20 pointer-events-none origin-top"
          style={{ y: fgY, scale: 1.02 }}
        >
          <motion.img 
            src="/frente.webp" 
            alt="Foreground" 
            className="w-full h-full object-cover object-[50%_50%] md:object-[50%_55%]" 
          />
        </motion.div>

        {/* Gradient Overlay fading to solid black at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] z-30 pointer-events-none bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 z-30 pointer-events-none bg-black" style={{ maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }} />
        
        {/* Scroll Down Chevron */}
        <div className="absolute bottom-10 w-full flex justify-center z-50 pointer-events-none">
          <motion.a 
            href="#download-section"
            style={{ opacity: chevronOpacity }}
            className="text-white/80 hover:text-white transition-colors cursor-pointer pointer-events-auto flex items-center justify-center"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-12 h-12 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.a>
        </div>
      </div>

      {/* Content Area below the Parallax */}
      <div id="download-section" className="relative z-40 bg-black flex flex-col items-center pb-24 w-full">
        
        {/* Dynamic Carousel Section removed (was duplicate) */}
        {/* Download Button */}
        <motion.div
          className="flex flex-col items-center mt-8 sm:mt-12 mb-0 z-50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <a
            href="https://apps.apple.com/app/goat-fitness-intelligence/id1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-10 py-4 sm:px-12 sm:py-5 rounded-full bg-accent hover:bg-accent/90 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 0 40px rgba(44, 65, 252, 0.5)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-bold text-2xl sm:text-3xl leading-none tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>DOWNLOAD</span>
              <span className="text-[10px] sm:text-xs text-white/80 tracking-widest font-medium uppercase mt-1 leading-none block text-center">
                FOR iOS & WATCHOS 26
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
            AI. Smart routines, activity tracking, and calorie intelligence. Train with precision.
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
        
        {/* SEO and FAQ Section */}
        <div className="w-full mt-16 relative z-50">
          <SEOContent />
        </div>
        
      </div>
      
    </section>
  )
}

export default Hero
