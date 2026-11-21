---
ticket: SWHM3-T-0002
---
# TDD result

## Test cases
SWHM3-C-0163..C-0167, each with a jsdom/node test (landing, rail, shell, frames, locales route) and an e2e test in `e2e/home.spec.ts`; the locked `site-shell.spec.ts` is the oracle.

## Red run
Platform red run f2be0a6b-1c20-444f-bcc8-1b528f7849f7 (valid; stubs and assertion failures for all five cases).

## Green run
Recorded by the platform after the implementation commit (run id in the ticket comment).

## Notes
Recorded runs replace the TDD-RESULT marker for tickets with linked cases.
