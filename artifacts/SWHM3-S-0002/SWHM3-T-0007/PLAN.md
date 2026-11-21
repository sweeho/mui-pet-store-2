# PLAN — SWHM3-T-0007 Localization

Change: `swhm3-i-0002-localization`. Read its `design.md` FIRST: the legacy notes, then
"Implementation decisions for this sprint" P1–P13 and "Spec discrepancies" SD1–SD10. Then read
`specs/localization/spec.md`, `tasks.md` and `test-cases.md`. The locked specs
`tests/acceptance/localization/localization.test.ts` and `tests/acceptance/localization/e2e/localization.spec.ts`
are the oracle, and their header comments are the interface contract. Never edit them. The
site-shell locked spec must stay green.

## Objective

The store has a language. A first visit is en_US. The shopper changes it from the header control or
the rail's Account → Language entry, on `/locale`, and sees `/locale/changed` with a currency note
and a way back. `?locale=` on any page wins, with en_US text when none exists. Currency, numbers and
keywords follow the locale. Catalog text is stored per locale. Typed CJK text arrives intact.

## Steps (in `tasks.md` order, phases in design.md "Phases")

1. **Locale model (1.1–1.3)**: `src/lib/localization/` per P1, P2. Re-point `src/lib/locales.ts`
   and `GET /api/locales` at it (four entries, underscore codes, SD9).
2. **Session (2.1–2.5)**: the `sessions` table and `src/proxy.ts` per P3 and P8 (cookie, Origin
   check, `PUBLIC_PATHS`). Routes `POST /api/locale`, `GET /api/session` and `GET /locale-link`
   (P8, P9). The runtime per P4. `getRequestLocale()` and `<html lang>` per P5.
3. **Screens (3.1–3.3)**: `/locale` (in the shell, choices via `ResourceView` on `/api/locales`,
   current one checked, button "Change language", radio names per SD2) and `/locale/changed`. The
   header language control, `MENU_ITEMS` groups, and message catalogs (P6, P7). Remove
   `/localization` and `LocalesList`. Error routing and the screen registry live in the runtime (SD5).
4. **Catalog and cart (4.1–4.4)**: the catalog tables and migration (P10), an `audit_log` table for
   the locale change (ACC-003), `src/lib/shopping-cart.ts` (P12) and `orderEmailLocale`.
5. **Encoding and formatting (5.1–5.4)**: `parseForm`, `formatNumber`, `formatCurrency` and
   `parseKeywords` (P11, P13). No mail code (SD6).
6. **Tests**: a unit test beside each new module, a node test beside each new route, and jsdom
   tests for the form, the header control and the grouped rail. Move `e2e/home.spec.ts` and
   `e2e/accessibility.spec.ts` from `/localization` to `/locale`. The WCAG 2.2 AA check covers
   `/locale` and `/locale/changed`.

## Design reference

The mockups are committed in `artifacts/SWHM3-S-0002/design/` (see `MANIFEST.md`). Render each
route beside its mockup:

| Mockup | Route and state | Viewport |
| --- | --- | --- |
| `mockup-locale-selection-form.html` | `/locale`, en_US current, nothing submitted | 1440 |
| `mockup-locale-selection-form-mobile.html` | `/locale`, rail folded behind the menu button | 390 |
| `mockup-locale-change-success-screen.html` | `/locale/changed?from=/` after choosing en_US | 1440 |
| `mockup-locale-change-success-screen-mobile.html` | `/locale/changed?from=/` | 390 |

Take colours, type and spacing from the mockups through the theme, never as literals in a
component. Leave out the rail's Catalog, Search, Cart and Profile entries and the header's Sign in
(SD10). The success screen's "Returning to" line shows the `from` page's title.

## File/module ownership

- `src/lib/localization/**` (new: model, parser, formatting, runtime, request locale, messages, tests)
- `src/lib/locales.ts`, `src/app/api/locales/route.ts` (+ test)
- `src/lib/shopping-cart.ts` (+ test, new)
- `src/proxy.ts` (new)
- `src/app/api/locale/route.ts`, `src/app/api/session/route.ts`, `src/app/locale-link/route.ts` (+ tests, new)
- `src/app/(DashboardLayout)/locale/**` (new); delete `src/app/(DashboardLayout)/localization/**`
- `src/app/layout.tsx`, `src/app/(DashboardLayout)/page.tsx`, `src/components/LandingView.tsx` (+ test, `data-screen` and messages)
- `src/shell/Header.tsx`, `src/shell/SidebarItems.tsx`, `src/shell/DashboardShell.tsx`, `src/shell/Footer.tsx` (+ their tests)
- `src/db/schema.ts`, `src/db/client.ts`, `src/db/prepare.ts`, `drizzle/**` (generated migration)
- `e2e/home.spec.ts`, `e2e/accessibility.spec.ts`

## Definition of Done

AC-1 to AC-28 on the ticket hold, one per scenario, shown by the locked localization specs passing
(AC-25, the mailer, by SD6). The locked site-shell specs stay green. Tasks 1.1–5.4 are complete. No
new runtime dependency is added, and the migration is committed.
