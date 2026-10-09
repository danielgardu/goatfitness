import * as esbuild from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const outfile = '/tmp/goat-landing-render.mjs'
await esbuild.build({
  entryPoints: ['src/landing/renderHtml.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  logLevel: 'silent',
})

const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`)

function writePage(relativePath, html) {
  const file = join('dist', relativePath, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

for (const page of mod.landingPages) {
  const relative = page.path.replace(/^\//, '')
  writePage(relative, mod.renderLanding(page))
}

for (const page of mod.duoPages) {
  const relative = page.path.replace(/^\//, '')
  writePage(relative, mod.renderDuo(page))
}

writeFileSync(join('dist', '404.html'), mod.renderNotFound())

const sitemap = mod.sitemapXml()
writeFileSync(join('dist', 'sitemap.xml'), sitemap)
writeFileSync(join('public', 'sitemap.xml'), sitemap)

function patchLegal(html, { title, description, canonical }) {
  const webpage = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: canonical,
    description,
    isPartOf: {
      '@type': 'WebSite',
      name: 'GOAT AI Fitness',
      url: 'https://goatfitness.app/',
    },
  }).replace(/</g, '\\u003c')

  let out = html
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  out = out.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`,
  )
  out = out.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`,
  )
  out = out.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`,
  )
  out = out.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`,
  )
  out = out.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`,
  )
  out = out.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`,
  )
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`,
  )
  out = out.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${webpage}</script>`,
  )
  if (!out.includes('name="robots"')) {
    out = out.replace(
      '<meta name="description"',
      '<meta name="robots" content="index,follow" />\n    <meta name="description"',
    )
  }
  return out
}

const builtHome = readFileSync(join('dist', 'index.html'), 'utf8')
const legalPages = [
  {
    path: 'terms',
    title: 'Terms of Service | GOAT AI Fitness',
    description: 'Terms of Service for GOAT AI Fitness, the iPhone and Apple Watch workout tracker.',
    canonical: 'https://goatfitness.app/terms',
  },
  {
    path: 'privacy',
    title: 'Privacy Policy | GOAT AI Fitness',
    description: 'Privacy Policy for GOAT AI Fitness, the iPhone and Apple Watch workout tracker.',
    canonical: 'https://goatfitness.app/privacy',
  },
]

for (const page of legalPages) {
  writePage(page.path, patchLegal(builtHome, page))
}

console.log('Prerendered landing pages, legal shells, 404, and sitemap.')
