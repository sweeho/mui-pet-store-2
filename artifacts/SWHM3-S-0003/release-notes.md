---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHM3-S-0003
capability brief: SWHM3-I-0003
branch: vortex/sprint/swhm3-s-0003-cf97ddf6
upstream: [artifacts/SWHM3-S-0003/qa-test-report.md]
---

# Release notes — SWHM3-S-0003

## Added

- **Catalog** in the navigation rail. It lists the categories, sorted A to Z. A category opens its
  products, a product its items, and an item its detail page with its picture, description,
  attributes, price, product and category. (SWHM3-T-0011)
- Breadcrumbs starting at Catalog on every catalog page below the category list. (SWHM3-T-0011)
- A search box in the header of every page, and a **Search** rail entry. An item matches when any
  word appears, in any case, in its product name, category code or description. (SWHM3-T-0011)
- Two entries per page, with a range ("Categories 1–2") and **Previous** / **Next**. A button that
  does not apply is greyed out. (SWHM3-T-0011)
- Catalog text and prices in US English, Japanese and Simplified Chinese, following the shopper's
  language. (SWHM3-T-0011)
- The following show the shared "nothing here" screen, never an error:
  - a blank search ("Enter a keyword to search");
  - a search with no matches;
  - paging past the end;
  - an unknown category, product or item, with a link back to Catalog. (SWHM3-T-0011)

## Changed

- Codes and prices are shown in a monospace face. (SWHM3-T-0011)
- The shared "nothing here" screen has a larger round icon and, on a phone, a full-width action
  button. (SWHM3-T-0011)

## Upgrade notes

- New migration `drizzle/0002_yielding_squadron_supreme.sql` (indexes only), applied automatically.
- An empty catalog is seeded with the sample catalog on first start.
- New dependency `@fontsource-variable/jetbrains-mono` (OFL-1.1); run `npm ci`.
- `/catalog` pages are public: no sign-in is needed to browse or search.

## Not included

- **Add to cart** on item detail: it arrives with the shopping cart.
- Search by translated category name. Only the category code matches.
- The overnight catalog check job. The check itself exists, but scheduling it belongs to batch
  operations.
- Known issue SWHM3-T-0013: a flaky developer test (`SQLITE_BUSY`). It does not affect shoppers.

## Verification

Verified at integration QA. See `artifacts/SWHM3-S-0003/qa-test-report.md`: PASS, with 19 of 21
scenarios passing, 2 not testable, and E2E 17/17.

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Release contents recorded | this file | `artifacts/SWHM3-S-0003/release-notes.md` | Satisfied | — |
| Release verified before land | QA PASS verdict | `artifacts/SWHM3-S-0003/qa-test-report.md` | Satisfied | — |
| Known limitations communicated | Not included section | this file | Satisfied | SWHM3-T-0013 open |
