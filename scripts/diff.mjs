import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const names = readdirSync('screens')
  .filter((name) => name.startsWith('before-') && name.endsWith('.png'))
  .map((name) => name.slice('before-'.length))

if (names.length === 0) {
  console.error('No screens/before-*.png files.')
  process.exit(1)
}

for (const name of names) {
  const after = `screens/after-${name}`
  if (!existsSync(after)) {
    console.log(`${name}: missing after screenshot`)
    continue
  }
  const a = PNG.sync.read(readFileSync(`screens/before-${name}`))
  const b = PNG.sync.read(readFileSync(after))
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`${name}: size ${a.width}x${a.height} vs ${b.width}x${b.height}`)
    continue
  }
  const diff = new PNG({ width: a.width, height: a.height })
  const mismatched = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 })
  writeFileSync(`screens/diff-${name}`, PNG.sync.write(diff))
  const pct = ((100 * mismatched) / (a.width * a.height)).toFixed(3)
  console.log(`${name}: ${mismatched} px (${pct}%)`)
}
