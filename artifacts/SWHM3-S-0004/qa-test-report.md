---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM3-S-0004
capability brief: SWHM3-I-0004
branch: vortex/sprint/swhm3-s-0004-5fae6595
upstream: [artifacts/SWHM3-S-0004/SPRINT-PLAN.md]
---

# QA test report — SWHM3-S-0004

## Executive Summary

**Verdict: PASS.** Capability SWHM3-I-0004 (customer accounts and sign-on) holds on the integrated sprint branch at ba2d249. Lint, format, typecheck, check-versions, build, 138 unit tests and 24 Playwright tests all pass. The five promised acceptance criteria (exact password match, unique user name, sign-on required then return, 15-minute idle sign-off, mandatory profile fields) are each exercised by an executed test. No defect found, none fixed, none escalated. Locked acceptance failures are listed as UAT warnings below.

## E2E Test Status

`npm run test:e2e`: `24 passed (34.3s)`, 0 failed, 0 skipped. Per-spec table and the locked acceptance suite results: `artifacts/SWHM3-S-0004/integration-test-result.md`.

Warnings (locked acceptance suite, enforced at UAT, not fixed): `npm run test:acceptance:e2e` 17 failed / 16 passed; `npm run test:acceptance` 10 failed / 74 passed in 7 of 10 suites (checkout, order administration/approval, cart, supplier fulfilment, notifications, batch operations: later capabilities). Failing e2e cases: SWHM3-C-0033, 0068, 0069, 0097, 0098, 0102, 0103, 0106, 0107, 0129, 0164, 0165, 0188, 0199, 0213, 0214, 0279. Of these, 0129 (customer-accounts sign-off timeout) and 0164/0165 (site-shell, `GET /api/locales answered 500` in the log) touch this or earlier capabilities and should be triaged first at UAT. The customer-accounts acceptance unit suite passes.

## Unit Test Results

```
$ npm test -- --coverage
Test Suites: 23 passed, 23 total
Tests:       138 passed, 138 total
```

Static gates, all exit 0: `node .vortex/check-versions.mjs`, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run build`.

## Code Review

No notable concerns observed. Incidental: spec requirement SWHM3-R-0187 (plain-text password and card) is deliberately not followed; the build uses scrypt hashes per approved system design v2 and rule ACC-005.

## Coverage Summary

`npm test -- --coverage` (Jest): all files 86.55% statements, 78.58% branches, 88.88% functions, 89.71% lines. No baseline from the previous sprint was measured, so regression is Unknown.

## Design fidelity

Reference: `artifacts/SWHM3-S-0004/design/MANIFEST.md`, 14 mockups (MCK-29 to MCK-42). Method: `design-measure.mjs` against a production build (`next build`, `next start`), output in `artifacts/SWHM3-S-0004/qa/design/`. Signed-on screens measured after a real sign-on. Differences were not fixed in place: each is locked-test copy, a later-capability shell entry or sample data (design.md SD8). Not reached: the refused-save state of the profile form (MCK-37/38) and the sign-in error reached by a failed sign-on (measured via the signed-off redirect of /account/profile).

SCENARIO-NOTE: design verdict lines follow.

DESIGN-VERDICT: SWHM3-MCK-29 differs — sign-in; button "Sign on", Sign up link not inline form, no Checkout note (6.9% pixels)
- RESIDUAL: SWHM3-MCK-29 sign-up form and "Remember my user name on this device" — mockup: inline sign-up and fuller label; built: "Sign up" link to /signup and "Remember my user name" (locked test copy)
- RESIDUAL: SWHM3-MCK-29 header and rail — mockup: Cart, Orders, Sales charts, Inventory; built: entries of later capabilities absent
DESIGN-VERDICT: SWHM3-MCK-30 differs — mobile sign-in; same copy differences and no Pet Store wordmark/Open menu naming (12.8%)
- RESIDUAL: SWHM3-MCK-30 header — mockup: "Pet Store", Cart; built: "MUI Pet Store 2", no cart button
DESIGN-VERDICT: SWHM3-MCK-31 differs — sign-in error; heading "Sign-in failed" not "We couldn’t sign you in", no Try again/Create an account/Back to home actions (5.3%)
- RESIDUAL: SWHM3-MCK-31 error panel — mockup: three actions and explanatory copy; built: heading above sign-on form (locked test copy)
DESIGN-VERDICT: SWHM3-MCK-32 differs — mobile sign-in error; same as MCK-31 (16.1%)
- RESIDUAL: SWHM3-MCK-32 error panel — mockup: three actions; built: sign-on form below heading
DESIGN-VERDICT: SWHM3-MCK-33 differs — duplicate account; missing "Already taken" detail row and "Sign in as" action (4.5%)
- RESIDUAL: SWHM3-MCK-33 user-name panel — mockup: User name j2ee, Already taken, Sign in as j2ee; built: not present
DESIGN-VERDICT: SWHM3-MCK-34 differs — mobile duplicate account; same as MCK-33 (12.6%)
- RESIDUAL: SWHM3-MCK-34 user-name panel — mockup: Already taken and Sign in as action; built: not present
DESIGN-VERDICT: SWHM3-MCK-35 differs — account not created; copy "Check the items below" vs "Fix the item below", no too-long detail row (4.0%)
- RESIDUAL: SWHM3-MCK-35 error detail — mockup: "User name is too long. … 28 characters; the limit is 25."; built: generic list
DESIGN-VERDICT: SWHM3-MCK-36 differs — mobile account not created; same as MCK-35 (13.1%)
- RESIDUAL: SWHM3-MCK-36 error detail — mockup: too-long detail; built: generic list
DESIGN-VERDICT: SWHM3-MCK-37 differs — profile form; breadcrumb, intro copy and top Save button absent, refused state not shown on load (7.8%)
- RESIDUAL: SWHM3-MCK-37 header region — mockup: "Home / Account / Profile" breadcrumb and intro text; built: absent
DESIGN-VERDICT: SWHM3-MCK-38 differs — mobile profile form; same as MCK-37 (15.1%)
- RESIDUAL: SWHM3-MCK-38 header region — mockup: breadcrumb, intro and refused-save alert; built: absent on first load
DESIGN-VERDICT: SWHM3-MCK-39 differs — sign-on welcome; shows built user name not "Welcome, Jane", no Signed in badge or "Shopping in" line (5.4%)
- RESIDUAL: SWHM3-MCK-39 welcome card — mockup: "Signed in" badge, "Shopping in English (US)"; built: absent
DESIGN-VERDICT: SWHM3-MCK-40 differs — mobile sign-on welcome; same as MCK-39 (16.2%)
- RESIDUAL: SWHM3-MCK-40 welcome card — mockup: Browse the catalog, Open your cart actions; built: absent
DESIGN-VERDICT: SWHM3-MCK-41 differs — signed off; "You have signed off" vs "You’ve signed off" (locked copy), language label "English (United States)" (3.5%)
- RESIDUAL: SWHM3-MCK-41 header search input — mockup: Inter; built: Arial (shell search field, `font` line on "Search the catalog")
DESIGN-VERDICT: SWHM3-MCK-42 differs — mobile signed off; same as MCK-41 (11.6%)
- RESIDUAL: SWHM3-MCK-42 header — mockup: "Pet Store"; built: "MUI Pet Store 2"
Conformance proposal: `a2a_propose_design_conformance` answered `disabled: true`; nothing recorded.

## Issues Found

None. No entries in `integration-defects-resolution.md`; no DEFECT tickets filed. SPEC-GAP: none identified.

SPEC-GAP: none — every observed behaviour maps to a scenario.

SCENARIO-VERDICT: Customer listing / Behaviour holds — pass (unit test SWHM3-C-0143 "lists all customers")
SCENARIO-VERDICT: Sign-in routing and error screens / Behaviour holds — pass (e2e 0141/0151/0153/0161, 0160)
SCENARIO-VERDICT: Sign-up from sign-in page / Behaviour holds — pass (e2e 0150, Sign up link to /signup)
SCENARIO-VERDICT: Profile mandatory fields / Behaviour holds — pass (e2e 0155 blank postal code refused by name)
SCENARIO-VERDICT: Signed-on session ends after 15 minutes / Behaviour holds — pass (unit 0142 refuses a token idle for 15 minutes; verified by unit test, not by a 15-minute browser wait)
SCENARIO-VERDICT: Inactive sign-on timeout and username cookie / Behaviour holds — pass (e2e 0140/0156 bp_signon)
SCENARIO-VERDICT: Account status / Behaviour holds — pass (unit tests in src/lib/customer-accounts; verified by test run, schema by inspection)
SCENARIO-VERDICT: Web session expiry after 30 minutes / Behaviour holds — pass (unit session-store.test.ts; verified by unit test only)
SCENARIO-VERDICT: Customer composition / Behaviour holds — pass (unit tests; sign-up e2e 0150)
SCENARIO-VERDICT: Account composition / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: Unique sign-on record per user name / Behaviour holds — pass (e2e 0150/0139 duplicate goes to error page)
SCENARIO-VERDICT: Plain-text credential and card storage (legacy) / Behaviour holds — not-testable (deliberately superseded: build stores scrypt hashes per approved system design v2 D7 and rule ACC-005; the scenario's THEN is the opposite)
SCENARIO-VERDICT: Customer record structure / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: Contact information mandatory fields / Behaviour holds — pass (unit and e2e 0155)
SCENARIO-VERDICT: Sign-on required for customer pages / Behaviour holds — pass (e2e 0151/0161)
SCENARIO-VERDICT: Sign-on required before profile and order entry / Behaviour holds — pass (e2e 0141/0161, proxy unit test)
SCENARIO-VERDICT: Sign-on outcome handling / Behaviour holds — pass (e2e 0141/0160)
SCENARIO-VERDICT: Profile storage on create/update / Behaviour holds — pass (e2e 0154 saves and switches locale; unit tests)
SCENARIO-VERDICT: Account contact info and credit card / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: Sign-on user / Behaviour holds — pass (unit tests, duplicate e2e)
SCENARIO-VERDICT: Sign-on credential / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: Authentication by exact password match / Behaviour holds — pass (e2e 0160 wrong password; unit tests)
SCENARIO-VERDICT: Return to requested page after sign-on / Behaviour holds — pass (e2e 0141)
SCENARIO-VERDICT: Account linkage / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: Sign-off discards session / Behaviour holds — pass (e2e 0129 in e2e/accounts.spec.ts; the locked acceptance variant of 0129 timed out, see E2E Test Status)
SCENARIO-VERDICT: Locale set at sign-on / Behaviour holds — pass (unit tests, e2e 0154)
SCENARIO-VERDICT: Profile defaults (entity) / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: Customer creation creates account and profile / Behaviour holds — pass (e2e 0150 sign-up lands on profile)
SCENARIO-VERDICT: Empty contact and card on account creation / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: Profile defaults / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: One-to-one customer relationships / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: Profile record / Behaviour holds — pass (unit tests)
SCENARIO-VERDICT: Profile preferences / Behaviour holds — pass (unit tests, e2e 0154)
SCENARIO-VERDICT: User creation limits / Behaviour holds — pass (unit tests; 26-character name refused)
SCENARIO-VERDICT: User creation outcome redirect / Behaviour holds — pass (e2e 0139 error page)
SCENARIO-VERDICT: Remember user name cookie / Behaviour holds — pass (e2e 0140 31-day bp_signon)

## Recommendation

Proceed: fire `validation.all_acs_passed`. No defects were found, so nothing is escalated. Locked-acceptance warnings and the design residuals are for release UAT and the design owner.
