import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SITE = 'https://goatfitness.app'
const sitemap = readFileSync(join('dist', 'sitemap.xml'), 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const locSet = new Set(locs)

function page(path, label) {
  const url = path === '/' ? `${SITE}/` : `${SITE}${path}`
  if (!locSet.has(url)) {
    throw new Error(`llms.txt would list ${url}, which is not in the sitemap`)
  }
  return `- [${label}](${url})`
}

const llms = `# GOAT AI Fitness (GOAT Fitness app)

> GOAT AI Fitness is an all-in-one workout tracker for iPhone by developer Daniel Garduño. It logs gym sessions (sets, reps, weight across 300+ exercises with video guides), runs, walks and 30+ sports in one training history. It works fully on iPhone alone; Apple Watch is optional (live heart rate, wrist controls). Free on the App Store with an optional GOAT Plus subscription. iOS 26+.

Key facts: [App Store](https://apps.apple.com/app/id6772637653). GOAT AI Fitness (goatfitness.app) is an iPhone workout-tracking app by Daniel Garduño. It is not affiliated with GOAT Fitness gyms or with other apps that use the 'GOAT Fitness' name.

Exercise count "300+" and sports count "30+" match the App Store listing checked 2026-10-08 and the current site. The exercise library was not in this website repository, so the count is not re-counted from app source.

## Product pages
${page('/apple-watch-workout-tracker', 'Apple Watch workout tracker')}
${page('/es/app-entrenamiento-apple-watch', 'App de entrenamiento para Apple Watch')}
${page('/de/apple-watch-trainings-tracker', 'Apple Watch Trainings-Tracker')}
${page('/fr/suivi-entrainement-apple-watch', "Suivi d'entraînement Apple Watch")}

## Company
${page('/terms', 'Terms of Service')}
${page('/privacy', 'Privacy Policy')}
${page('/', 'GOAT AI Fitness home')}
`

const enHtml = readFileSync(join('dist', 'apple-watch-workout-tracker', 'index.html'), 'utf8')
const main = enHtml.match(/<main[\s\S]*<\/main>/)?.[0] ?? ''
const visible = main
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim()

const full = `# GOAT AI Fitness (GOAT Fitness app)

Visible text from the live English landing. Regenerated at build time.
Pages that are not live yet (/facts, /goat-fitness-app) are omitted.

## ${SITE}/apple-watch-workout-tracker

${visible}
`

for (const dir of ['dist', 'public']) {
  writeFileSync(join(dir, 'llms.txt'), llms)
  writeFileSync(join(dir, 'llms-full.txt'), full)
}

const listed = [...llms.matchAll(/\]\((https:\/\/goatfitness\.app[^)]*)\)/g)].map((match) => match[1])
for (const url of listed) {
  if (!locSet.has(url)) throw new Error(`Listed URL missing from sitemap: ${url}`)
}

console.log(`Wrote llms.txt (${listed.length} site links) and llms-full.txt.`)
