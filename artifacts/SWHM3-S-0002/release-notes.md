---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHM3-S-0002
capability brief: SWHM3-I-0002
branch: vortex/sprint/swhm3-s-0002-1b2d57c5
upstream: [artifacts/SWHM3-S-0002/qa-test-report.md]
---

# Release notes — SWHM3-S-0002

## Added

- Shoppers can use the store in US English, 日本語 or 中文 (简体). A first visit is in US English.
  (SWHM3-T-0007)
- A language page, opened from the header's language control or **Language** in the rail's Account
  group. It lists four choices; German says "Not yet translated — shown in US English". (SWHM3-T-0007)
- A confirmation after a change, with a note showing how prices will look and a button back to the
  page the shopper came from, now in the new language. The choice lasts for the visit. (SWHM3-T-0007)
- An unreadable language code (for example "xx" or "en") is reported and changes nothing. (SWHM3-T-0007)
- A page address can name a language with `?locale=`; a language without text shows US English.
  (SWHM3-T-0007)
- Prices and numbers are written in the local style; search splits Japanese and Chinese phrases
  into words correctly; Japanese and Chinese typed into forms arrive intact. (SWHM3-T-0007)
- Per-language names, pictures and descriptions for categories, products and items (data model only;
  the catalog screens arrive with catalog browsing). (SWHM3-T-0007)

## Changed

- The navigation rail is grouped into Shop, Account and Admin. (SWHM3-T-0007)
- Page titles are 24px semibold (were 32px bold). (SWHM3-T-0007)
- The Localization area page is replaced by the language page at `/locale`. (SWHM3-T-0007)
- `GET /api/locales` lists four entries, including German. (SWHM3-T-0007)

## Upgrade notes

- New database migration `drizzle/0001_lyrical_gertrude_yorkes.sql` (sessions, audit log, catalog and per-locale detail tables),
  applied automatically at start-up.
- New endpoints: `POST /api/locale`, `GET /api/session`, `GET /locale-link`. Data-changing requests
  from another origin are refused. Every response carries a request id; API errors are problem+json.
- A `sid` session cookie is set on first visit.

## Not included

- Hiding the Admin group from non-administrators: needs sign-in and roles (customer accounts).
- German text: the PRD has not decided whether German is in scope.
- Localized e-mail: no mailer exists yet.
- The mockups' Catalog, Search, Cart, Profile and Sign in entries: each arrives with its own capability.

## Verification

Verified at integration QA — see `artifacts/SWHM3-S-0002/qa-test-report.md` (PASS, 27 of 28
scenarios pass, 1 not testable: no mailer).

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Release contents recorded | this file | `artifacts/SWHM3-S-0002/release-notes.md` | Satisfied | — |
| Release verified before land | QA PASS verdict | `artifacts/SWHM3-S-0002/qa-test-report.md` | Satisfied | — |
| Known limitations communicated | Not included section | this file | Satisfied | — |
