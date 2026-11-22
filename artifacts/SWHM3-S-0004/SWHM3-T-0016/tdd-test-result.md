---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: SWHM3-S-0004
ticket: SWHM3-T-0016
---

# TDD result — SWHM3-T-0016

## Test cases
Cases SWHM3-C-0126 to C-0162 (36 linked). Each key is in the title of its tests: domain and session rules
`src/lib/customer-accounts/customer-accounts.test.ts` and `lock.test.ts`, gate `src/proxy.test.ts`, forms
`src/components/account/*.test.tsx`, anonymous idle `src/lib/localization/session-store.test.ts`, flows `e2e/accounts.spec.ts`.

## Runs
- Red: run a2989527-adb9-4794-8964-ef84996e44b4, valid, all 36 cases `stub_failure`.
- Green: run bc6674d4-2146-4592-a959-31bf9f20172a, valid, all 36 pass; locked acceptance run 2d99f25c-7bb3-47ce-9280-66b4a31c7a7a passed.

## Notes
- An earlier green (3d664faa) was unofficial because I had edited `playwright.config.ts`; reverted, since `.env.development` already supplies the test secret.
- The locked C-0129 browser case is not linked to this ticket and fails until SWHM3-I-0005 builds `/store`.
