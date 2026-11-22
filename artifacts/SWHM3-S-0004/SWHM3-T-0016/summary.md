---
artifact: ticket-summary
spec: 1
status: complete
author_role: implementation
sprint: SWHM3-S-0004
ticket: SWHM3-T-0016
branch: vortex/feat/SWHM3-T-0016-customer-accounts-and-sign-on-sign-up-si-d3c641c3
upstream: [artifacts/SWHM3-S-0004/SWHM3-T-0016/PLAN.md]
downstream: [artifacts/SWHM3-S-0004/qa-test-report.md]
---

# Summary — SWHM3-T-0016: Customer accounts and sign-on

## What changed
Sign-up, sign-on with return to the requested page, the `bp_signon` cookie, session limits, sign-off
(keeps only the locale), profile editing, the account slot in the header and a Profile rail entry. Auth.js v5
(Credentials, encrypted token cookie) and scrypt passwords, as approved system design v2 D7 (PLAN step 0 checked).

## Files
- `src/lib/customer-accounts/**`: domain (zod validation, `db.batch` writes, lock-out), scrypt password, session rules, token helpers, gate rules, contract runtime, tests.
- `src/db/schema.ts`, `drizzle/0003_*`: signon, customer, account, contact_info, credit_card, profile. `src/db/client.ts`: 5 s busy timeout.
- `src/auth.ts`, `src/app/api/auth/[...nextauth]`, `src/app/api/customers`, `src/app/api/session`.
- `src/proxy.ts`: token check, idle renewal, sign-in screen for protected pages, 401/405 for API.
- `src/components/account/**`, `src/app/(DashboardLayout)/{signin,signup,user-creation-error,customer,signed-off,account}`: screens and server actions.
- `src/shell/{Header,DashboardShell,SidebarItems}.tsx`, message catalogs, `src/lib/localization/session-store.ts` (30 min anonymous idle).
- `e2e/accounts.spec.ts`, `e2e/accessibility.spec.ts`, `stack.versions.yaml`, `.env.development`/`.env.test` (dev-only AUTH_SECRET), `AGENTS.md`.

## AC coverage
Each acceptance criterion maps to its case tests: domain and session rules in `src/lib/customer-accounts/*.test.ts`, gate in `src/proxy.test.ts`, forms in `src/components/account/*.test.tsx`, flows in `e2e/accounts.spec.ts`. The locked suites pass except C-0129 (below).

## Rules
A11Y-001/UX-101/UX-105: labelled MUI fields, role=alert/status, structural spec for the new pages. ACC-001: deny by default for `/api/**` and customer pages. ACC-003: audit rows for sign-up, profile save, sign-on, sign-off. ACC-005: scrypt, never logged. API-103: problem+json. API-104: list capped at 100. ARC-101/ARC-103: server-side data, stateless token. DATA-102: generated migration. DATA-108: `db.batch`. OBS-102: no logging added. SEC-101/103/104/114/116/118: Auth.js, HttpOnly Lax cookie, zod, Origin check, 15 min idle/8 h/version, lock-out and per-source limits.

## Verification
- `node .vortex/check-versions.mjs && npm run verify`: pass (lint, format, typecheck, 138 jest tests).
- `npm run test:e2e`: 24 passed. `npm run test:acceptance`: customer-accounts 26 passed. `npm run test:acceptance:e2e -- tests/acceptance/customer-accounts`: 10 passed, C-0129 fails (below).
- Design check: 14 mockups measured, `design-check.md`.
- CODE-REVIEW: sub-agent — fixed: concurrent failed sign-ons now counted in one SQL statement, Auth.js's POST endpoints refused (they skipped the limit and version), last X-Forwarded-For entry used, new `sid` at sign-on (fixation), user name trimmed at sign-on, secure cookie deletion; rejected: the proxy does not check the session version (it has no database use; pages and handlers use `customerFromCookies`, which does; a future API route must call it).

## Notes
- C-0129 needs `/store` and "Add to cart" from SWHM3-I-0005; sign-off itself is built and tested. Deferred as PLAN says.
- The legacy plain-text password (R-0187, NC-018) lives only in the contract runtime; production stores the hash. Left to a person (task 3.6); card number is stored, shown as "ending NNNN".
- Unknown page paths still render the 404 page signed out; protected pages are an explicit prefix list (`PROTECTED_PAGE_PREFIXES`), because the locked shell test expects a 404 inside the shell. `/api/hello` and `/api/users` stay public for the template smoke test.
- `/admin/**` now needs a sign-on (any customer) until administrator roles arrive.
- ja_JP and zh_CN keep some English field labels (the locked tests use English labels).
