---
artifact: integration-defects-resolution
spec: 1
status: escalated
author_role: validation
sprint: SWHM3-S-0003
capability brief: SWHM3-I-0003
branch: vortex/sprint/swhm3-s-0003-cf97ddf6
upstream: [artifacts/SWHM3-S-0003/integration-test-result.md]
downstream: [artifacts/SWHM3-S-0003/qa-test-report.md]
---

# Integration defects & resolutions — SWHM3-S-0003

## DEFECT-1: users route unit test fails once with SQLITE_BUSY under coverage run
- **Severity:** minor
- **Detected by:** unit/integration tests
- **Symptom:** `npm test -- --coverage`: `FAIL src/app/api/users/route.test.ts` — `GET /api/users › lists the seeded users`, `LibsqlError: SQLITE_BUSY: database is locked` (1 failed, 80 passed). Two isolated re-runs of the file and a second full `npm test` passed (81/81).
- **Root cause:** not diagnosed. The result differs across identical runs, so it is a flake (shared SQLite test file, parallel workers). The file is not part of this sprint's change.
- **Fix rounds:** none attempted; disagreement across runs is the finding, further runs cannot settle it.
- **Resolution:** UNFIXABLE (flaky, outside sprint scope) → DEFECT ticket SWHM3-T-0013
- **Validation evidence:** failing run `/tmp/unit.log` (coverage run); passing: `npx jest src/app/api/users/route.test.ts` ×2 `Tests: 1 passed`, `npm test` `Tests: 81 passed, 81 total`.

## Summary
| Defect | Severity | Resolution |
| --- | --- | --- |
| DEFECT-1 | minor | SWHM3-T-0013 (future sprint) |

INTEGRATION_DEFECTS_RESOLUTION: ESCALATED
