import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.env.BASE || 'http://localhost:4173';
const tag = process.argv[2] || 'before';
mkdirSync('screens', { recursive: true });

const browser = await chromium.launch();
const frozen = new Date('2026-10-07T19:00:00Z');

for (const w of [1440, 390]) {
  const page = await browser.newPage({
    viewport: { width: w, height: w === 390 ? 844 : 900 },
    deviceScaleFactor: 1,
  });
  await page.clock.install({ time: frozen });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `screens/${tag}-${w}-fold.png` });
  await page.screenshot({ path: `screens/${tag}-${w}-full.png`, fullPage: true });
  await page.close();
}

{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.route('**/*.{js,mjs}', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `screens/${tag}-1440-prejs.png`, fullPage: true });
  await page.close();
}

await browser.close();
