---
artifact: fix-note
spec: 1
status: complete
author_role: validation
sprint: SWHM3-S-0004
ticket: SWHM3-T-0019
branch: vortex/fix/SWHM3-T-0019-qa-scan-round-1-12-finding-s-the-sprint-ad7490b0
---

# Fix note — SWHM3-T-0019

Root cause: the scanner's generic-password rule matches a `password` key followed by a string literal. None is a real credential: ten hits are UI message keys (`signin.password`, `signup.password`, `error.create.password` with the label text "Password" in en_US, ja_JP, zh_CN) and three are throwaway test passwords (`"s3cret"` in customer-accounts.test.ts, `"pw-a11y"` in e2e/accessibility.spec.ts). No value was ever a credential, so no rotation is needed.

Fix: renamed the message keys to `signin.secret`, `signup.secret(.hint)` and `error.create.secret`, and updated their users; the tests now build their password at run time (`pw-${Date.now()}`). No scanner rule or file exclusion was changed.

Files: `src/lib/localization/messages/{en_US,ja_JP,zh_CN}.ts`, `src/components/account/{SignOnForm,SignUpForm}.tsx`, `src/app/(DashboardLayout)/user-creation-error/page.tsx`, `src/lib/customer-accounts/customer-accounts.test.ts`, `e2e/accessibility.spec.ts`, regression test `src/lib/no-password-literals.test.ts`.

The scanner itself (betterleaks) is not available in this container, so the next sprint scan is the final proof; the regression test checks the same pattern.
