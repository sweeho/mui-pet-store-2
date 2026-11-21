---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM3-S-0002
capability brief: SWHM3-I-0002
branch: vortex/sprint/swhm3-s-0002-1b2d57c5
upstream: [artifacts/SWHM3-S-0002/SPRINT-PLAN.md]
downstream: [artifacts/SWHM3-S-0002/sprint-summary.md]
---

# QA test report — SWHM3-S-0002

## Executive Summary

Verdict: pass. The localization sprint (SWHM3-I-0002, ticket SWHM3-T-0007) was verified on the integrated sprint branch. `npm ci`, `npm run build`, lint, format check, typecheck, version check, unit tests (16 suites, 51 tests) and the project E2E (12 tests) all passed. No defects were found. Of 28 spec scenarios, 27 pass and 1 is not testable (no mailer exists in this repository, design.md SD6).

## E2E Test Status

`npm run test:e2e -- --project=chromium`: `12 passed (7.9s)`, 0 failed, 0 skipped. Details in `integration-test-result.md`.

Warning (acceptance tests are enforced only at release UAT, not fixed here): `npm run test:acceptance:e2e` gave 8 passed, 25 failed. The 8 passing are localization C-0006/7/11 and site-shell C-0163 to C-0167. The 25 failures are all in capabilities not built yet: checkout-order-placement, customer-accounts, order-administration, order-approval, shopping-cart, supplier-fulfillment. `npm run test:acceptance` (jest) fails 9 suites on missing modules of those capabilities; the localization suite passes 24 of 24 tests.

## Unit Test Results

`npm test -- --coverage`, exit 0: `Test Suites: 16 passed, 16 total`, `Tests: 51 passed, 51 total`. Also exit 0: `npm run lint`, `npm run format:check`, `npm run typecheck`, `node .vortex/check-versions.mjs`.

SCENARIO-VERDICT: Supported locales and default / Default locale — pass
SCENARIO-VERDICT: Locale formatting of currency and numbers / Currency with precision — pass
SCENARIO-VERDICT: Locale formatting of currency and numbers / Keyword splitting — pass
SCENARIO-VERDICT: Catalog locale resolution / Valid locale text — pass
SCENARIO-VERDICT: Catalog locale resolution / Text without underscore — pass
SCENARIO-VERDICT: Locale formatting with fraction digits / Number formatting — pass
SCENARIO-VERDICT: Detail record required fields / Missing name — pass
SCENARIO-VERDICT: Detail record required fields / Optional fields omitted — pass
SCENARIO-VERDICT: Locale selection form / Form displayed — pass
SCENARIO-VERDICT: Locale selection form / Choice submitted — pass
SCENARIO-VERDICT: Locale recorded after change / Successful change — pass
SCENARIO-VERDICT: Error screen routing / Mapped error — pass
SCENARIO-VERDICT: Error screen routing / Unmapped error — pass
SCENARIO-VERDICT: Client-state locale-change links / Link restores page state — pass
SCENARIO-VERDICT: Screen rendering by name / Known screen — pass
SCENARIO-VERDICT: Screen rendering by name / Unknown screen — pass
SCENARIO-VERDICT: Order locale string interpretation / Stored order locale — pass
SCENARIO-VERDICT: Per-locale catalog text / Duplicate locale row — pass
SCENARIO-VERDICT: Change session locale / Valid code — pass
SCENARIO-VERDICT: Change session locale / Invalid code — pass
SCENARIO-VERDICT: Locale code parsing / Default keyword — pass
SCENARIO-VERDICT: Locale code parsing / Invalid code — pass
SCENARIO-VERDICT: Screen locale selection and fallback / Parameter wins — pass
SCENARIO-VERDICT: Screen locale selection and fallback / Unsupported locale — pass
SCENARIO-VERDICT: Mailer does not localize / Mail sent — not-testable: no mailer code exists in this repository (design.md SD6)
SCENARIO-VERDICT: Cart locale / Default cart locale — pass
SCENARIO-VERDICT: Request character encoding / Japanese input — pass
SCENARIO-VERDICT: Default session locale / First visit — pass

Basis: the keyed unit tests of SWHM3-T-0007 (cases C-0001 to C-0027, all in the passing run above) plus the localization acceptance jest suite (24 of 24 pass) and the acceptance e2e specs C-0006, C-0007, C-0011.

## Code Review

No notable concerns observed. One incidental note: the `Admin` group (Order administration) in the rail is visible to every visitor, while the brief says it is hidden from non-administrators. This is a documented deviation (design.md SD10): roles arrive with authentication in SWHM3-I-0004.

## Coverage Summary

`npm test -- --coverage` (Jest/istanbul), all files: statements 91.65%, branches 79.19%, functions 89.28%, lines 93.22%. No earlier baseline was available to compare, so a regression cannot be stated either way.

## Design fidelity

Measured with the skill's `design-measure.mjs` against the production build (standalone server with `.next/static` copied), output in `artifacts/SWHM3-S-0002/qa/design/`. The states reached were en_US current on `/locale` and `/locale/changed?from=/`; the error state (`?error=invalid`) was not compared.

DESIGN-VERDICT: SWHM3-MCK-13 match — heading, copy, four choices and the button agree; only listed residuals differ
- RESIDUAL: SWHM3-MCK-13 rail Catalog/Search/Cart/Profile, header search, Cart, Sign in — mockup: shown; built: absent (later capabilities, SD10)
- RESIDUAL: SWHM3-MCK-13 rail Admin group — mockup: absent; built: shown to everyone (SD10, roles not built)
- RESIDUAL: SWHM3-MCK-13 German row note — mockup: one text line; built: split into "German" and "· Not yet translated — shown in US English" elements, same words
DESIGN-VERDICT: SWHM3-MCK-14 differs — mobile rail and header rendered by the shell differ from the mockup in size and layout
- RESIDUAL: SWHM3-MCK-14 header and rail drawer — mockup: "Open menu" button, brand and "Language: English (US)" control; built: "Open the menu" button, rail folded, no Sign in or search
- RESIDUAL: SWHM3-MCK-14 page heading — mockup: measured differently per the script's matching; built: 24px/600 per the approved theme token
DESIGN-VERDICT: SWHM3-MCK-15 match — confirmation text, summary rows, currency note and both buttons present with the same copy
- RESIDUAL: SWHM3-MCK-15 rail and header — mockup: Catalog/Search/Cart/Profile, search, Sign in, "Catalog › Fish" breadcrumb; built: absent (SD10)
- RESIDUAL: SWHM3-MCK-15 "Choose a different language" button — mockup: dark text; built: primary-colour text
- RESIDUAL: SWHM3-MCK-15 success badge — mockup: green at 12% alpha; built: solid green
DESIGN-VERDICT: SWHM3-MCK-16 differs — mobile confirmation matches in copy; header, rail and button width differ
- RESIDUAL: SWHM3-MCK-16 "Choose a different language" — mockup: 324x44 full width; built: 216x37
- RESIDUAL: SWHM3-MCK-16 header and rail — mockup: Open menu, brand, language control, Sign in; built: "Open the menu" and no Sign in (SD10)
- RESIDUAL: SWHM3-MCK-16 content block — mockup: starts at y=73; built: y=87 (header height 14px taller)

## Issues Found

None. No defects, no future-sprint DEFECT tickets. See `integration-defects-resolution.md`. Residual design differences above are recorded, not defects.

SPEC-GAP: Admin group visibility to non-administrators — no scenario covers this behaviour

## Recommendation

Proceed: fire `validation.all_acs_passed`. Scenario verdicts (27 pass, 1 not-testable with reason) and the project E2E (12 passed, 0 failed, 0 skipped) support it. Acceptance failures in unbuilt capabilities are warnings for release UAT.
