import React, { useEffect, useLayoutEffect } from 'react'

const BLACK = '#000000'
const SKY_NARROW = '#101C97'
const SKY_WIDE = '#1720AC'

const useIsoLayout =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

type RGBA = { r: number; g: number; b: number; a: number }

/**
 * Keeps the fixed strips in the initial HTML in sync with the visible edges.
 * iOS 26 reads background-color on those elements. The strips stay outside
 * #root so no transformed ancestor can trap them.
 */
const SafariEdges: React.FC = () => {
  useIsoLayout(() => {
    const root = document.documentElement
    const meta = document.querySelector('meta[name="theme-color"]')
    const topEl = document.querySelector('.edge-top')
    const bottomEl = document.querySelector('.edge-bottom')
    const previous = {
      topVar: root.style.getPropertyValue('--edge-top-background'),
      bottomVar: root.style.getPropertyValue('--edge-bottom-background'),
      htmlBg: root.style.backgroundColor,
      bodyBg: document.body.style.backgroundColor,
      topBg: topEl instanceof HTMLElement ? topEl.style.backgroundColor : '',
      bottomBg: bottomEl instanceof HTMLElement ? bottomEl.style.backgroundColor : '',
      theme: meta?.getAttribute('content') ?? null,
    }

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (context) context.imageSmoothingEnabled = false

    let frame = 0
    let lastTop = ''
    let lastBottom = ''

    const applyPalette = (top: string, bottom: string) => {
      if (top === lastTop && bottom === lastBottom) return
      lastTop = top
      lastBottom = bottom
      root.style.setProperty('--edge-top-background', top)
      root.style.setProperty('--edge-bottom-background', bottom)
      root.style.backgroundColor = top
      document.body.style.backgroundColor = bottom
      if (topEl instanceof HTMLElement) topEl.style.backgroundColor = top
      if (bottomEl instanceof HTMLElement) bottomEl.style.backgroundColor = bottom
      const tag = document.querySelector('meta[name="theme-color"]')
      if (tag) tag.setAttribute('content', top)
    }

    const sampleImage = (img: HTMLImageElement, clientX: number, clientY: number): RGBA | null => {
      if (!context || !img.complete || img.naturalWidth < 1) return null
      const rect = img.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return null
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        return null
      }
      const [rawX, rawY] = getComputedStyle(img).objectPosition.split(/\s+/)
      const posX = parsePosition(rawX)
      const posY = parsePosition(rawY ?? rawX)
      const scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight)
      const offsetX = (rect.width - img.naturalWidth * scale) * posX
      const offsetY = (rect.height - img.naturalHeight * scale) * posY
      const sx = Math.floor((clientX - rect.left - offsetX) / scale)
      const sy = Math.floor((clientY - rect.top - offsetY) / scale)
      if (sx < 0 || sy < 0 || sx >= img.naturalWidth || sy >= img.naturalHeight) return null
      try {
        context.clearRect(0, 0, 1, 1)
        context.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1)
        const pixel = context.getImageData(0, 0, 1, 1).data
        return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] }
      } catch {
        return null
      }
    }

    const colorAt = (clientY: number): string => {
      const hero = document.querySelector('[data-safari-hero]')
      if (!(hero instanceof HTMLElement)) return BLACK
      const heroRect = hero.getBoundingClientRect()
      if (heroRect.height < 1) return fallbackSky(clientY)
      if (clientY < heroRect.top - 0.5 || clientY > heroRect.bottom + 0.5) return BLACK

      const bg = document.querySelector('[data-safari-bg]')
      const fg = document.querySelector('[data-safari-fg]')
      const ready = bg instanceof HTMLImageElement && bg.complete && bg.naturalWidth > 0
      if (!ready) return fallbackSky(clientY)

      const samples: RGBA[] = []
      for (const t of [0.15, 0.3, 0.42, 0.5, 0.58, 0.7, 0.85]) {
        const x = heroRect.left + heroRect.width * t
        let pixel: RGBA = { r: 0, g: 0, b: 0, a: 255 }
        if (bg instanceof HTMLImageElement) {
          const back = sampleImage(bg, x, clientY)
          if (back) pixel = over({ r: 0, g: 0, b: 0, a: 255 }, back)
        }
        if (fg instanceof HTMLImageElement) {
          const front = sampleImage(fg, x, clientY)
          if (front) pixel = over(pixel, front)
        }
        samples.push(pixel)
      }
      const mixed = towardBlack(
        {
          r: median(samples.map((sample) => sample.r)),
          g: median(samples.map((sample) => sample.g)),
          b: median(samples.map((sample) => sample.b)),
        },
        overlayBlackAlpha(clientY),
      )
      return toHex(mixed.r, mixed.g, mixed.b)
    }

    const update = () => {
      const viewport = window.visualViewport
      const origin = viewport?.offsetTop ?? 0
      const height = viewport?.height ?? window.innerHeight
      const topStrip = stripHeight('.edge-top')
      const bottomStrip = stripHeight('.edge-bottom')
      const topY = origin + Math.max(1, topStrip - 2)
      const bottomY = origin + height - Math.max(1, bottomStrip - 2)
      applyPalette(colorAt(topY), colorAt(bottomY))
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        update()
      })
    }

    const images = document.querySelectorAll('[data-safari-bg], [data-safari-fg]')
    const hero = document.querySelector('[data-safari-hero]')
    const observer = new ResizeObserver(schedule)
    if (hero) observer.observe(hero)
    images.forEach((img) => {
      img.addEventListener('load', schedule)
      if (img instanceof HTMLImageElement) observer.observe(img)
    })

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)
    window.addEventListener('pageshow', schedule)
    window.visualViewport?.addEventListener('scroll', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    schedule()

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
      window.removeEventListener('pageshow', schedule)
      window.visualViewport?.removeEventListener('scroll', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
      images.forEach((img) => img.removeEventListener('load', schedule))
      restoreInline(root, '--edge-top-background', previous.topVar)
      restoreInline(root, '--edge-bottom-background', previous.bottomVar)
      root.style.backgroundColor = previous.htmlBg
      document.body.style.backgroundColor = previous.bodyBg
      if (topEl instanceof HTMLElement) topEl.style.backgroundColor = previous.topBg
      if (bottomEl instanceof HTMLElement) bottomEl.style.backgroundColor = previous.bottomBg
      if (meta) {
        if (previous.theme == null) meta.removeAttribute('content')
        else meta.setAttribute('content', previous.theme)
      }
    }
  }, [])

  return null
}

function restoreInline(root: HTMLElement, name: string, value: string) {
  if (value) root.style.setProperty(name, value)
  else root.style.removeProperty(name)
}

function stripHeight(selector: string): number {
  const el = document.querySelector(selector)
  if (!(el instanceof HTMLElement)) return 12
  const height = el.getBoundingClientRect().height
  return height > 0 ? height : 12
}

function parsePosition(value: string | undefined): number {
  if (!value || value === 'center' || value === 'left' || value === 'top') {
    if (value === 'left' || value === 'top') return 0
    return 0.5
  }
  if (value === 'right' || value === 'bottom') return 1
  if (value.endsWith('%')) return parseFloat(value) / 100
  return 0.5
}

function over(back: RGBA, front: RGBA): RGBA {
  const alpha = front.a / 255
  const keep = 1 - alpha
  return {
    r: front.r * alpha + back.r * keep,
    g: front.g * alpha + back.g * keep,
    b: front.b * alpha + back.b * keep,
    a: 255,
  }
}

function overlayBlackAlpha(clientY: number): number {
  let alpha = 0
  const fade = document.querySelector('[data-safari-fade]')
  if (fade) {
    const rect = fade.getBoundingClientRect()
    if (clientY >= rect.top && clientY <= rect.bottom && rect.height > 0) {
      const fromBottom = (rect.bottom - clientY) / rect.height
      alpha = fromBottom <= 0.5 ? 1 - fromBottom * 0.4 : 0.8 * (1 - (fromBottom - 0.5) / 0.5)
    }
  }
  const mask = document.querySelector('[data-safari-mask]')
  if (mask) {
    const rect = mask.getBoundingClientRect()
    if (clientY >= rect.top && clientY <= rect.bottom && rect.height > 0) {
      const maskAlpha = 1 - (rect.bottom - clientY) / rect.height
      alpha = 1 - (1 - alpha) * (1 - maskAlpha)
    }
  }
  return Math.min(1, Math.max(0, alpha))
}

function fallbackSky(clientY: number): string {
  const alpha = overlayBlackAlpha(clientY)
  if (alpha > 0.92) return BLACK
  const sky = window.innerWidth >= 768 ? SKY_WIDE : SKY_NARROW
  const red = parseInt(sky.slice(1, 3), 16)
  const green = parseInt(sky.slice(3, 5), 16)
  const blue = parseInt(sky.slice(5, 7), 16)
  const mixed = towardBlack({ r: red, g: green, b: blue }, alpha)
  return toHex(mixed.r, mixed.g, mixed.b)
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function towardBlack(color: { r: number; g: number; b: number }, alpha: number) {
  const keep = 1 - alpha
  return { r: color.r * keep, g: color.g * keep, b: color.b * keep }
}

function toHex(r: number, g: number, b: number): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

export default SafariEdges
