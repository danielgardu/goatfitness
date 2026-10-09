import {
  APP_STORE_URL,
  LASTMOD,
  OG_IMAGE,
  SITE,
  landingPages,
} from '../content/landing/index'
import type { LandingCopy } from '../content/landing/types'
import { watchCopy } from '../content/landing/watch'

const HOME = `${SITE}/`
const HOME_CRUMB: Record<LandingCopy['code'], string> = {
  en: 'Home',
  es: 'Inicio',
  de: 'Start',
  fr: 'Accueil',
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function absolute(path: string): string {
  return `${SITE}${path}`
}

function hreflangLinks(): string {
  const lines = landingPages.map(
    (page) =>
      `    <link rel="alternate" hreflang="${page.code}" href="${absolute(page.path)}" />`,
  )
  lines.push(
    `    <link rel="alternate" hreflang="x-default" href="${absolute(landingPages[0].path)}" />`,
  )
  return lines.join('\n')
}

function localeAlternates(page: LandingCopy): string {
  return landingPages
    .filter((other) => other.code !== page.code)
    .map(
      (other) =>
        `    <meta property="og:locale:alternate" content="${other.ogLocale}" />`,
    )
    .join('\n')
}

function languageSwitcher(page: LandingCopy): string {
  const links = landingPages
    .map((other) => {
      const current = other.code === page.code ? ' aria-current="page"' : ''
      const names: Record<LandingCopy['code'], string> = {
        en: 'English',
        es: 'Español',
        de: 'Deutsch',
        fr: 'Français',
      }
      return `<a href="${absolute(other.path)}" hreflang="${other.code}" lang="${other.htmlLang}"${current}>${names[other.code]}</a>`
    })
    .join('')
  return `<nav class="lp-langs" aria-label="${esc(page.languagesLabel)}">${links}</nav>`
}

const APP_ID = 'https://goatfitness.app/#app'
const PERSON_ID = 'https://goatfitness.app/#daniel'
const WEBSITE_ID = 'https://goatfitness.app/#website'

function structuredData(page: LandingCopy): string {
  const pageUrl = absolute(page.path)
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.h1,
        description: page.schemaDescription,
        inLanguage: page.code,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': APP_ID },
        author: { '@id': PERSON_ID },
      },
      {
        '@type': 'FAQPage',
        inLanguage: page.code,
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: HOME_CRUMB[page.code],
            item: HOME,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: page.breadcrumbName,
            item: pageUrl,
          },
        ],
      },
    ],
  }
  return jsonLd(graph)
}

const CSS = `
:root {
  color-scheme: dark;
  --bg: #000000;
  --accent: #2C41FC;
  --text: #F1F1F3;
  --muted: #C4C4CC;
  --line: rgba(255, 255, 255, 0.1);
  --card: rgba(255, 255, 255, 0.06);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.6;
}
a { color: inherit; }
.lp-skip {
  position: absolute;
  left: 1rem;
  top: -4rem;
  background: #fff;
  color: #000;
  padding: 0.5rem 1rem;
  z-index: 10;
}
.lp-skip:focus { top: 1rem; }
.lp-header, .lp-wrap { width: min(1080px, calc(100% - 2rem)); margin: 0 auto; }
.lp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0;
}
.lp-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  letter-spacing: -0.03em;
  font-size: 1.15rem;
}
.lp-brand img { width: 36px; height: 36px; border-radius: 8px; }
.lp-langs { display: flex; flex-wrap: wrap; gap: 0.35rem 0.85rem; }
.lp-langs a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.lp-langs a[aria-current="page"] { color: #fff; text-decoration: underline; text-underline-offset: 0.3em; }
.lp-hero, .lp-block { padding: 1.5rem 0 0.5rem; }
.lp-hero {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 2.5rem;
  align-items: center;
  padding-top: 1rem;
}
h1, h2, h3, .lp-brand, .lp-btn {
  font-family: "Space Grotesk", sans-serif;
}
h1 {
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin: 0 0 1rem;
}
h2 {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0 0 1rem;
}
h3 { font-size: 1.2rem; margin: 0 0 0.4rem; }
.lp-sub { font-size: 1.125rem; color: var(--muted); margin: 0 0 1.5rem; }
.lp-actions { display: flex; flex-wrap: wrap; gap: 0.75rem 1.25rem; align-items: center; }
.lp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 52px;
  padding: 0.8rem 1.3rem;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 0 40px rgba(44, 65, 252, 0.45);
}
.lp-btn svg { width: 1.15rem; height: 1.15rem; flex: none; }
.lp-textlink { color: #fff; min-height: 44px; display: inline-flex; align-items: center; }
.lp-phone {
  margin: 0;
  justify-self: end;
  width: min(260px, 100%);
  border-radius: 2rem;
  overflow: hidden;
  border: 1px solid var(--line);
  background: #111217;
}
.lp-phone img, .lp-shots img { display: block; width: 100%; height: auto; }
.lp-shots img {
  border-radius: 1.25rem;
  border: 1px solid var(--line);
  background: #111217;
}
.lp-block { padding-top: 4rem; }
.lp-cards, .lp-split, .lp-shots {
  display: grid;
  gap: 1rem;
}
.lp-cards { grid-template-columns: repeat(3, 1fr); }
.lp-split, .lp-shots { grid-template-columns: 1fr 1fr; }
.lp-card, .lp-panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 1.25rem;
  padding: 1.25rem 1.3rem;
}
.lp-card p, .lp-panel p, .lp-prose, .lp-faq p, .lp-step span { color: var(--muted); }
.lp-card p, .lp-panel p { margin: 0; }
.lp-list { margin: 0.5rem 0 1rem; padding-left: 1.2rem; }
.lp-list li { margin: 0.45rem 0; }
.lp-list strong { color: #fff; }
.lp-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.9rem; }
.lp-step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  align-items: start;
}
.lp-num {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--accent);
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
}
.lp-faq { display: grid; gap: 0.75rem; }
.lp-faq article {
  border-top: 1px solid var(--line);
  padding-top: 0.9rem;
}
.lp-faq h3 { font-size: 1.05rem; }
.lp-faq p { margin: 0.25rem 0 0; }
.lp-cta {
  margin-top: 4rem;
  padding: 2rem 0 1rem;
  text-align: center;
}
.lp-cta .lp-btn { margin-top: 0.5rem; }
.lp-foot {
  padding: 2rem 0 3rem;
  text-align: center;
}
.lp-foot a { color: var(--muted); }
.lp-watchline { font-weight: 650; margin: -0.25rem 0 1rem; }
.lp-table { width: 100%; border-collapse: collapse; }
.lp-table th, .lp-table td { border-bottom: 1px solid var(--line); text-align: left; padding: 0.55rem 0.45rem; vertical-align: top; }
.lp-crumb { color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem; }
.lp-crumb a { color: var(--muted); }
:focus-visible { outline: 2px solid #9aa8ff; outline-offset: 3px; }
@media (max-width: 800px) {
  .lp-hero, .lp-cards, .lp-split, .lp-shots { grid-template-columns: 1fr; }
  .lp-phone { justify-self: center; }
  .lp-header { align-items: flex-start; flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
`

function appleIcon(): string {
  return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>'
}

export function renderLanding(page: LandingCopy): string {
  const pageUrl = absolute(page.path)
  const cards = page.tracks
    .map(
      (section) =>
        `<article class="lp-card"><h3>${esc(section.title)}</h3><p>${esc(section.body)}</p></article>`,
    )
    .join('')
  const bullets = page.bullets
    .map((bullet) => `<li><strong>${esc(bullet.strong)}</strong>${esc(bullet.rest)}</li>`)
    .join('')
  const steps = page.steps
    .map(
      (step, index) =>
        `<li class="lp-step"><span class="lp-num">${index + 1}</span><span><strong>${esc(step.strong)}</strong>${esc(step.rest)}</span></li>`,
    )
    .join('')
  const faqs = page.faqs
    .map(
      (faq) =>
        `<article><h3>${esc(faq.question)}</h3><p>${esc(faq.answer)}</p></article>`,
    )
    .join('')
  const watch = watchCopy[page.code]
  const names: Record<LandingCopy['code'], string> = {
    en: 'English',
    es: 'Español',
    de: 'Deutsch',
    fr: 'Français',
  }
  const watchRows = watch.rows
    .map(
      (row) =>
        `<tr><th scope="row">${esc(row.feature)}</th><td>${esc(row.iphone)}</td><td>${esc(row.watch)}</td></tr>`,
    )
    .join('')
  const related = landingPages
    .filter((other) => other.code !== page.code)
    .map(
      (other) =>
        `<a href="${absolute(other.path)}">${esc(names[other.code])}: ${esc(other.breadcrumbName)}</a>`,
    )
    .join(' · ')

  return `<!DOCTYPE html>
<html lang="${page.htmlLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <meta name="robots" content="index,follow" />
    <meta name="apple-itunes-app" content="app-id=6772637653" />
    <link rel="canonical" href="${pageUrl}" />
${hreflangLinks()}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="GOAT AI Fitness" />
    <meta property="og:title" content="${esc(page.ogTitle)}" />
    <meta property="og:description" content="${esc(page.ogDescription)}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="${page.ogLocale}" />
${localeAlternates(page)}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(page.ogTitle)}" />
    <meta name="twitter:description" content="${esc(page.ogDescription)}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <link rel="icon" type="image/webp" href="/appicon.webp" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${structuredData(page)}</script>
    <style>${CSS}</style>
  </head>
  <body>
    <a class="lp-skip" href="#content">Skip to content</a>
    <header class="lp-header">
      <a class="lp-brand" href="${HOME}"><img src="/appicon.webp" width="36" height="36" alt="" />GOAT AI Fitness</a>
      ${languageSwitcher(page)}
    </header>
    <main id="content" class="lp-wrap">
      <p class="lp-crumb"><a href="${HOME}">${esc(HOME_CRUMB[page.code])}</a> / ${esc(page.breadcrumbName)}</p>
      <section class="lp-hero">
        <div>
          <h1>${esc(page.h1)}</h1>
          <p class="lp-watchline">${esc(watch.line)}</p>
          <p class="lp-sub">${esc(page.subhead)}</p>
          <div class="lp-actions">
            <a class="lp-btn" href="${APP_STORE_URL}">${appleIcon()}${esc(page.downloadLabel)}</a>
            <a class="lp-textlink" href="#how-it-works">${esc(page.seeHowLabel)}</a>
          </div>
        </div>
        <figure class="lp-phone">
          <img src="/1sheetroutine.webp" width="1099" height="2212" alt="${esc(page.heroAlt)}" />
        </figure>
      </section>
      <section class="lp-block">
        <h2>${esc(page.tracksTitle)}</h2>
        <div class="lp-cards">${cards}</div>
      </section>
      <section class="lp-block">
        <h2>${esc(page.choiceTitle)}</h2>
        <div class="lp-split">
          <article class="lp-panel"><h3>${esc(page.withWatch.title)}</h3><p>${esc(page.withWatch.body)}</p></article>
          <article class="lp-panel"><h3>${esc(page.withoutWatch.title)}</h3><p>${esc(page.withoutWatch.body)}</p></article>
        </div>
        <div class="lp-shots">
          <img src="/1sheetroutine.webp" width="1099" height="2212" alt="${esc(page.gymAlt)}" loading="lazy" />
          <img src="/runningsplash.webp" width="1099" height="2212" alt="${esc(page.runAlt)}" loading="lazy" />
        </div>
      </section>
      <section class="lp-block" data-seo-unique="watch-adds">
        <h2>${esc(watch.tableTitle)}</h2>
        <p class="lp-prose">${esc(watch.tableIntro)}</p>
        <table class="lp-table">
          <thead><tr><th>${esc(watch.columns[0])}</th><th>${esc(watch.columns[1])}</th><th>${esc(watch.columns[2])}</th></tr></thead>
          <tbody>${watchRows}</tbody>
        </table>
        <p class="lp-prose">${esc(watch.note)}</p>
      </section>
      <section class="lp-block">
        <h2>${esc(page.compareTitle)}</h2>
        <p class="lp-prose">${esc(page.compareIntro)}</p>
        <p class="lp-prose">${esc(page.compareLead)}</p>
        <ul class="lp-list">${bullets}</ul>
        <p class="lp-prose">${esc(page.compareOutro)}</p>
      </section>
      <section class="lp-block" id="how-it-works">
        <h2>${esc(page.howTitle)}</h2>
        <ol class="lp-steps">${steps}</ol>
        <p><a class="lp-btn" href="${APP_STORE_URL}">${appleIcon()}${esc(page.howDownloadLabel)}</a></p>
      </section>
      <section class="lp-block">
        <h2>${esc(page.faqTitle)}</h2>
        <div class="lp-faq">${faqs}</div>
      </section>
      <section class="lp-cta">
        <h2>${esc(page.ctaTitle)}</h2>
        <p class="lp-sub">${esc(page.ctaBody)}</p>
        <a class="lp-btn" href="${APP_STORE_URL}">${appleIcon()}${esc(page.ctaLabel)}</a>
      </section>
      <p class="lp-prose">${esc(watch.relatedLabel)}: ${related}.</p>
    </main>
    <footer class="lp-wrap lp-foot">
      <a href="${HOME}">${esc(page.backLabel)}</a>
    </footer>
  </body>
</html>
`
}

export function renderNotFound(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page not found | GOAT AI Fitness</title>
    <meta name="description" content="This page does not exist on GOAT AI Fitness." />
    <meta name="robots" content="noindex" />
    <link rel="icon" type="image/webp" href="/appicon.webp" />
    <style>${CSS}</style>
  </head>
  <body>
    <main class="lp-wrap lp-cta">
      <p class="lp-brand">GOAT AI Fitness</p>
      <h1>Page not found</h1>
      <p class="lp-sub">That address is not part of this site.</p>
      <div class="lp-actions" style="justify-content:center">
        <a class="lp-btn" href="${HOME}">Home</a>
        <a class="lp-textlink" href="${absolute(landingPages[0].path)}">Apple Watch workout tracker</a>
      </div>
    </main>
  </body>
</html>
`
}

export function sitemapXml(): string {
  const alternate = landingPages
    .map(
      (page) =>
        `    <xhtml:link rel="alternate" hreflang="${page.code}" href="${absolute(page.path)}"/>`,
    )
    .concat(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(landingPages[0].path)}"/>`,
    )
    .join('\n')

  const landing = landingPages
    .map(
      (page) => `  <url>
    <loc>${absolute(page.path)}</loc>
    <lastmod>${LASTMOD}</lastmod>
${alternate}
  </url>`,
    )
    .join('\n')

  const plain = ['/', '/terms', '/privacy']
    .map(
      (path) => `  <url>
    <loc>${path === '/' ? HOME : absolute(path)}</loc>
    <lastmod>${LASTMOD}</lastmod>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${plain}
${landing}
</urlset>
`
}

export function htmlFor(pathname: string): string | null {
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  const page = landingPages.find((item) => item.path === path)
  if (page) return renderLanding(page)
  return null
}

export { landingPages }
