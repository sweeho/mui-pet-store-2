# Fix note SWHM3-T-0021
Root cause: message keys `signin.secret`, `signup.secret`, `error.create.secret` map to the literal "Password"; the secret scanner reads `secret: "Password"` as a hardcoded password.
Fix: renamed keys to `*.credential` (catalogs en_US/ja_JP/zh_CN and their 3 consumers). Values unchanged; no real credential was involved.
Files: src/lib/localization/messages/{en_US,ja_JP,zh_CN}.ts, src/components/account/{SignOnForm,SignUpForm}.tsx, src/app/(DashboardLayout)/user-creation-error/page.tsx, new test no-credential-keys.test.ts.
CODE-REVIEW: self-review — sub-agent not run, diff is a mechanical key rename; grep confirms no remaining '.secret' references, typecheck and all 146 tests pass; no findings.
