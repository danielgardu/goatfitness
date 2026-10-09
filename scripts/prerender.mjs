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
const placeholder = '<div id="root"></div>'

function inject(file, url) {
  const page = readFileSync(file, 'utf8')
  if (!page.includes(placeholder)) {
    throw new Error(`${file} is missing ${placeholder}`)
  }
  const html = mod.render(url)
  writeFileSync(file, page.replace(placeholder, () => `<div id="root">${html}</div>`))
  console.log(`Prerendered ${url} (${html.split(/\s+/).length} words in markup).`)
}

inject(join('dist', 'index.html'), '/')
inject(join('dist', 'terms', 'index.html'), '/terms')
inject(join('dist', 'privacy', 'index.html'), '/privacy')
