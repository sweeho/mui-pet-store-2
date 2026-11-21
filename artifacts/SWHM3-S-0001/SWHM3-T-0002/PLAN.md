# PLAN — SWHM3-T-0002 Bootstrap, landing page and shared site shell

Change: `swhm3-i-0001-bootstrap-landing-page-and`. Read its `design.md` FIRST (D1–D5, then
"Implementation decisions" P1–P6 and "Spec discrepancies"), then `specs/site-shell/spec.md`,
`tasks.md` and `test-cases.md`. The locked spec `tests/acceptance/site-shell/e2e/site-shell.spec.ts`
is the oracle. Never edit it.

## Objective

Every page renders inside one shell (header, 240px navigation rail, footer) in the Design Reference
look. `/` is a landing page linking to every primary area. Empty, error (Try again) and loading
frames are shared components that the area pages use.

## Steps (in `tasks.md` order)

1. **Boilerplate (1.1, 1.2).** Keep the scaffold, build and test tooling. Swap the font package and
   tokens only (design.md P5). `e2e/smoke.spec.ts` keeps loading `/` with an h1 and no console errors.
2. **Landing page (2.1, 2.2).** `LandingView` replaces `HomeView`: an h1, a one-line description, and
   one card per primary area generated from `MENU_ITEMS`. The page drops `force-dynamic` and the
   `findUser` read. The only links inside `main` are the area links (P1).
3. **Site shell (3.1, 3.2).** `Footer` (a `<footer>` outside `main`), rendered by `DashboardShell`.
   `MENU_ITEMS` gains Localization `/localization` and Order administration `/admin/orders`, and the
   Home `/` entry stays inside the `<nav>`. The current item is highlighted by prefix match (P1).
   The rail is 240px with a theme scrollbar colour. A catch-all `[...missing]` page renders the 404
   inside the shell (P4).
4. **Shared frames (4.1–4.3).** `EmptyState`, `ErrorState` (`role="alert"`, a button named exactly
   "Try again", logs the error) and `LoadingState` (MUI Skeleton). `error.tsx` and `loading.tsx`
   reuse them. A client hook/component fetches with `withBasePath()` and picks
   loading / error / empty / data. `/localization` uses it against the new `GET /api/locales`
   (constant list in `src/lib/locales.ts`). `/admin/orders` renders `EmptyState` (P2, P3).
5. **Tests.** jsdom tests beside each new component; a node test beside `api/locales/route.ts`;
   `e2e/home.spec.ts` rewritten for the landing page and the rail (desktop and the 375px menu
   button); an automated WCAG 2.2 AA check of the landing page and each frame (A11Y-001).

## Design reference

Mockups are committed in `artifacts/SWHM3-S-0001/design/` (see `MANIFEST.md`). Render the route
beside each one:

| Mockup | Route and state | Viewport |
| --- | --- | --- |
| `mockup-landing-page.html` | `/` default | 1440 |
| `mockup-landing-page-mobile.html` | `/` default | 390 |
| `mockup-site-shell.html` | `/localization` loading (shell + LoadingState) | 1440 |
| `mockup-site-shell-mobile.html` | `/localization` loading, rail folded behind the menu button | 390 |
| `mockup-empty-state.html` | `/admin/orders` (EmptyState) | 1440 |
| `mockup-empty-state-mobile.html` | `/admin/orders` (EmptyState) | 390 |
| `mockup-error-state.html` | `/localization` with `/api/locales` failing (ErrorState) | 1440 |
| `mockup-error-state-mobile.html` | `/localization` with `/api/locales` failing | 390 |

Take colours, type, radius and spacing from the mockups. Leave out the extra rail entries, the
header sign-in and the language selector (P6, SD2).

## File/module ownership

- `design/tokens.mui.json`, `src/app/layout.tsx`, `package.json`, `package-lock.json`, `stack.versions.yaml` (only if the font must be declared there)
- `src/shell/Sidebar.tsx`, `src/shell/SidebarItems.tsx`, `src/shell/DashboardShell.tsx`, `src/shell/Header.tsx`, `src/shell/Footer.tsx` (new)
- `src/components/LandingView.tsx` (+ test, new); delete `src/components/HomeView.tsx` and its test
- `src/components/StateFrames/*` (new, + tests)
- `src/app/(DashboardLayout)/page.tsx`, `error.tsx`, `loading.tsx`, `[...missing]/page.tsx`, `localization/page.tsx`, `admin/orders/page.tsx` (new)
- `src/app/not-found.tsx`, `src/app/api/locales/route.ts` (+ `route.test.ts`, new), `src/lib/locales.ts` (new)
- `e2e/home.spec.ts`, `e2e/smoke.spec.ts`, any new `e2e/*.spec.ts` for accessibility

## Definition of Done

AC-1 to AC-5 on the ticket (one per scenario) hold, shown by the locked site-shell spec passing, and
the change's tasks 1.1–4.3 are complete. No colour is written in a component, and the Inter package's
licence is on the allowed list.
