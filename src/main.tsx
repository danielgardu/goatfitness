import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.tsx'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import './index.css'

const el = document.getElementById('root')!
const path = window.location.pathname
const tree = (
  <React.StrictMode>
    <App initialPath={path} />
    <SpeedInsights />
    <Analytics />
  </React.StrictMode>
)

if (el.hasChildNodes() && path === '/') {
  hydrateRoot(el, tree)
} else {
  createRoot(el).render(tree)
}
