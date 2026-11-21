---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM3-S-0002
capability brief: SWHM3-I-0002
branch: vortex/sprint/swhm3-s-0002-1b2d57c5
upstream: [artifacts/SWHM3-S-0002/SPRINT-PLAN.md]
downstream: [artifacts/SWHM3-S-0002/sprint-summary.md]
---

# Integration test result — SWHM3-S-0002

Command (on the integrated sprint branch, after `npm ci` and `npm run build`, both exit 0):
`npm run test:e2e -- --project=chromium` (Playwright, `next dev` on :3100). Exit code 0.

Run summary: `12 passed (7.9s)`

| Spec | Tests | Result |
| --- | --- | --- |
| e2e/accessibility.spec.ts | 4 (language page and confirmation, error frame, others) | pass |
| e2e/home.spec.ts | 4 (C-0163, C-0164, C-0165, small-screen rail) | pass |
| e2e/smoke.spec.ts | 4 (home, API, database route, others) | pass |

No spec file was wholly skipped; skipped count is 0.

## Acceptance suite (warning only, enforced at release UAT)

`npm run test:acceptance:e2e`: `25 failed`, `8 passed` (4.6m). Passing: localization C-0006, C-0007, C-0011 and site-shell C-0163 to C-0167. All 25 failures are in other capabilities not built in this sprint (checkout-order-placement, customer-accounts, order-administration, order-approval, shopping-cart, supplier-fulfillment). `npm run test:acceptance` (jest): 9 suites fail to resolve modules of unbuilt capabilities; localization suite 24 of 24 tests pass (run alone).

E2E-RESULT: chromium 12 passed, 0 failed, 0 skipped
