import React, { useEffect, useRef } from 'react'
import { drawActivity } from '../animations/stickmen'

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

    const paint = (now: number) => {
      const rect = wrap.getBoundingClientRect()
      const w = Math.max(1, rect.width)
      const h = Math.max(1, rect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const pw = Math.round(w * dpr)
      const ph = Math.round(h * dpr)
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw
        canvas.height = ph
      }
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        const color = getComputedStyle(wrap).color || '#ffffff'
        drawActivity(activity, ctx, w, h, reduced ? 0.35 : (now - started) / 1000, color)
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
      className="relative shrink-0 w-[1.35em] h-[1.35em] sm:w-[1.6em] sm:h-[1.6em] md:w-[1.5em] md:h-[1.5em] pointer-events-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}

export default StickmanCanvas
