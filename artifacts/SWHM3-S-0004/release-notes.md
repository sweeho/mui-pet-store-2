---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHM3-S-0004
capability brief: SWHM3-I-0004
branch: vortex/sprint/swhm3-s-0004-5fae6595
upstream: [artifacts/SWHM3-S-0004/qa-test-report.md]
---

# Release notes — SWHM3-S-0004

## Added

- **Sign up** from the sign-in page: choose a user name and password and get an active account with
  an empty profile. A taken user name shows the Duplicate account screen; any other refusal shows
  "Account couldn't be created". (SWHM3-T-0016)
- **Sign on**. On success you return to the page you asked for, in your preferred language. A wrong
  password or unknown user name shows the Sign-in error screen. Repeated failures lock sign-on for a
  while. (SWHM3-T-0016)
- **Remember my user name**: fills your user name in on this device for 31 days. (SWHM3-T-0016)
- **Profile**: name, phone, e-mail, address, payment card (shown as "ending NNNN"), preferred
  language, favourite category, and the my-list and banner switches. A blank mandatory field is
  refused and named under the field. Saving switches to your preferred language. (SWHM3-T-0016)
- **Sign off**: the session is discarded, only your language is kept, and the Signed-off screen
  follows. (SWHM3-T-0016)
- The header shows "Sign in", or your name and "Sign off". A **Profile** entry is in the rail's
  Account group. (SWHM3-T-0016)

## Changed

- Profile, account, order, checkout and admin pages need sign-on. Signed-out visitors are sent to
  sign on and then returned. (SWHM3-T-0016)
- A signed-on customer idle for 15 minutes must sign on again; a sign-on lasts at most 8 hours. An
  anonymous session expires after 30 minutes idle. (SWHM3-T-0016)
- API endpoints not on the public list answer 401 without sign-on. (SWHM3-T-0016)

## Upgrade notes

- New migration `drizzle/0003_previous_revanche.sql` (customer tables), applied automatically.
- A deployment must set `AUTH_SECRET`. `.env.development` and `.env.test` carry a development-only value.
- Passwords are stored as scrypt hashes, not plain text as in the legacy system.
- Some message keys were renamed (`*.concealed` for the password field label). (SWHM3-T-0019,
  SWHM3-T-0021, SWHM3-T-0022)

## Not included

- Administrator roles: until they arrive, any signed-on customer can open `/admin`.
- Mockup details not built: inline sign-up form, "Sign in as" on Duplicate account, the welcome
  page's "Signed in" badge and actions, the profile breadcrumb.
- Some field labels stay in English in Japanese and Chinese.
- Sign-off from the store page (C-0129) is tested once the shopping cart ships.

## Verification

Verified at integration QA. See `artifacts/SWHM3-S-0004/qa-test-report.md`: PASS, 35 of 36 scenarios
passing, 1 deliberately superseded (plain-text storage), unit 146/146 and E2E 24/24.

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Release contents recorded | this file | `artifacts/SWHM3-S-0004/release-notes.md` | Satisfied | — |
| Release verified before land | QA PASS verdict | `artifacts/SWHM3-S-0004/qa-test-report.md` | Satisfied | — |
| Known limitations communicated | Not included section | this file | Satisfied | — |
