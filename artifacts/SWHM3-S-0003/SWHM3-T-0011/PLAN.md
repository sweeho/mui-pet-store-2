# PLAN — SWHM3-T-0011 Catalog browsing and search

Change: `swhm3-i-0003-catalog-browsing-and-search`. Read its `design.md` first: the section
"Planning context" holds findings F1–F7, decisions P1–P13 and spec discrepancies SD1–SD9. This plan
cites them and does not repeat them.

## Objective

Shoppers browse categories → products → items → item detail and search by keyword, in their
locale, two entries per page, inside the shared shell. The locked suite
`tests/acceptance/catalog-browsing/` passes unchanged.

## Steps

Work through `tasks.md` in order, then the screens.

1. **Data model** (tasks 1.1–1.4): write-time validation (P2), item name from product (P3), new
   migration with the indexes and the sample catalog seed (P11).
2. **Browsing queries and paging** (2.1–2.4, 3.1–3.3): `createCatalog` and its list/get/details/
   ownership methods (P1, P4, P5, P6, P8).
3. **Search** (4.1–4.2): P7.
4. **Operations** (5.1–5.2): `runCatalogCheck` and `CatalogSystemError` (P9, P10), plus
   `resolveScreen`, `createFrontController`, `createFragmentCache` (P10, SD2).
5. **Screens**: the five routes, breadcrumbs, pager, empty/error/loading via the shared frames (P12).
6. **Shell**: Catalog and Search rail entries, header search box, `PUBLIC_PATHS`, messages in en_US,
   ja_JP and zh_CN (P13).
7. **Tests**: design.md Phase 6. Put each case key in its test title.

## Fixed interface contracts

- `@/lib/catalog-browsing` exactly as the header comment of
  `tests/acceptance/catalog-browsing/catalog-browsing.test.ts` states. A page passes `{ db }` to
  `createCatalog`.
- Page = `{ items, hasNext, hasPrevious }`; `getItem` returns `null` when absent, never throws.
- Routes: `/catalog`, `/catalog/categories/[categoryId]`, `/catalog/products/[productId]`,
  `/catalog/items/[itemId]`, `/catalog/search?q=&start=`; paging by `?start=`.
- Header search form: GET `/catalog/search`, field `q`. The shopping-cart capability will add
  **Add to cart** to the item detail page.

## File / module ownership

- `src/lib/catalog-browsing.ts`, `src/lib/catalog-browsing.test.ts` (new)
- `src/db/schema.ts` (indexes), `drizzle/0002_*.sql`, `drizzle/meta/*` (generated), `src/db/prepare.ts`,
  `src/db/seed-catalog.ts` (new)
- `src/app/(DashboardLayout)/catalog/**` (new)
- `src/components/catalog/**` (new: list, pager, breadcrumbs, item detail view, with tests)
- `src/shell/SidebarItems.tsx`, `src/shell/Header.tsx` and their tests
- `src/proxy.ts` (`PUBLIC_PATHS` only)
- `src/lib/localization/messages/{en_US,ja_JP,zh_CN}.ts` (catalog and search keys)
- `e2e/catalog.spec.ts` (new), `e2e/accessibility.spec.ts`

Never edited: anything under `tests/acceptance/` or `openspec/`.

## Design reference

Files in `artifacts/SWHM3-S-0003/design/`, listed with route, state and viewport in its `MANIFEST.md`
(SWHM3-MCK-17 … SWHM3-MCK-28). Render each route beside its mockup at the same viewport. Expected
residuals: rail entries and the Sign in button of later capabilities; **Add to cart** (shopping
cart); the attribute label "Size" is shown as the attribute value list (no per-attribute labels
exist in the data).

## Definition of Done

AC-1 … AC-21 on the ticket, one per scenario. Also: the locked catalog-browsing suite passes
unchanged; the locked site-shell and localization suites stay green; the generated migration is
committed.
