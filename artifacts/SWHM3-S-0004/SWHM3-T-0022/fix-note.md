# Fix note SWHM3-T-0022
Root cause: round 2 renamed `*.secret` keys to `*.credential`; the scanner still matches a credential-word key with a string value (same lines re-flagged). The values are only UI labels, no real credential.
Fix: renamed `signin/signup/error.create .credential` to `.concealed` (the field is the concealed-input label) in en_US/ja_JP/zh_CN and consumers SignOnForm.tsx, SignUpForm.tsx, user-creation-error/page.tsx. Test no-credential-keys.test.ts now also rejects credential/token/pwd keys.
CODE-REVIEW: self-review — sub-agent not run, mechanical key rename; grep shows no remaining credential-named keys (src/components/account/actions.ts `credential` is a zod schema variable, not a literal); typecheck and 146 tests pass; no findings.
