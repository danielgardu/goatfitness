import React, { useEffect, useRef } from 'react'
import { drawActivity } from '../animations/stickmen'

const MOBILE_MQ = '(max-width: 767px)'
const MOBILE_LOGICAL = 120

const StickmanCanvas: React.FC<{ activity: string }> = ({ activity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    let raf = 0
    let running = true
    const started = performance.now()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobileMq = window.matchMedia(MOBILE_MQ)

    const paint = (now: number) => {
      const rect = wrap.getBoundingClientRect()
      const cssW = Math.max(1, rect.width)
      const cssH = Math.max(1, rect.height)
      const isMobile = mobileMq.matches
      // Draw at a desktop-like logical size on phones so stroke minimums and
      // hardcoded offsets keep the same proportions, then CSS-scale down.
      const minSide = Math.min(cssW, cssH)
      const scaleUp = isMobile && minSide < MOBILE_LOGICAL ? MOBILE_LOGICAL / minSide : 1
      const w = cssW * scaleUp
      const h = cssH * scaleUp
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 3 : 2)
      const pw = Math.round(w * dpr)
      const ph = Math.round(h * dpr)
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw
        canvas.height = ph
      }
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        if (isMobile) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
        }
        drawActivity(activity, ctx, w, h, reduced ? 0.35 : (now - started) / 1000, '#ffffff')
      }
    }

    const loop = (now: number) => {
      if (!running) return
      paint(now)
      if (!reduced) raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    const io = new IntersectionObserver(
      ([entry]) => {
        const vis = entry.isIntersecting
        if (vis && !running) {
          running = true
          raf = requestAnimationFrame(loop)
        } else if (!vis && running) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { rootMargin: '120px' }
    )
    io.observe(wrap)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [activity])

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0 aspect-square w-[3.25rem] h-[3.25rem] sm:w-[1.7em] sm:h-[1.7em] md:w-[1.65em] md:h-[1.65em] pointer-events-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}

export default StickmanCanvas
