---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHM3-S-0003
capability brief: SWHM3-I-0003
branch: vortex/sprint/swhm3-s-0003-cf97ddf6
upstream: [artifacts/SWHM3-S-0003/SPRINT-PLAN.md, artifacts/SWHM3-S-0003/qa-test-report.md]
---

# Sprint summary — SWHM3-S-0003

Goal: "SWHM3-I-0003: Catalog browsing and search". **Met.** 19 of 21 scenarios pass on the
integrated sprint branch. The other 2 are not testable as written, because they describe a legacy
mechanism the rebuild does not have (design.md SD1). QA found one defect, a flaky unit test outside
this change. It was left open as SWHM3-T-0013 (see Known Issues).

## Tickets

| Ticket | Type | Title | Outcome |
| --- | --- | --- | --- |
| SWHM3-T-0010 | TASK | Sprint plan — SWHM3-S-0003 | DONE (design.md planning context, PLAN.md, 12 mockups exported, ARCHITECTURE.md and DESIGN.md) |
| SWHM3-T-0011 | FEATURE | Catalog browsing and search | DONE — see `SWHM3-T-0011/summary.md` |
| SWHM3-T-0012 | TASK | Integration QA report — SWHM3-S-0003 | DONE — PASS, one out-of-scope defect escalated |
| SWHM3-T-0013 | DEFECT | Flaky: users route test fails with SQLITE_BUSY | BACKLOG (future sprint) |
| SWHM3-T-0014 | TASK | Sprint close bundle — SWHM3-S-0003 | this file |

## What shipped

- `src/lib/catalog-browsing.ts`: the one catalog module.
  - `createCatalog` provides locale-filtered lists, item detail, ownership and keyword search.
  - Lists are sorted by name, then id. Pages hold two entries by default, at most 50, and report next/previous.
  - An unknown id returns `null`, and a data-access failure surfaces as `CatalogSystemError`.
  - It also provides the legacy contract functions `resolveScreen`, `createFrontController`,
    `createFragmentCache` and `runCatalogCheck`, which no page uses.
- Migration `drizzle/0002_yielding_squadron_supreme.sql` adds name and foreign-key indexes. The
  sample catalog (five categories, en_US, ja_JP and zh_CN, one item priced below cost) is seeded
  on first use.
- Pages under `/catalog`:
  - the category, product and item lists, item detail, and search results;
  - breadcrumbs rooted at Catalog, and a pager with a range and Previous/Next;
  - the shared empty frame for a blank search, no matches, paging past the end and unknown ids.
- Shell: **Catalog** and **Search** in the rail's Shop group, a header search box on every page, and
  `/catalog` on the public list. The new text is in all three languages.
- The JetBrains Mono font is added for the codes and prices the mockups show in monospace.

## Divergence from plan

- The pager shows a disabled Previous or Next rather than hiding it, as the mockups do. The brief
  and the planning edit of DESIGN.md said "hidden". DESIGN.md was corrected at close.
- The header search is a plain form using `withBasePath`, not `next/form`. The behaviour is the same.
- Item detail has no **Add to cart** yet. The brief assigns it to the shopping-cart capability.
- The R-0043, R-0044 and R-0049 functions (front controller, screen resolution, fragment cache) have
  no `tasks.md` line, so their coverage shows as untraced (design.md SD2).

## Verification

**PASS.** See `qa-test-report.md` for the full results:

- Project E2E: 17/17.
- Unit tests: 81/81 on two of three runs. One coverage run failed an unrelated test with `SQLITE_BUSY`.
- Locked acceptance suites for catalog browsing, localization and site shell: 43/43.
- Lint, format and typecheck: green.
- Design: all 12 mockups measured. Ten match. The two item detail mockups differ because
  **Add to cart** is not built and the mobile layout sits lower.
- Locked suites of later capabilities fail, as expected before those capabilities exist.

## Defects Raised

- SWHM3-T-0013 (DEFECT, minor): flaky `src/app/api/users/route.test.ts` with `SQLITE_BUSY`.

## Known Issues

- SWHM3-T-0013: the users route unit test sometimes fails with `SQLITE_BUSY: database is locked`
  when the suite runs in parallel. It is unrelated to the catalog and is open for a future sprint.

## Retrospective

- Went well: the locked acceptance file was read during planning and its contract was written into
  PLAN.md. The FEATURE then passed QA with no rework on catalog behaviour.
- Went well: QA measured the pages against all 12 mockups. Ten match, with about 3% of pixels
  differing on desktop, almost all of it from the rail and header entries of later capabilities.
- Could improve: planning wrote a pager rule into DESIGN.md that contradicted the approved mockups.
  Root-doc rules on interaction should be checked against the mockup before they are committed.
- Could improve: "External SQL statements and error reporting" had no test case, so the
  failing-database path is not exercised by any test.
- Could improve: the shared SQLite test file is unreliable under parallel workers (SWHM3-T-0013).
- Could improve: the mobile item detail offset (45–75px) was not traced to a cause.
- Open product question: search matches a category's code, not its translated name (brief Q3).

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Work planned before build | OpenSpec change, PLAN.md | `openspec/changes/swhm3-i-0003-catalog-browsing-and-search/`, `artifacts/SWHM3-S-0003/SWHM3-T-0011/PLAN.md` | Satisfied | — |
| Change verified before release | QA report, PASS | `artifacts/SWHM3-S-0003/qa-test-report.md` | Satisfied | 2 scenarios not testable (SD1) |
| Tests executed | TDD result, E2E table | `artifacts/SWHM3-S-0003/SWHM3-T-0011/tdd-test-result.md`, `artifacts/SWHM3-S-0003/integration-test-result.md` | Satisfied | — |
| Defects dispositioned | 1 escalated to backlog | `artifacts/SWHM3-S-0003/integration-defects-resolution.md` | Partial | SWHM3-T-0013 open |
| Design conformance recorded | design-check + QA measurements | `artifacts/SWHM3-S-0003/SWHM3-T-0011/design-check.md`, `artifacts/SWHM3-S-0003/qa/design/` | Satisfied | Add to cart and later shell entries |
| Schema change versioned (DATA-102) | generated migration | `drizzle/0002_yielding_squadron_supreme.sql` | Satisfied | — |
| List paging bounded (API-104) | size ≤ 50, start capped | `src/lib/catalog-browsing.ts` | Satisfied | — |
| Accessibility (A11Y-001) proved by test | structural checks incl. catalog pages | `e2e/accessibility.spec.ts` | Partial | No automated WCAG engine; SWHM3-T-0005 |
| Dependency licence (CMP-001) | `@fontsource-variable/jetbrains-mono` (OFL-1.1) | `package.json` | Satisfied | — |
