# PLAN — SWHM3-T-0016 Customer accounts and sign-on

Change: `swhm3-i-0004-customer-accounts-and-sign`. Read its `design.md` first: "Planning context"
holds findings F1–F7, decisions P1–P13, phases and spec discrepancies SD1–SD11. This plan cites them.

## Objective

A visitor signs up, signs on (returning to the page they asked for), optionally has the store
remember their user name, edits their profile and signs off, inside the shared shell. The locked
suites in `tests/acceptance/customer-accounts/` pass unchanged, except C-0129, which is deferred to
the shopping-cart capability (SD5).

## Steps

0. **Gate (P1).** Read the system design (a2a_get_system_design). If the approved version does not
   carry D7 "Customer sign-on with user name and password through Auth.js, stateless sessions",
   transition this ticket to blocked and message planning. Do not build sign-on past the approved design.
1. **Data model** (tasks 1.1–1.5): P4. Add `next-auth` (v5) and `zod` through `stack.versions.yaml`.
2. **Sign-on and sign-off** (2.1–2.6): P2, P3, P5, P9, P10. Auth.js config in `src/auth.ts`; the gate
   in `src/proxy.ts`.
3. **Customer management** (3.1–3.6): P6, P7, P8, P12, P13. Task 3.6 is done by building P6/P7 and
   leaving NC-018 to a person; say so in the work log.
4. **Screens and shell**: P11, copy per SD8.
5. **Tests**: design.md phase 6. Put each case key in its test title.

## Fixed interface contracts

- `@/lib/customer-accounts` exactly as the header comment of
  `tests/acceptance/customer-accounts/customer-accounts.test.ts` states.
- Routes, labels and copy exactly as the header comment of
  `tests/acceptance/customer-accounts/e2e/customer-accounts.spec.ts` states.
- `GET /api/session` → `{ id, signedOn, userName, locale, cartCount, attributes }`; existing callers
  keep working.
- `POST /api/customers` `{ userName, password, language? }` → 201; refusal → problem+json.
- Session limits: 15 min idle and 8 h maximum while signed on; 30 min idle anonymous.
- Cookie `bp_signon`: user name, max age 2 678 400 s.
- Later capabilities read the signed-on customer through one server function (for example
  `getSignedOnCustomer()`) exported from the library; checkout and cart use it, never the token.

## File / module ownership

- `src/lib/customer-accounts/**` (new: domain, contract runtime, password, session rules, tests)
- `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts` (new)
- `src/db/schema.ts`, `src/db/prepare.ts`, `drizzle/0003_*` + `drizzle/meta/*` (generated)
- `src/proxy.ts`, `src/app/api/session/route.ts` (+test), `src/app/api/customers/route.ts` (new, +test)
- `src/app/(DashboardLayout)/{signin,signup,user-creation-error,customer,signed-off}/**`,
  `src/app/(DashboardLayout)/account/{profile,welcome}/**` (new)
- `src/components/account/**` (new: sign-on form, sign-in error, profile form, with tests)
- `src/shell/Header.tsx`, `src/shell/SidebarItems.tsx` and their tests
- `src/lib/localization/messages/{en_US,ja_JP,zh_CN}.ts`
- `package.json`, `package-lock.json`, `stack.versions.yaml`, `playwright.config.ts`, `jest.config.*`
  (test `AUTH_SECRET` only)
- `e2e/accounts.spec.ts` (new), `e2e/accessibility.spec.ts`

Never edited: anything under `tests/acceptance/` or `openspec/`.

## Design reference

Files in `artifacts/SWHM3-S-0004/design/`, listed with route, state and viewport in `MANIFEST.md`
(SWHM3-MCK-29 … SWHM3-MCK-42). Render each route beside its mockup at the same viewport. Expected
residuals: the copy changes of SD8 (locked tests win); sign-up on its own page rather than beside the
sign-on form; rail and header entries of later capabilities (Cart, Orders, Sales charts, Inventory).

## Definition of Done

AC-1 … AC-36 on the ticket, one per scenario. The case behind "Sign-off discards session" (C-0129)
is deferred to SWHM3-I-0005; its behaviour is still built and unit-tested. Also: the locked
customer-accounts suites pass except C-0129; the locked site-shell, localization and
catalog-browsing suites stay green; the generated migration is committed.
