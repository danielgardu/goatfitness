import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.tsx'
import { LangProvider } from './i18n.tsx'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import './index.css'
import './experience/style.css'

const el = document.getElementById('root')!
const path = window.location.pathname
const tree = (
  <React.StrictMode>
    <LangProvider>
      <App initialPath={path} />
      <SpeedInsights />
      <Analytics />
    </LangProvider>
  </React.StrictMode>
)

if (el.hasChildNodes()) {
  hydrateRoot(el, tree)
} else {
  createRoot(el).render(tree)
}
