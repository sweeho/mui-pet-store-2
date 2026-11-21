---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHM3-S-0001
capability brief: SWHM3-I-0001
branch: vortex/sprint/swhm3-s-0001-b0a33f43
upstream: [artifacts/SWHM3-S-0001/SPRINT-PLAN.md, artifacts/SWHM3-S-0001/qa-test-report.md]
---

# Sprint summary — SWHM3-S-0001

Goal: "SWHM3-I-0001: Bootstrap, landing page and shared site shell". **Met.** All five site-shell
scenarios pass on the integrated sprint branch; no defects were found.

## Tickets

| Ticket | Type | Title | Outcome |
| --- | --- | --- | --- |
| SWHM3-T-0001 | TASK | Sprint plan — SWHM3-S-0001 | DONE (change `swhm3-i-0001-bootstrap-landing-page-and`, PLAN.md, mockup export, root docs) |
| SWHM3-T-0002 | FEATURE | Bootstrap, landing page and shared site shell | DONE — see `SWHM3-T-0002/summary.md` |
| SWHM3-T-0003 | TASK | Integration QA report — SWHM3-S-0001 | DONE — PASS |
| SWHM3-T-0004 | TASK | Sprint close bundle — SWHM3-S-0001 | this file |

## What shipped

- Design Reference look: indigo brand, Inter typeface, radius 4, 240px rail (`design/tokens.mui.json`).
- Landing page at `/`, its area cards generated from the rail's `MENU_ITEMS`.
- One navigation rail (Home, Localization, Order administration), store name links home, current
  area highlighted; folds behind the menu button below `lg`.
- Shared header and new footer on every page, including a 404 inside the shell.
- Shared `EmptyState`, `ErrorState` (with **Try again**) and `LoadingState` frames, plus
  `ResourceView` and route-level `error.tsx` / `loading.tsx`.
- Two area pages that exercise the frames: `/localization` (reads the new `GET /api/locales`) and
  `/admin/orders` (empty frame).

## Divergence from plan

- The rail and landing page carry two areas, not the mockups' Shop/Admin set (catalog, cart,
  sign-in, language selector). Planned: design.md P6 and SD2 — later capabilities add their entries.
- The error frame omits the mockups' breadcrumb and request reference: the locked spec requires the
  rail to be the first `navigation` landmark, and no request id exists yet.
- `(DashboardLayout)/not-found.tsx` was added outside the ownership map so a 404 renders inside the shell.
- `AGENTS.md` gained a block written by `next dev` (Next.js agent rules), not by an agent edit.

## Verification

**PASS.** See `qa-test-report.md`: build and verify green, E2E 11/11, locked site-shell acceptance
spec 5/5, proving test 1/1. Eight mockups measured; every difference is unbuilt scope (residuals
listed there). `integration-defects-resolution.md` is empty. Other capabilities' locked acceptance
specs fail as expected because those capabilities are not built yet.

## Defects Raised

None. `a2a_list_tickets(type="defect", created_since=sprint start)` returned no tickets.

## Retrospective

- Went well: one FEATURE carried the whole change; QA passed first time with no defect and no rework.
- Went well: design.md P6/SD2 settled the mockup-vs-spec scope gap during planning, so the
  implementer and QA read the same residuals instead of disputing them.
- Could improve: A11Y-001 is checked only structurally (landmarks, one h1, accessible names); no
  automated WCAG engine runs. Raised as improvement task (see sprint thread).
- Could improve: QA's first design measurement ran a standalone server without `.next/static` and
  rendered no rail; a documented measurement recipe would avoid the rerun.
- Could improve: `next dev` rewrites the human-authored `AGENTS.md`; that should be prevented or
  reviewed rather than ride along in a feature commit.

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Work planned before build | OpenSpec change, PLAN.md | `openspec/changes/swhm3-i-0001-bootstrap-landing-page-and/`, `artifacts/SWHM3-S-0001/SWHM3-T-0002/PLAN.md` | Satisfied | — |
| Change verified before release | QA report, PASS | `artifacts/SWHM3-S-0001/qa-test-report.md` | Satisfied | — |
| Tests executed | TDD result, E2E table | `artifacts/SWHM3-S-0001/SWHM3-T-0002/tdd-test-result.md`, `artifacts/SWHM3-S-0001/integration-test-result.md` | Satisfied | — |
| Defects dispositioned | 0 found | `artifacts/SWHM3-S-0001/integration-defects-resolution.md` | Satisfied | — |
| Design conformance recorded | design-check + QA measurements | `artifacts/SWHM3-S-0001/SWHM3-T-0002/design-check.md`, `artifacts/SWHM3-S-0001/qa/design/` | Satisfied | Residuals are unbuilt scope (design.md P6, SD2) |
| Accessibility (A11Y-001) proved by test | structural Playwright checks | `e2e/accessibility.spec.ts` | Partial | No automated WCAG engine; improvement task raised |
| Dependency licence (CMP-001) | one new dependency, OFL-1.1 | `artifacts/SWHM3-S-0001/SWHM3-T-0002/summary.md` | Satisfied | — |
