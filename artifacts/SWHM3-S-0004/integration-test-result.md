---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM3-S-0004
capability brief: SWHM3-I-0004
branch: vortex/sprint/swhm3-s-0004-5fae6595
downstream: [artifacts/SWHM3-S-0004/qa-test-report.md]
---

# Integration test result — SWHM3-S-0004

## Commands run

```
npm ci && npm run build            # both exit 0
npm run test:e2e                   # playwright test, project chromium (24 tests in 5 files, confirmed with `npx playwright test --list`)
```

Playwright summary, verbatim: `24 passed (34.3s)`

## Results

| Spec | Result | Notes |
| --- | --- | --- |
| e2e/accessibility.spec.ts | 6 passed, 0 skipped | landing, language, catalog, account pages, empty/error/loading frames |
| e2e/accounts.spec.ts | 6 passed, 0 skipped | SWHM3-C-0150/0139 sign-up and duplicate, 0141/0151/0152/0153/0161 protected page and return, 0160 wrong password, 0140/0156 remember cookie, 0155/0154 blank postal code then save, 0129 sign-off |
| e2e/catalog.spec.ts | 4 passed, 0 skipped | earlier sprint, no regression |
| e2e/home.spec.ts | 4 passed, 0 skipped | 0163, 0164, 0165, small-screen rail |
| e2e/smoke.spec.ts | 3 passed, 0 skipped | home, API, database route |

No spec file ran none of its tests.

## Locked acceptance suite (warnings only, enforced at release UAT)

`npm run test:acceptance:e2e` printed `17 failed`, `16 passed (3.1m)`. Failing cases: SWHM3-C-0033, 0068, 0069, 0097, 0098, 0102, 0103, 0106, 0107, 0129, 0164, 0165, 0188, 0199, 0213, 0214, 0279. All except 0129, 0164 and 0165 belong to later capabilities (checkout, order administration, approval, cart, supplier fulfilment) whose pages do not exist yet. 0129 (customer-accounts sign-off) timed out on a click at 30 s; 0164/0165 (site-shell) failed in 350-557 ms and the run logged `GET /api/locales answered 500`. They are not fixed here, per the UAT-only rule, and are the owner's to triage at UAT. The project's own e2e spec for sign-off (SWHM3-C-0129 in e2e/accounts.spec.ts) passes.

E2E-RESULT: chromium 24 passed, 0 failed, 0 skipped
