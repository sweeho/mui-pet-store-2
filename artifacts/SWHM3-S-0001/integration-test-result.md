---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM3-S-0001
capability brief: SWHM3-I-0001
branch: vortex/sprint/swhm3-s-0001-b0a33f43
downstream: [artifacts/SWHM3-S-0001/qa-test-report.md]
---

# Integration test result — SWHM3-S-0001

## Commands run
```
$ npm ci
$ npm run build            # exit 0
$ npx playwright test --list   # one project: chromium, 11 tests in 3 files
$ npm run test:e2e         # playwright test (project chromium)
```

## Results
| Spec | Result | Notes |
| --- | --- | --- |
| `e2e/accessibility.spec.ts` (4 tests: landing page, empty, error, loading frames) | pass | WCAG 2.2 AA check |
| `e2e/home.spec.ts` (4 tests: SWHM3-C-0163, -0164, -0165, menu button at small width) | pass | — |
| `e2e/smoke.spec.ts` (3 tests) | pass | — |

Playwright summary: `11 passed (6.4s)`

No spec file was skipped.

E2E-RESULT: chromium 11 passed, 0 failed, 0 skipped
