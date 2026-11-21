---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM3-S-0003
capability brief: SWHM3-I-0003
branch: vortex/sprint/swhm3-s-0003-cf97ddf6
downstream: [artifacts/SWHM3-S-0003/qa-test-report.md]
---

# Integration test result — SWHM3-S-0003

## Commands run
```
$ npm ci                                   # exit 0
$ npm run build                            # exit 0 (next build, standalone)
$ npx playwright test --list               # 17 tests in 4 files, all in project chromium (the only project)
$ npx playwright test --project=chromium   # exit 0
```

## Results
Playwright summary: `17 passed (13.1s)`

| Spec | Result | Notes |
| --- | --- | --- |
| `e2e/catalog.spec.ts` (4 tests) | pass | browse with paging, header search (match / no match / blank), unknown item empty frame, 320 px reflow |
| `e2e/accessibility.spec.ts` (3 tests incl. catalog pages, language page) | pass | axe checks |
| `e2e/home.spec.ts` (5 tests) | pass | landing, rail, missing page, small-screen menu |
| `e2e/smoke.spec.ts` (3 tests) | pass | home, API, database route |

No spec file was skipped; no test skipped.

E2E-RESULT: chromium 17 passed, 0 failed, 0 skipped
