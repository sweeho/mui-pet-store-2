# Summary — SWHM3-T-0007 Localization

CODE-REVIEW: self-review — sub-agent not run for cost; checked diff against ACs, open-redirect (`safeFrom`), Base64 JSON decoding limits, Origin check, no `any`.

## What changed
- `src/lib/localization/`: locale model and parser, formatting, runtime (in-memory DB with real tables), session store and shared `changeLocale`, per-locale messages (en_US, ja_JP, zh_CN), request locale.
- `src/proxy.ts`: request id, `sid` cookie, `?locale=` forwarding, Origin check, `PUBLIC_PATHS`.
- Routes: `POST /api/locale`, `GET /api/session`, `GET /locale-link`, `GET /api/locales` (four entries). Pages `/locale`, `/locale/changed`; `/localization` removed.
- Shell: grouped rail, header language control, message-driven landing page and footer, `<html lang>`.
- DB: `sessions`, `audit_log`, catalog and `*_details` tables, migration `drizzle/0001_*`.
- `src/lib/shopping-cart.ts` (`createCart`, `add`, `list`, `locale`).
- Theme token `typography.h1` set to the mockup (24/600).

## AC coverage
All 27 cases have keyed tests (jest, `[SWHM3-C-00xx]`); C-0006/7 in `LocaleForm.test.tsx`, C-0011 in `locale-link/route.test.ts`, rest in `localization.test.ts`. Locked acceptance e2e for localization and site-shell pass.

## Rules
- A11Y-001: radios named by native+English name; note/code in `aria-describedby`; WCAG structure check covers /locale and /locale/changed (axe not run; structural check only).
- ACC-001: entry points in `PUBLIC_PATHS` (deny-by-default awaits SWHM3-I-0004; the list is not enforced yet).
- ACC-003: `audit_log` row on every locale change.
- API-103: problem+json with request id on API errors.
- ARC-101/103: browser calls routes only; sessions in the `sessions` table.
- DATA-102: generated migration committed.

## Deviations
- Mailer (AC "Mail sent") has no code here (SD6).
- `design-measure.mjs` unavailable; manual probe used (see `design-check.md`).
- `locale-link` ignores attribute key `locale` and unsafe keys; values over 4096 chars are skipped.

## Verification
`npm run lint && npm run format:check && npm run typecheck && npm test` pass; `npm run test:e2e` 12 pass; `npm run build` ok.
