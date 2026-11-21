---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM3-S-0001
capability brief: SWHM3-I-0001
branch: vortex/sprint/swhm3-s-0001-b0a33f43
upstream: [artifacts/SWHM3-S-0001/SPRINT-PLAN.md]
downstream: [artifacts/SWHM3-S-0001/sprint-summary.md]
---

# QA test report — SWHM3-S-0001

## Executive Summary
**Verdict: PASS.** All five site-shell scenarios of SWHM3-I-0001 hold on the integrated sprint branch. `npm run build` and `npm run verify` exit 0, the project E2E suite is 11 passed / 0 failed / 0 skipped, and the locked site-shell acceptance spec passes 5 of 5. No defects found.

SCENARIO-VERDICT: Landing page / A user opens the root route — pass
SCENARIO-VERDICT: Global navigation / Navigation is present on every page — pass
SCENARIO-VERDICT: Shared page layout / A page renders inside the shell — pass
SCENARIO-VERDICT: Shared state frames / A page has nothing to show — pass
SCENARIO-VERDICT: Shared state frames / A page fails to load — pass

## E2E Test Status
`npm run test:e2e` → `11 passed (6.4s)`, 0 failed, 0 skipped. Per-spec table: `artifacts/SWHM3-S-0001/integration-test-result.md`.

Warnings (locked acceptance suite, enforced only at release UAT, not fixed here): `npm run test:acceptance:e2e` → `28 failed`, `5 passed`. The 5 passes are `tests/acceptance/site-shell/e2e/site-shell.spec.ts` (SWHM3-C-0163 to C-0167). The 28 failures are in the specs of other capabilities not yet built (customer-accounts, supplier-fulfillment, order-administration and others). `npm run test:acceptance` (jest) → `Test Suites: 10 failed, 10 total`: each suite fails to run with "Cannot find module '../../../src/lib/<capability>'" for a library a later capability builds.

Proving tests: `PROVING_BASE_URL=http://127.0.0.1:3000 npm run test:proving` against the built standalone server → `1 passed` (PERF-001).

## Unit Test Results
```
$ npm run verify     # lint, format:check, typecheck, jest — exit 0
Test Suites: 9 passed, 9 total
Tests:       13 passed, 13 total
```

## Code Review
No notable concerns observed. Incidental note: the rail and landing page hold three entries (Home, Localization, Order administration), as the spec and design.md P6/SD2 define; later capabilities add theirs.

## Coverage Summary
`npm test -- --coverage` (jest): All files 90.44% statements, 71.42% branches, 86.84% functions, 90.74% lines. No baseline was measured, so a regression cannot be judged. Playwright coverage was not measured.

## Design fidelity
Reference: `artifacts/SWHM3-S-0001/design/*.html` (8 mockups). Method: `design-measure.mjs` against the production build (standalone server on :3000; /localization loading and error states reached through a proxy that holds or fails /api/locales). Output in `artifacts/SWHM3-S-0001/qa/design/`. All eight states were reached.

DESIGN-VERDICT: SWHM3-MCK-1 differs — 6.1% pixels differ; fonts, colours, sizes and radius match, content differs only for areas not built
- RESIDUAL: SWHM3-MCK-1 rail and landing cards — mockup: Catalog, Search, Cart, Account, sign-in, language, hero buttons; built: Home, Localization, Order administration only (design.md P6, SD2)
DESIGN-VERDICT: SWHM3-MCK-2 differs — 12.2% pixels differ; same cause, plus the mockup's extra cards make it taller
- RESIDUAL: SWHM3-MCK-2 page height and bottom tab bar — mockup: 1573px with tab bar; built: 900px without
DESIGN-VERDICT: SWHM3-MCK-3 differs — 6.7% pixels differ; shell matches, sample title and extra rail entries differ
- RESIDUAL: SWHM3-MCK-3 page title and rail entries — mockup: sample "Page title" and a longer rail; built: Localization page and a three-entry rail
DESIGN-VERDICT: SWHM3-MCK-4 differs — 9.8% pixels differ; shell matches, sample content and page height differ
- RESIDUAL: SWHM3-MCK-4 footer position — mockup: y=803 above a tab bar; built: y=867
DESIGN-VERDICT: SWHM3-MCK-5 differs — 4.2% pixels differ; only the mockup's sample page ("Your cart is empty") differs from the built page
- RESIDUAL: SWHM3-MCK-5 page title and wording — mockup: cart sample; built: "No orders yet" on /admin/orders
DESIGN-VERDICT: SWHM3-MCK-6 differs — 9.5% pixels differ; same sample-content cause
- RESIDUAL: SWHM3-MCK-6 footer position — mockup: y=803; built: y=867
DESIGN-VERDICT: SWHM3-MCK-7 differs — 3.4% pixels differ; error frame about 75px higher, no breadcrumb or request reference
- RESIDUAL: SWHM3-MCK-7 breadcrumb and "Reference req_…" — mockup: shown; built: omitted (the locked spec reads the first navigation landmark; no request id exists yet)
DESIGN-VERDICT: SWHM3-MCK-8 differs — 11.6% pixels differ; same causes as MCK-7
- RESIDUAL: SWHM3-MCK-8 breadcrumb, reference and footer position — mockup: shown, y=803; built: omitted, y=867

The `design-conformance` decision is off for this project (`disabled: true`), so no outcome was proposed.

## Issues Found
None. See `artifacts/SWHM3-S-0001/integration-defects-resolution.md` (empty summary table, COMPLETE). The first design measurement ran against a standalone server started without `.next/static`, which rendered no rail; the Dockerfile copies it, so this was a test-setup error, not an app defect, and the measurement was re-run correctly.

## Recommendation
Proceed: fire `validation.all_acs_passed`. Every scenario passes, the project E2E suite is green with no skips, and no defect was filed.
