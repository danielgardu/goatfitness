import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const HOST = 'goatfitness.app'
const statePath = join('seo', 'indexnow-state.json')

const keyName = readdirSync('public').find((name) => /^[0-9a-f]{32}\.txt$/.test(name))
if (!keyName) throw new Error('public/<32-hex>.txt IndexNow key file is missing')
const key = keyName.slice(0, -4)
const keyBody = readFileSync(join('public', keyName), 'utf8')
if (keyBody !== key) {
  throw new Error('IndexNow key file must contain exactly the key and no newline')
}

let xml
if (existsSync(join('dist', 'sitemap.xml'))) {
  xml = readFileSync(join('dist', 'sitemap.xml'), 'utf8')
} else {
  const response = await fetch(`https://${HOST}/sitemap.xml`)
  if (!response.ok) throw new Error(`Sitemap fetch failed: ${response.status}`)
  xml = await response.text()
}

const current = {}
for (const block of xml.split('<url>').slice(1)) {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]
  const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? ''
  if (loc) current[loc] = lastmod
}

const previous = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : {}
const changed = Object.keys(current).filter((url) => previous[url] !== current[url])

if (changed.length === 0) {
  console.log('IndexNow: no URLs changed.')
  process.exit(0)
}

const payload = {
  host: HOST,
  key,
  keyLocation: `https://${HOST}/${key}.txt`,
  urlList: changed,
}

console.log(`IndexNow: submitting ${changed.length} URL(s).`)
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
})
const body = await response.text()
console.log(`IndexNow status ${response.status}`)
if (body) console.log(body.slice(0, 500))
if (response.status !== 200 && response.status !== 202) {
  process.exit(1)
}

writeFileSync(statePath, `${JSON.stringify(current, null, 2)}\n`)
console.log(`Updated ${statePath}`)
