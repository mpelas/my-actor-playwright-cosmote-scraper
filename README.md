# Cosmote.gr Plans Scraper v2 (Apify Actor, JS + Crawlee/Playwright)

Enhanced version of the Cosmote scraper. Crawls Cosmote.gr eshop category
pages with Playwright, declines the cookie banner, extracts plans and follows
in-page pagination (`#paginationNextLink`).

## v2 changes

- Input validation (exits cleanly when `startUrls` is empty)
- Proxy support via `proxy_configuration` input (`Actor.createProxyConfiguration()`)
- `maxConcurrency` input (capped 1-5), retries 3, handler timeout 180s, stealth launch args
- Pay-per-event monetization: each pushed plan charges `plan_scraped`
  (`Actor.charge({ eventName: 'plan_scraped', count })`)
- Proper actor.json (name `my-actor-playwright-cosmote-scraper-v2`, v2.0), input/output/dataset schemas

## Pricing (pay per event)

`plan_scraped` (primary) — **$0.005 per plan**.

## Run locally

```bash
npm install
npm start
```

## Deploy

```bash
apify push
```
