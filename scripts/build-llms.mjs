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

> GOAT AI Fitness is an all-in-one workout tracker for iPhone, iPhone Duo (foldable) and Apple Watch (optional), by developer Daniel Garduño. It logs gym sessions across 260+ exercises with video demos and 40 activity types, including 14 sports. It works fully on iPhone alone. From the wrist you can start any activity, a routine with set check-off, or a Combo of up to 4 activities. Live on the Watch: heart rate, 5 zones, average heart rate, active and total calories, plus running, walking, cycling and swimming stats. Those stats sync live to the iPhone about every 2 seconds. Watch GPS points are added to the iPhone route map. Free download, with an optional GOAT Plus subscription. The iPhone app requires iOS 26 or later and there is no iPad app. The Watch app needs watchOS 26 or later.

Key facts: [App Store](https://apps.apple.com/app/id6772637653). GOAT AI Fitness (goatfitness.app) is an iPhone workout-tracking app by Daniel Garduño. It is not affiliated with GOAT Fitness gyms or with other apps that use the 'GOAT Fitness' name.

Counts were checked in the app source on 8 October 2026: 263 exercises with video demos (written as 260+) and 40 activity types (8 strength, 14 cardio or wellness, 14 sports, 4 outdoor). Unfolded iPhone Duo shows Home and Workouts side by side, uses full-width landscape, keeps layouts off the fold, and moves the tab bar to the side.

## Product pages
${page('/apple-watch-workout-tracker', 'Apple Watch workout tracker')}
${page('/es/app-entrenamiento-apple-watch', 'App de entrenamiento para Apple Watch')}
${page('/de/apple-watch-trainings-tracker', 'Apple Watch Trainings-Tracker')}
${page('/fr/suivi-entrainement-apple-watch', "Suivi d'entraînement Apple Watch")}
${page('/iphone-duo-fitness-app', 'iPhone Duo fitness app')}
${page('/es/app-fitness-iphone-duo', 'App de fitness para iPhone Duo')}

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
