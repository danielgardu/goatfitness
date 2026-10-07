import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const build = spawnSync(
  'npx',
  ['vite', 'build', '--ssr', 'src/entry-server.tsx', '--outDir', 'dist-ssr'],
  { stdio: 'inherit' },
)
if (build.status !== 0) process.exit(build.status ?? 1)

const mod = await import(pathToFileURL(join(process.cwd(), 'dist-ssr/entry-server.js')).href)
const html = mod.render('/')
const indexPath = join('dist', 'index.html')
const page = readFileSync(indexPath, 'utf8')
const placeholder = '<div id="root"></div>'
if (!page.includes(placeholder)) {
  throw new Error('dist/index.html is missing <div id="root"></div>')
}
writeFileSync(indexPath, page.replace(placeholder, () => `<div id="root">${html}</div>`))
console.log(`Prerendered homepage (${html.split(/\s+/).length} words in markup).`)
