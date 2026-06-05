import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Apple } from 'lucide-react'

/**
 * CTAButton - Magnetic App Store download button
 * 
 * Features:
 * - Magnetic attraction to cursor (140px radius)
 * - Spring-based movement (stiffness: 180, damping: 22)
 * - Hover scale and glow intensification
 * - Shine/highlight sweep animation
 * - Active/press scale-down
 * - Tactile, alive feel
 */
const CTAButton: React.FC = () => {
  const ref = useRef<HTMLButtonElement>(null)
  
  // Motion values for magnetic effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Spring physics for smooth, weighted feel
  const springConfig = { stiffness: 180, damping: 22 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculate distance from center
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    
    // Magnetic attraction within 140px radius
    const maxDistance = 140
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance < maxDistance) {
      // Calculate magnetic pull (stronger when closer to center)
      const pullStrength = 1 - distance / maxDistance
      const maxShift = 8 // Maximum pixels to shift
      
      x.set(deltaX * pullStrength * (maxShift / maxDistance))
      y.set(deltaY * pullStrength * (maxShift / maxDistance))
    } else {
      x.set(0)
      y.set(0)
    }
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }
  
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        ref={ref}
        className="relative overflow-hidden group px-8 py-4 rounded-full bg-accent text-white font-semibold text-lg flex items-center gap-3 min-h-[56px]"
        style={{
          x: springX,
          y: springY,
          boxShadow: '0 0 40px rgba(44, 65, 252, 0.4)',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 60px rgba(44, 65, 252, 0.6)',
          transition: { type: 'spring', stiffness: 180, damping: 22 }
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      >
        {/* Shine/highlight sweep */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        
        <Apple className="w-6 h-6" />
        <span>Download on the App Store</span>
      </motion.button>
      
      <p className="text-text-muted text-sm">
        Free • iOS 26.0 or later
      </p>
    </div>
  )
}

export default CTAButton
