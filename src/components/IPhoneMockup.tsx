import React, { useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring, useAnimation } from 'framer-motion'

interface IPhoneMockupProps {
  index: number
  screenContent?: React.ReactNode
  onClick?: () => void
  isHovered?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  isFocused?: boolean
}

/**
 * IPhoneMockup - A high-fidelity iPhone 16-style mockup component
 * 
 * Features:
 * - Realistic frame with layered shadows and metallic edge gradient
 * - Dynamic Island with accurate pill shape
 * - Bottom home indicator
 * - Side buttons (volume rocker, power button)
 * - 3D tilt on hover with realistic perspective
 * - Idle breathing animation
 * - Specular highlight sweep on hover
 * - Screen content placeholder (easily replaceable with real screenshot)
 * 
 * To replace with real screenshot:
 * Replace the placeholder div in the screen area with:
 * <img src="/path/to/your-screenshot.png" alt="App screenshot" className="w-full h-full object-cover" />
 * Recommended resolution: ~1179×2556 or 1290×2796
 */
const IPhoneMockup: React.FC<IPhoneMockupProps> = ({
  index,
  screenContent,
  onClick,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  isFocused,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  
  // Motion values for 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Spring physics for smooth, weighted feel
  const springConfig = { stiffness: 180, damping: 22 }
  
  // Calculate 3D rotation based on mouse position
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8])
  
  // Smooth spring values
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Normalized mouse position (-0.5 to 0.5)
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    onMouseLeave?.()
  }
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  // Staggered entrance animation
  React.useEffect(() => {
    if (!prefersReducedMotion) {
      controls.start({
        y: 0,
        rotateX: 0,
        rotateY: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 160,
          damping: 24,
          delay: index * 0.1, // 100ms stagger between each mockup
        }
      })
    }
  }, [controls, index, prefersReducedMotion])
  
  return (
    <motion.div
      ref={ref}
      className="relative cursor-pointer"
      style={{
        perspective: 1000,
      }}
      initial={{ y: 60, opacity: 0 }}
      animate={controls}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{
        y: -14,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 180, damping: 22 }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 22,
      }}
    >
      {/* Specular highlight sweep */}
      <motion.div
        className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none"
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%', y: '-100%' }}
          animate={isHovered ? { x: '200%', y: '200%' } : { x: '-100%', y: '-100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </motion.div>
      
      {/* iPhone Frame */}
      <motion.div
        className="relative bg-iphone-frame rounded-[3rem] overflow-hidden"
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateXSpring,
          rotateY: prefersReducedMotion ? 0 : rotateYSpring,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isFocused ? 1 : isHovered ? 0.98 : 1,
          opacity: isFocused ? 1 : isHovered ? 0.6 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Metallic edge gradient */}
        <div className="absolute inset-0 rounded-[3rem] p-[2px] bg-gradient-to-b from-white/10 via-transparent to-white/5 pointer-events-none" />
        
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 rounded-[3rem] shadow-inner pointer-events-none" style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(255,255,255,0.05)'
        }} />
        
        {/* Screen area */}
        <div className="relative bg-black rounded-[2.75rem] overflow-hidden" style={{
          width: '280px',
          height: '580px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
        }}>
          {/* Status bar placeholder */}
          <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-10">
            <span className="text-white text-sm font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-white/80" />
              <div className="w-4 h-4 rounded-full bg-white/80" />
              <div className="w-6 h-3 rounded-sm bg-white/80" />
            </div>
          </div>
          
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-20 flex items-center justify-center" style={{
            boxShadow: '0 0 0 1px rgba(255,255,255,0.2), inset 0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.5)'
          }}>
            <div className="w-16 h-4 rounded-full bg-gray-900/70" />
          </div>
          
          {/* Screen content - Replace this with your actual screenshot */}
          <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {screenContent || (
              // Placeholder UI - Remove this and replace with <img> tag for real screenshot
              <>
                {/* TODO: Replace with your actual high-resolution app screenshot (recommended ~1179×2556 or 1290×2796). Keep aspect ratio correct. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent" />
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-32 h-3 bg-white/10 rounded-full mx-auto" />
                    <div className="w-24 h-2 bg-white/5 rounded-full mx-auto" />
                  </div>
                  
                  {/* Sample cards */}
                  <div className="absolute bottom-24 left-4 right-4 space-y-3">
                    <div className="h-16 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10" />
                    <div className="h-16 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10" />
                    <div className="h-16 bg-accent/10 rounded-2xl backdrop-blur-sm border border-accent/20" />
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-10" />
        </div>
        
        {/* Side buttons - Volume rocker (left) */}
        <div className="absolute left-0 top-32 w-1 h-12 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700 rounded-l-sm transform -translate-x-[1px]" style={{
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
        }} />
        <div className="absolute left-0 top-36 w-1 h-12 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700 rounded-l-sm transform -translate-x-[1px]" style={{
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
        }} />
        
        {/* Side button - Power (right) */}
        <div className="absolute right-0 top-28 w-1 h-16 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700 rounded-r-sm transform translate-x-[1px]" style={{
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
        }} />
        
        {/* Action button (right, above power) */}
        <div className="absolute right-0 top-20 w-1 h-3 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700 rounded-r-sm transform translate-x-[1px]" style={{
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
        }} />
      </motion.div>
      
      {/* Idle breathing animation - Very subtle */}
      {!prefersReducedMotion && (
        <motion.div
          animate={{
            y: [0, -4, 0],
            scale: [1, 1.002, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.5, // Offset phases for organic feel
          }}
        />
      )}
    </motion.div>
  )
}

export default IPhoneMockup
