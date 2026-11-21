---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHM3-S-0002
capability brief: SWHM3-I-0002
branch: vortex/sprint/swhm3-s-0002-1b2d57c5
upstream: [artifacts/SWHM3-S-0002/SPRINT-PLAN.md, artifacts/SWHM3-S-0002/qa-test-report.md]
---

# Sprint summary — SWHM3-S-0002

Goal: "SWHM3-I-0002: Localization". **Met.** 27 of 28 localization scenarios pass on the integrated
sprint branch; the 28th (Mailer does not localize) is not testable because no mailer exists yet
(design.md SD6). No defects were found.

## Tickets

| Ticket | Type | Title | Outcome |
| --- | --- | --- | --- |
| SWHM3-T-0006 | TASK | Sprint plan — SWHM3-S-0002 | DONE (change `swhm3-i-0002-localization`, PLAN.md, mockup export, ARCHITECTURE.md and DESIGN.md updates) |
| SWHM3-T-0007 | FEATURE | Localization: shopper language, locale-aware formatting and per-locale catalog text | DONE — see `SWHM3-T-0007/summary.md` |
| SWHM3-T-0008 | TASK | Integration QA report — SWHM3-S-0002 | DONE — PASS |
| SWHM3-T-0009 | TASK | Sprint close bundle — SWHM3-S-0002 | this file |

## What shipped

- One locale module, `src/lib/localization/`: supported locales (en_US default, ja_JP, zh_CN), code
  parsing, per-request locale (`?locale=` beats the session, else en_US), message catalogs with an
  en_US fallback, and locale-aware currency, number and keyword splitting.
- Language page `/locale` (four choices, German marked "Not yet translated — shown in US English")
  and confirmation page `/locale/changed` with the currency note and "Back to the page you were on".
- `POST /api/locale` (shared `changeLocale`; a bad code is refused and the locale is unchanged),
  `GET /api/session`, `GET /locale-link`, and `GET /api/locales` with four entries.
- Database sessions (`sessions` table, `sid` cookie) and an `audit_log` row for every locale change.
- Per-locale catalog tables (category, product, item and their `*_details` rows; one row per locale,
  name required) in migration `drizzle/0001_lyrical_gertrude_yorkes.sql`.
- `src/proxy.ts`: request id, Origin check on data-changing requests, `PUBLIC_PATHS` list.
- Shell: rail grouped (Shop / Account / Admin) with a **Language** entry, header language control,
  landing page and footer from messages, `<html lang>` set to the current language.
- `src/lib/shopping-cart.ts` with the cart's locale, ready for the shopping-cart capability.

## Divergence from plan

- The old `/localization` area page and its `LocalesList` were removed; the language page replaces it.
- The Admin group is visible to everyone: roles arrive with SWHM3-I-0004 (design.md SD10). QA
  recorded this as a SPEC-GAP: no scenario covers Admin visibility.
- `PUBLIC_PATHS` is declared but not enforced; deny-by-default arrives with sign-in (SWHM3-I-0004).
- No mailer code (design.md SD6), so "Mail sent" is not testable this sprint.
- Theme token `typography.h1` changed to 24px/600 to match the mockups, as DESIGN.md already states.

## Verification

**PASS.** See `qa-test-report.md`: build, lint, format, typecheck and version check green; unit
16 suites / 51 tests; E2E 12/12; localization acceptance jest 24/24 and acceptance e2e C-0006, C-0007,
C-0011 pass. Coverage 93.22% lines, 79.19% branches. Four mockups measured: two match, the two
mobile screens differ only in shell header/rail sizing and unbuilt entries (residuals listed there).
Acceptance specs of unbuilt capabilities fail as expected.

## Defects Raised

None. `a2a_list_tickets(created_since=sprint start)` shows no DEFECT ticket.

## Retrospective

- Went well: one FEATURE carried the whole change, including the shell, database and proxy work,
  and passed QA first time with no rework.
- Went well: planning's design.md decisions (SD6, SD10) named the out-of-scope residuals up front,
  so QA recorded them instead of filing defects.
- Could improve: the implementer could not run `design-measure.mjs` and used a manual probe, while
  QA ran it successfully. The measurement recipe should be available to both roles.
- Could improve: the implementer's code review was a self-review (sub-agent skipped for cost) on a
  large change that adds a proxy, sessions and an Origin check.
- Could improve: Admin visibility and `PUBLIC_PATHS` enforcement are deferred to SWHM3-I-0004; that
  sprint must pick both up explicitly.
- Could improve: A11Y-001 is still a structural check only; improvement task SWHM3-T-0005 remains
  in the backlog.

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Work planned before build | OpenSpec change, PLAN.md | `openspec/changes/swhm3-i-0002-localization/`, `artifacts/SWHM3-S-0002/SWHM3-T-0007/PLAN.md` | Satisfied | — |
| Change verified before release | QA report, PASS | `artifacts/SWHM3-S-0002/qa-test-report.md` | Satisfied | — |
| Tests executed | TDD result, E2E table | `artifacts/SWHM3-S-0002/SWHM3-T-0007/tdd-test-result.md`, `artifacts/SWHM3-S-0002/integration-test-result.md` | Satisfied | — |
| Defects dispositioned | 0 found | `artifacts/SWHM3-S-0002/integration-defects-resolution.md` | Satisfied | — |
| Design conformance recorded | design-check + QA measurements | `artifacts/SWHM3-S-0002/SWHM3-T-0007/design-check.md`, `artifacts/SWHM3-S-0002/qa/design/` | Satisfied | Residuals are unbuilt scope (design.md SD10) |
| Schema change versioned (DATA-102) | generated migration | `drizzle/0001_lyrical_gertrude_yorkes.sql` | Satisfied | — |
| Data changes audited (ACC-003) | `audit_log` row per locale change | `src/lib/localization/` | Satisfied | — |
| Sign-in on entry points (ACC-001) | `PUBLIC_PATHS` declared | `src/proxy.ts` | Partial | Not enforced until SWHM3-I-0004 |
| Accessibility (A11Y-001) proved by test | structural Playwright checks incl. /locale | `e2e/accessibility.spec.ts` | Partial | No automated WCAG engine; SWHM3-T-0005 |
