# SEO log

## 2026-10-08

- Branch `seo/p0-foundation` (continues the unpublished homepage prerender and landing links).
- Home: visible H1 "GOAT AI Fitness", Watch-optional line, one crawlable link to `/apple-watch-workout-tracker`, footer links for ES/DE/FR, prerendered HTML, schema `@graph` with one MobileApplication. FAQPage removed. Home title and meta description left as already live.
- Landings: Watch-optional line directly under each H1, shared schema `@id` references, "what the Watch adds" table (`data-seo-unique="watch-adds"`). ES/DE/FR new paragraphs need native review.
- Added `robots.txt` AI crawler groups, `/llms.txt`, `/llms-full.txt`, IndexNow key `b84808887345451eb95c1594c7c1e9aa`.
- IndexNow POST was not sent. The key file is not on production yet, so a ping would return 403. Run `npm run indexnow` after the production deploy.
- www redirect is in `vercel.json`. `www.goatfitness.app` still does not resolve. DNS steps are in the PR for Daniel.
