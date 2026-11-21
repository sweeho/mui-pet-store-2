---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM3-S-0003
capability brief: SWHM3-I-0003
branch: vortex/sprint/swhm3-s-0003-cf97ddf6
upstream: [artifacts/SWHM3-S-0003/SPRINT-PLAN.md]
downstream: [artifacts/SWHM3-S-0003/sprint-summary.md]
---

# QA test report — SWHM3-S-0003

## Executive Summary
**Verdict: PASS.** Catalog browsing and search (SWHM3-I-0003) works on the integrated sprint branch: category, product, item and detail pages, breadcrumbs, offset paging, header search, empty and unknown-id frames. `npx playwright test --project=chromium` gave 17 passed, 0 failed, 0 skipped. The 18 catalog-browsing acceptance cases pass. The unit suite passed 81/81 on two of three runs; one coverage run failed a single unrelated test with `SQLITE_BUSY` (flake, filed as SWHM3-T-0013, not fixed in this sprint). The 8 locked acceptance suites of later capabilities fail, as expected before those capabilities exist; they are warnings (acceptance is enforced at release UAT).

Scenario verdicts (one per delta-spec scenario of change swhm3-i-0003-catalog-browsing-and-search):

SCENARIO-VERDICT: Direct catalog data access / Direct catalog data access — not-testable: the legacy "configured data-access class and SQL definitions file" mechanism does not exist in the rebuild (Drizzle via src/lib); reads are exercised by the E2E and acceptance runs
SCENARIO-VERDICT: Catalog lists per page (CATB) / Catalog lists per page (CATB) — pass (acceptance SWHM3-C-0235; E2E paging)
SCENARIO-VERDICT: Catalog page size configuration / Catalog page size configuration — pass (acceptance SWHM3-C-0236, pages 2, 2, 1)
SCENARIO-VERDICT: Item detail record content / Item detail record content — pass (acceptance SWHM3-C-0218)
SCENARIO-VERDICT: No price-versus-cost constraint / No price-versus-cost constraint — pass (acceptance SWHM3-C-0233)
SCENARIO-VERDICT: Item attributes exposed / Item attributes exposed — pass (acceptance SWHM3-C-0234; detail page in E2E)
SCENARIO-VERDICT: Catalog check repopulation / Catalog check repopulation — pass (acceptance SWHM3-C-0221)
SCENARIO-VERDICT: Flow handler screen resolution / Flow handler screen resolution — pass (acceptance SWHM3-C-0222)
SCENARIO-VERDICT: Catalog entity hierarchy / Catalog entity hierarchy — pass (acceptance SWHM3-C-0219)
SCENARIO-VERDICT: Single front controller / Single front controller — pass (acceptance SWHM3-C-0223)
SCENARIO-VERDICT: Catalog identifier and ownership / Catalog identifier and ownership — pass (acceptance SWHM3-C-0224)
SCENARIO-VERDICT: Category ordering and caller page size / Category ordering and caller page size — pass (acceptance SWHM3-C-0225)
SCENARIO-VERDICT: Unknown identifier yields no result / Unknown identifier yields no result — pass (acceptance SWHM3-C-0226; E2E `/catalog/items/NOPE` shows the empty frame)
SCENARIO-VERDICT: Language-specific detail records / Language-specific detail records — pass (acceptance SWHM3-C-0227)
SCENARIO-VERDICT: Fragment caching / Fragment caching — pass (acceptance SWHM3-C-0228)
SCENARIO-VERDICT: Locale-specific browsing / Locale-specific browsing — pass (acceptance SWHM3-C-0229)
SCENARIO-VERDICT: Name ordering and missing entities / Name ordering and missing entities — pass (acceptance SWHM3-C-0230)
SCENARIO-VERDICT: Offset paging with next and previous / Offset paging with next and previous — pass (acceptance SWHM3-C-0220; E2E Next/Previous)
SCENARIO-VERDICT: Keyword item search / Keyword item search — pass (acceptance SWHM3-C-0231; E2E header search "fish")
SCENARIO-VERDICT: Empty search query / Empty search query — pass (acceptance SWHM3-C-0232; E2E blank query empty frame)
SCENARIO-VERDICT: External SQL statements and error reporting / External SQL statements and error reporting — not-testable: no failing-database path is exercised by the existing E2E or acceptance tests, and the XML statement file is a legacy mechanism with no equivalent

## E2E Test Status
`npx playwright test --project=chromium`: `17 passed (13.1s)`, 0 failed, 0 skipped. Per-spec table and commands: `artifacts/SWHM3-S-0003/integration-test-result.md`.

Warnings (locked acceptance, enforced at UAT only, not fixed):
- `npm run test:acceptance`: 8 of 10 suites fail (supplier-fulfillment, checkout-order-placement, batch-operations, customer-accounts, customer-notifications, order-approval, shopping-cart, order-administration); `Tests: 10 failed, 48 passed, 58 total`. The passing suites include catalog-browsing; the three suites for this sprint's area (catalog-browsing, localization, site-shell) ran together: `Tests: 43 passed, 43 total`.
- `npm run test:acceptance:e2e`: `25 failed`, `8 passed (4.6m)`; every failing spec belongs to a later capability (customer accounts, checkout, order administration, shopping cart, order approval, supplier fulfillment) whose pages do not exist yet.

## Unit Test Results
```
$ npm test
Test Suites: 18 passed, 18 total
Tests:       81 passed, 81 total
```
A first run with coverage (`npm test -- --coverage`) reported `Test Suites: 1 failed, 17 passed` and `Tests: 1 failed, 80 passed, 81 total`: `src/app/api/users/route.test.ts` failed with `SQLITE_BUSY: database is locked`. Two isolated runs of that file passed. Recorded as DEFECT-1 (flake), SWHM3-T-0013.

Static checks: `npm run lint` exit 0, `npm run typecheck` exit 0, `npm run format:check` exit 0.

## Code Review
No notable concerns observed in the catalog pages while verifying. One observation: the production standalone server needs `.next/static` copied beside `server.js` for CSS, fonts and client JS (without it the rail and fonts do not render); the Dockerfile handles this, and it is not a code defect.

## Coverage Summary
`npm test -- --coverage` (the run with the flaky failure): `All files | 89.63 % statements | 76.28 % branches | 88.26 % functions | 92.38 % lines`. No baseline from before the sprint was measured, so a regression cannot be ruled out or confirmed. Mutation testing was not run.

## Design fidelity
Reference: `artifacts/SWHM3-S-0003/design/MANIFEST.md` (12 mockups). Method: production build (`next build`, standalone server with static assets, seeded database), `design-measure.mjs` per mockup at the manifest route and viewport; output in `artifacts/SWHM3-S-0003/qa/design/`. The no-match state was measured with `q=unicorn` (the mockup's own query). The `/catalog/search` Search rail entry, loading and error frames, and a Next-enabled product list (the seeded Fish category has two products) were not reachable or not measured.

DESIGN-VERDICT: SWHM3-MCK-17 match — 2.8% of pixels differ; content, paging, breadcrumbs and tokens agree
- RESIDUAL: SWHM3-MCK-17 shell rail and header — mockup: Cart, Sign in, Profile, Orders, Sales charts, Inventory entries, header Cart and Sign in buttons; built: only entries that have a page (later capabilities)
- RESIDUAL: SWHM3-MCK-17 shell copy — mockup: "Orders", "English (US)"; built: "Order administration", "English (United States)"
DESIGN-VERDICT: SWHM3-MCK-18 match — 7.6% of pixels differ, from the mobile shell header and 17–25px vertical offsets below it
- RESIDUAL: SWHM3-MCK-18 mobile header — mockup: menu, brand, "Pet Store", language, cart icons; built: the site-shell header (search below the brand row)
DESIGN-VERDICT: SWHM3-MCK-19 match — 2.8% of pixels differ; Next is disabled in the built page because the seeded category has two products
- RESIDUAL: SWHM3-MCK-19 shell rail and header — same as MCK-17
DESIGN-VERDICT: SWHM3-MCK-20 match — 7.6% of pixels differ, shell header and offsets only
- RESIDUAL: SWHM3-MCK-20 mobile header — same as MCK-18
DESIGN-VERDICT: SWHM3-MCK-21 match — 2.9% of pixels differ
- RESIDUAL: SWHM3-MCK-21 shell rail and header — same as MCK-17
DESIGN-VERDICT: SWHM3-MCK-22 match — 7.8% of pixels differ, shell header and offsets only
- RESIDUAL: SWHM3-MCK-22 mobile header — same as MCK-18
DESIGN-VERDICT: SWHM3-MCK-23 differs — 3.6% of pixels differ; the "Add to cart" button is not built (Shopping cart capability), and the details table sits 47px higher than the mockup
- RESIDUAL: SWHM3-MCK-23 Add to cart — mockup: primary button under the price; built: absent (the brief assigns it to the Shopping cart capability)
- RESIDUAL: SWHM3-MCK-23 shell rail and header — same as MCK-17
DESIGN-VERDICT: SWHM3-MCK-24 differs — 12.6% of pixels differ; no "Add to cart" button, built page 968px against 923px, content blocks offset 45–75px
- RESIDUAL: SWHM3-MCK-24 Add to cart — mockup: full-width button; built: absent (Shopping cart capability)
- RESIDUAL: SWHM3-MCK-24 detail layout — mockup: title and chips sit at y 482–542; built: y 556–617, the image block is taller or the header is taller
DESIGN-VERDICT: SWHM3-MCK-25 match — 2.9% of pixels differ
- RESIDUAL: SWHM3-MCK-25 shell rail and header — same as MCK-17
DESIGN-VERDICT: SWHM3-MCK-26 match — 7.1% of pixels differ, shell header and offsets only
- RESIDUAL: SWHM3-MCK-26 mobile header — same as MCK-18
DESIGN-VERDICT: SWHM3-MCK-27 match — 2.8% of pixels differ
- RESIDUAL: SWHM3-MCK-27 shell rail and header — same as MCK-17
DESIGN-VERDICT: SWHM3-MCK-28 match — 14.6% of pixels differ, from the shell header offset and the empty frame sitting 8–50px lower
- RESIDUAL: SWHM3-MCK-28 empty frame — mockup: icon and text at y 339–450; built: y 388–496
The design-conformance proposal tool answered `disabled: true` for this project, so no conformance outcome was recorded. No fix was made in place for the differences above (all either belong to other capabilities' shell content or are offsets I did not trace to one cause).

## Issues Found
- DEFECT-1 (minor): `src/app/api/users/route.test.ts` flakes with `SQLITE_BUSY`. Not fixed in place (flake, outside the sprint's change). Future-sprint DEFECT SWHM3-T-0013. See `artifacts/SWHM3-S-0003/integration-defects-resolution.md`.
- No SPEC-GAP found.

## Recommendation
Every scenario of the sprint's change passes or is stated not-testable, and the project's own E2E is green. The only defect is an unrelated flaky test, filed as a future-sprint DEFECT, so the sprint fires `validation.unfixable_defects_found` per the defect procedure; a human can choose Conditional Approve. Locked acceptance failures are listed as UAT warnings.
