---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHM3-S-0001
capability brief: SWHM3-I-0001
branch: vortex/sprint/swhm3-s-0001-b0a33f43
upstream: [artifacts/SWHM3-S-0001/qa-test-report.md]
---

# Release notes — SWHM3-S-0001

## Added

- A landing page at the root address says what the store is and links to every area. (SWHM3-T-0002)
- A left navigation rail on every page with Home, Localization and Order administration; the store
  name returns to the landing page and the current area is highlighted. On a phone it folds behind
  the menu button. (SWHM3-T-0002)
- A footer on every page, under the same header. (SWHM3-T-0002)
- Shared "nothing here yet", "couldn't load" (with **Try again**) and loading screens, used by every
  page. An unknown address now shows a "not found" page inside the site frame. (SWHM3-T-0002)
- A Localization page listing the supported locales, and an Order administration page (empty for
  now). (SWHM3-T-0002)

## Changed

- The store uses the Design Reference look: indigo brand colour, the Inter typeface, a 240px rail
  (was 270px) and squarer corners. (SWHM3-T-0002)
- The placeholder "hello world" home page is replaced by the landing page. (SWHM3-T-0002)

## Upgrade notes

- The Plus Jakarta font package is replaced by `@fontsource-variable/inter` (OFL-1.1); run `npm ci`.
- New read-only, public endpoint `GET /api/locales`. No database migration.

## Not included

- The mockups' sign-in button, language selector and Shop/Admin entries (Catalog, Search, Cart,
  Account, Sales charts, Inventory): each arrives with its own capability.
- The error screen's breadcrumb and request reference shown in the mockups.

## Verification

Verified at integration QA — see `artifacts/SWHM3-S-0001/qa-test-report.md` (PASS, 5/5 scenarios).

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Release contents recorded | this file | `artifacts/SWHM3-S-0001/release-notes.md` | Satisfied | — |
| Release verified before land | QA PASS verdict | `artifacts/SWHM3-S-0001/qa-test-report.md` | Satisfied | — |
| Known limitations communicated | Not included section | this file | Satisfied | — |
