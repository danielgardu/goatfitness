import React from 'react'
import { renderToString } from 'react-dom/server'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import App from './App'

export function render(url: string) {
  const path = url.split('?')[0] || '/'
  return renderToString(
    <React.StrictMode>
      <App initialPath={path} />
      <SpeedInsights />
      <Analytics />
    </React.StrictMode>,
  )
}
