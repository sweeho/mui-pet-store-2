---
ticket: SWHM3-T-0011
---
# Summary — Catalog browsing and search

Built the read-only catalog: category → product → item → item detail, paging two per page with Previous/Next, and keyword search from a header box, in the shopper's locale, inside the shared shell.

## What changed
- `src/lib/catalog-browsing.ts`: `createCatalog` (add*/details/ownership/list*/search/get*, page size capped at 50, stable order, `CatalogSystemError` with logging), `resolveScreen`, `createFrontController`, `createFragmentCache`, `runCatalogCheck`.
- Data: `drizzle/0002_*` (indexes), `src/db/schema.ts`, `src/db/seed-catalog.ts` + `prepare.ts` (five categories, three locales, one item priced below cost).
- Screens `src/app/(DashboardLayout)/catalog/**`, components `src/components/catalog/**`; shared empty frame tuned to the mockup.
- Shell: Catalog and Search rail entries, header search form (GET `/catalog/search`, `q`), `/catalog` in `PUBLIC_PATHS`, messages in en_US, ja_JP, zh_CN. Added `@fontsource-variable/jetbrains-mono` for the mockups' monospace face.
- Tests: `src/lib/catalog-browsing.test.ts`, component and shell tests, `e2e/catalog.spec.ts`, catalog pages in `e2e/accessibility.spec.ts`.

## Deviations
- Header search is a plain `<form>` with `withBasePath`, not `next/form` (avoids a router dependency in unit tests).
- Pager shows a disabled Previous/Next when unavailable (as the mockups do) instead of omitting it.
- Search rail entry is never marked current; Catalog is on every catalog page (as the mockups show).

## Rules (each answered in the ticket plan)
A11Y-001 structural checks in e2e/accessibility.spec.ts for all catalog pages. ACC-001 `/catalog` public by list, tested. API-104 start/size, size ≤ 50, start capped. ARC-101 reads only server-side via Drizzle. DATA-102 generated migration 0002 applied by `prepareDatabase`. DATA-106 limit, name/id order, indexes. OBS-003 reads logged and rethrown. UX-101 semantic nav/dl/lists, labelled search, submit button. UX-104 fluid layout, e2e at 320px. UX-105 pager range is `role="status"`, frames use alert/status.

## AC coverage
All 21 ACs are covered by the 19 linked cases in `src/lib/catalog-browsing.test.ts` plus the locked suite (passed in the recorded green run). Design: `design-check.md`, 12 mockups measured; residuals are later-capability shell entries and Add to cart.

## Verification
`node .vortex/check-versions.mjs && npm run verify:full`: pass (81 Jest, 17 Playwright). `npm run build`: pass.

CODE-REVIEW: sub-agent — fixed: huge `?start=` now an empty page, search capped at 200 chars and 10 keywords, duplicate breadcrumb keys, search submit button, pager nav and status markup; rejected: useSearchParams without Suspense (production build and prerender pass), seed atomicity across calls (runs once at startup; noted), logging of add* errors (they are rethrown to the caller, not swallowed).
