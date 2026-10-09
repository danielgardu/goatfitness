# SEO process: read before every page

- Build on the existing landing template. Never invent a layout. Never touch the home design.
- One search intent = one URL. Check docs/seo-pages.json (and GSC data if Daniel shared it) for an existing page first.
- The page must contain its unique element (see the master brief P1 table). If you can't build it with real data, don't ship the page.
- Watch-optional line under the H1; answer-first 40–60 word intro; question H2s answered in the first 1–2 sentences.
- At least 5 contextual internal links TO the new page, from the body text of related pages (not only nav/footer).
- Same-language siblings + language switcher + reciprocal hreflang + x-default.
- Structured data only for what is visible. FAQPage only with a visible FAQ. No aggregateRating.
- Update sitemap.xml (lastmod), llms.txt and llms-full.txt, docs/seo-pages.json.
- Run `npm run seo:gate` and attach its output to the PR.
- After a production deploy: IndexNow ping (automatic), and Daniel requests indexing in GSC.
- Cadence: max 1 new page per day; target 2–4 per week (EN+ES pairs). Never batch 20 pages in a day.
