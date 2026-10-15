import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SITE = 'https://goatfitness.app'
const pages = JSON.parse(readFileSync(join('docs', 'seo-pages.json'), 'utf8'))
const byUrl = new Map(pages.map((page) => [page.url, page]))
const failures = []

function fail(message) {
  failures.push(message)
}

function decode(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function visibleText(html) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ').trim()
}

function walk(dir, extension = '.html') {
  const files = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) files.push(...walk(path, extension))
    else if (name.endsWith(extension)) files.push(path)
  }
  return files
}

function urlFor(file) {
  const rel = file.replace(/^dist\/?/, '').replace(/\/index\.html$/, '').replace(/^index\.html$/, '')
  return rel ? `${SITE}/${rel}` : `${SITE}/`
}

const watchLines = {
  en: 'Works great on iPhone and iPhone Duo — with or without Apple Watch.',
  es: 'Funciona perfectamente en iPhone y iPhone Duo, con o sin Apple Watch.',
  de: 'Funktioniert bestens auf iPhone und iPhone Duo – mit oder ohne Apple Watch.',
  fr: 'Fonctionne parfaitement sur iPhone et iPhone Duo — avec ou sans Apple Watch.',
}

const htmlFiles = walk('dist')
const htmlByUrl = new Map()

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  const url = urlFor(file)
  if (html.includes('name="robots" content="noindex"') || html.includes("content='noindex'")) {
    continue
  }
  htmlByUrl.set(url, html)
  const meta = pages.find((page) => page.url === url)
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '')
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '')
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
  const h1s = html.match(/<h1\b/g) ?? []
  const lang = html.match(/<html lang="([^"]+)"/)?.[1] ?? 'en'

  const titleMax = meta?.titleMax ?? 60
  if (title.length > titleMax) fail(`${url} title is ${title.length} chars: ${title}`)
  if (!description) fail(`${url} is missing a meta description`)
  else if (description.length > 155) fail(`${url} meta description is ${description.length} chars`)
  if (h1s.length !== 1) fail(`${url} has ${h1s.length} h1 elements`)
  if (canonical !== url) fail(`${url} canonical is ${canonical ?? 'missing'}`)

  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
  if (meta?.siblings?.length) {
    if (!hreflangs.some(([,, href]) => href === url)) {
      // self hreflang is the page's own language, not necessarily its own url in the set of matches against url
    }
    const hrefs = new Map(hreflangs.map((match) => [match[1], match[2]]))
    if (!hrefs.has('x-default')) fail(`${url} is missing hreflang x-default`)
    for (const sibling of meta.siblings) {
      const siblingMeta = byUrl.get(sibling)
      if (!siblingMeta) {
        fail(`${url} sibling ${sibling} is not in seo-pages.json`)
        continue
      }
      if (hrefs.get(siblingMeta.lang) !== sibling) {
        fail(`${url} hreflang ${siblingMeta.lang} should be ${sibling}`)
      }
    }
    if (hrefs.get(meta.lang) !== url) fail(`${url} hreflang ${meta.lang} should be itself`)
  }

  const exemptWatch = meta?.skipWatchLine || url === `${SITE}/terms` || url === `${SITE}/privacy`
  if (!exemptWatch) {
    const line = meta?.watchLine || watchLines[lang] || watchLines.en
    if (!html.includes(line)) fail(`${url} is missing the Watch-optional line`)
  }

  if (meta?.uniqueElementSelector) {
    const attr = meta.uniqueElementSelector.match(/\[([^=]+)="([^"]+)"\]/)
    const present = attr ? html.includes(`${attr[1]}="${attr[2]}"`) : html.includes(meta.uniqueElementSelector)
    if (!present) fail(`${url} is missing unique element ${meta.uniqueElementSelector}`)
  }

  if (meta?.kind === 'landing') {
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? html
    const words = visibleText(main).split(/\s+/).filter(Boolean)
    if (words.length < 700) fail(`${url} has ${words.length} visible words (landing minimum 700)`)
  }

  if (url === `${SITE}/`) {
    const words = visibleText(html.match(/<body[\s\S]*<\/body>/)?.[0] ?? '').split(/\s+/).filter(Boolean)
    console.log(`home visible words: ${words.length}`)
    const h1 = decode(html.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    if (h1 !== 'GOAT') fail(`home h1 text is "${h1}"`)
    if (/class="[^"]*\bsr-only\b/.test(html)) fail('home uses sr-only; Plan A should keep the H1 text visible')
  }

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1])
  const visible = visibleText(html)
  for (const block of blocks) {
    if (block.includes('aggregateRating') || /"@type"\s*:\s*"Review"/.test(block)) {
      fail(`${url} contains rating or review schema`)
    }
    let data
    try {
      data = JSON.parse(block)
    } catch {
      fail(`${url} has invalid JSON-LD`)
      continue
    }
    const nodes = data['@graph'] ?? [data]
    for (const node of nodes) {
      if (node['@type'] !== 'FAQPage') continue
      for (const question of node.mainEntity ?? []) {
        const name = String(question.name ?? '').replace(/\s+/g, ' ').trim()
        const answer = String(question.acceptedAnswer?.text ?? '').replace(/\s+/g, ' ').trim()
        if (!visible.includes(name) || !visible.includes(answer)) {
          fail(`${url} FAQPage text is not visible: ${name.slice(0, 80)}`)
        }
      }
    }
  }
}

for (const [url, html] of htmlByUrl) {
  const meta = byUrl.get(url)
  if (!meta?.siblings?.length) continue
  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
  for (const match of hreflangs) {
    const target = match[2]
    if (!target.startsWith(SITE)) continue
    const other = htmlByUrl.get(target)
    if (!other) {
      fail(`${url} hreflang target ${target} is not a built page`)
      continue
    }
    if (!other.includes(`href="${url}"`)) fail(`${target} does not link back to ${url}`)
  }
}

const landings = pages.filter((page) => page.kind === 'landing')
for (const page of landings) {
  let inbound = 0
  for (const [url, html] of htmlByUrl) {
    if (url === page.url) continue
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0]
    if (!main) continue
    const path = page.url.replace(SITE, '')
    const matches = main.match(new RegExp(`href="(?:${SITE})?${path}"`, 'g')) ?? []
    inbound += matches.length
  }
  const others = landings.filter((item) => item.cluster === page.cluster && item.url !== page.url).length
  const required = Math.min(5, others)
  if (inbound < required) {
    fail(`${page.url} has ${inbound} contextual inbound links (need ${required} until 5 topical pages exist)`)
  }
}

function shingles(text) {
  const words = text.toLowerCase().match(/[a-z0-9à-ÿ]+/g) ?? []
  const set = new Set()
  for (let i = 0; i <= words.length - 5; i += 1) set.add(words.slice(i, i + 5).join(' '))
  return set
}

function jaccard(a, b) {
  let inter = 0
  for (const item of a) if (b.has(item)) inter += 1
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

const clusters = new Map()
for (const page of landings) {
  const html = htmlByUrl.get(page.url)
  if (!html) continue
  const text = visibleText(html.match(/<main[\s\S]*<\/main>/)?.[0] ?? html)
  const list = clusters.get(page.cluster) ?? []
  list.push({ url: page.url, shingles: shingles(text) })
  clusters.set(page.cluster, list)
}
for (const list of clusters.values()) {
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const score = jaccard(list[i].shingles, list[j].shingles)
      if (score > 0.4) {
        fail(`${list[i].url} and ${list[j].url} are ${(score * 100).toFixed(1)}% similar`)
      }
    }
  }
}

const sitemap = readFileSync(join('dist', 'sitemap.xml'), 'utf8')
const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))
const llms = readFileSync(join('dist', 'llms.txt'), 'utf8')
for (const match of llms.matchAll(/\]\((https:\/\/goatfitness\.app[^)]*)\)/g)) {
  if (!locs.has(match[1])) fail(`llms.txt lists ${match[1]} but it is not in the sitemap`)
}

const sameAs = new Set()
for (const html of htmlByUrl.values()) {
  for (const match of html.matchAll(/"sameAs"\s*:\s*\[([^\]]*)\]/g)) {
    for (const url of match[1].matchAll(/"(https:[^"]+)"/g)) sameAs.add(url[1])
  }
}
for (const url of sameAs) {
  try {
    const response = await fetch(url, { redirect: 'follow' })
    if (response.status !== 200) fail(`sameAs ${url} returned ${response.status}`)
  } catch (error) {
    fail(`sameAs ${url} failed: ${error.message}`)
  }
}

const brandSource = []
function addBrand(path) {
  brandSource.push([path, readFileSync(path, 'utf8')])
}
addBrand(join('dist', 'llms.txt'))
addBrand(join('dist', 'llms-full.txt'))
for (const file of htmlFiles) addBrand(file)
for (const extension of ['.ts', '.tsx', '.html']) {
  for (const file of walk('src', extension)) addBrand(file)
}

const retiredClaims = ['300+', '252+', '30+', 'over 40 activities']
for (const [path, text] of brandSource) {
  for (const claim of retiredClaims) {
    if (text.includes(claim)) fail(`retired claim "${claim}" in ${path}`)
  }
}

const allowedDisambiguation = [
  "It is not affiliated with GOAT Fitness gyms or with other apps that use the 'GOAT Fitness' name.",
  'Not affiliated with GOAT Fitness gyms or other "GOAT Fitness" apps.',
  ' (GOAT Fitness)',
]
for (const [path, text] of brandSource) {
  let stripped = text.replace(/"alternateName"\s*:\s*\[[^\]]*\]/g, '')
  stripped = stripped.replace(/"alternateName"\s*:\s*"[^"]*"/g, '')
  for (const phrase of allowedDisambiguation) stripped = stripped.split(phrase).join('')
  const bad = stripped.match(/Goat Fitness|Goat AI Fitness|GoatAI|requires (an )?Apple Watch|GOAT Fitness(?! app)/)
  if (bad) fail(`brand check hit "${bad[0]}" in ${path}`)
}

if (failures.length) {
  console.error(`seo:gate failed (${failures.length})`)
  for (const item of failures) console.error(`- ${item}`)
  process.exit(1)
}

console.log(`seo:gate passed (${htmlByUrl.size} indexable pages, ${sameAs.size} sameAs URLs).`)
