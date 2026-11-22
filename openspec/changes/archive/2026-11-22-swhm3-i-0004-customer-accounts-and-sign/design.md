# Legacy implementation notes: customer accounts

## User interface
No screen records were extracted for this capability; its user interface is unspecified. The sign-on, sign-up and profile pages exist in the legacy source but are not specified here.

## Legacy implementation

- Sign-on: a filter holds the protected-URL list from the sign-on configuration, remembers the requested URL, and redirects after authentication (see `legacy-source/app/src/components/signon`).
- User creation: CreateUserServlet calls the SignOn EJB createUser; the user name is the primary key so duplicates fail with CreateException and redirect to the user creation error page. The servlet writes the user name and password to standard output (legacy defect).
- Profile: CustomerHTMLAction.extractContactInfo accumulates missing address fields; the missing-list for language, favorite category and card fields is built and never used, so only address fields are effectively enforced.
- Session (legacy): the repository has two timeouts, 15 minutes (sign-on) and 30 minutes (web session), and which governs in production is unknown. The new build does not carry this ambiguity over; it uses the rules below.
- Session (new build, SEC-116, ARC-103): the session is a server-side record in a networked session store shared by every server instance (a shared cache, for example Redis), referenced by an opaque cookie. It is not kept in process memory, and not in the embedded SQLite file on the server's own disk, which ARC-103 does not count as a networked store. The session store is a new data store: it must be proposed and approved in the system design (a2a_submit_system_design) before it is built. Each record has a time-to-live equal to the maximum age, and every call to the store has a time limit (AVL-002). The server ends a session, and refuses the cookie afterwards, in these cases:
  - Idle time: 15 minutes without a request (the stricter of the two legacy values). Each authenticated request moves the idle deadline forward.
  - Maximum age: 8 hours from sign-in, whatever the activity. The user must sign in again.
  - Sign-out: the sign-out action deletes the server-side session record; clearing the cookie in the browser is not what ends it.
  - Change of rights: when the user's rights, role or password change, or the account is disabled, every session of that user is deleted from the session store right after the change commits. The account data and the session store are different stores, so this cannot be one transaction. To keep the guarantee if the deletion fails, each session record carries the user's credential version at sign-in, and each request compares it with the account's current version and refuses the session on a mismatch.
  - Idle time and maximum age are checked on the server on every request, and the cookie's own expiry is set to match but is never trusted.
- Data: sign-on, account, contact info, credit card and profile tables are linked one-to-one per customer. Passwords and card numbers are stored unhashed.
- Contradictions to settle: user name limit is 25 characters in user creation but 50 in the schema; user ID containing '%' or '*' is rejected in one pass but not in the requirement text above.

## Planning context (SWHM3-T-0015, sprint SWHM3-S-0004)

### Codebase findings

Measured on `vortex/sprint/swhm3-s-0004-5fae6595` after catalog browsing landed. The brief's
"Current State" (read at `c9d043e`) is stale.

- F1. No customer, sign-on, account, contact, card or profile tables. `src/db/schema.ts` has `users`
  (template demo, seeded with two rows), `sessions` (the anonymous shopper session: `id`,
  `attributes` JSON, `controller_state`, timestamps), `audit_log`, and the catalog tables.
- F2. `src/proxy.ts` sets a request id, the `sid` cookie, `x-session-id`, the `?locale=` header and
  an Origin check. `PUBLIC_PATHS` is declared but **not enforced** (comment: "deny-by-default arrives
  with sign-in (SWHM3-I-0004)").
- F3. `GET /api/session` (`src/app/api/session/route.ts`) returns `{ id, locale, attributes }` from
  `createSessionStore(db)` (`src/lib/localization/session-store.ts`). `src/lib/shopping-cart.ts`
  has `createCart({ catalog, locale })` with `cart.locale`; there is no stored cart and no `/store`.
- F4. No authentication dependency (`next-auth`, `zod`, `pino` are absent from `package.json`).
  `src/lib/problem.ts` has `problem()` (RFC 9457) and `safeFrom()` (same-origin return path).
- F5. The rail (`src/shell/SidebarItems.tsx`) has Home, Catalog, Search (shop), Language (account),
  Order administration (admin). There is **no** "Customer accounts and sign-on" entry and the header
  has no account slot, although the brief says one exists.
- F6. The locked unit suite fixes the module contract `@/lib/customer-accounts`
  (`newProfile`, `createAccountsRuntime` with `signons`, `contacts`, `accounts`, `profiles`,
  `customers`, `users`, `auth`, `sessions`, `clock`). The locked browser suite fixes the routes and
  copy: `/signin` ("User name", "Password", "Remember my user name", button "Sign on", link
  "Sign up"), `/signup` (button "Create account"), `/user-creation-error`, protected `/customer` and
  `/account/profile` showing the SIGN_IN_ERROR screen (heading "Sign-in failed") **with** the sign-on
  form, header button "Sign off", text "You have signed off", `POST /api/customers`, and
  `GET /api/session` returning `{ id, signedOn, userName, locale, cartCount, attributes }`.
- F7. The approved system design v1 decides sign-in through Auth.js with an **OIDC provider** and
  stores no passwords (its D2). That cannot meet F6.

### Decisions

- P1. **System design change first.** Draft v2 of the system design (submitted by this ticket) adds
  D7: customer sign-on with user name and password through Auth.js v5's Credentials provider,
  scrypt-hashed passwords on the sign-on record, and Auth.js's encrypted token cookie as the session,
  so no sign-on state is kept on the server. **The FEATURE builds sign-on only once draft v2 is
  approved**; until then it blocks (PLAN.md step 0).
- P2. **Session rules** (SEC-116, the stricter legacy value, and the decision this change's notes
  ask for): a signed-on session ends after **15 min idle** or **8 h from sign-in**; the anonymous
  shopper session ends after **30 min idle** (R-0202). Every request checks the token on the server:
  idle and age from timestamps in the token, plus a `session_version` that must equal the one on the
  sign-on record. Sign-off, a password change and disabling the account increment it. The cookie's
  own expiry matches but is never trusted. This replaces the "networked session store" of the notes
  above: the register refused an ARC-103 departure, and a stateless token keeps no session state on
  the server.
- P3. **Two sessions, one view.** The anonymous `sid` session (F1, F3) keeps the locale and later the
  cart. On sign-on the gate writes `userName` and `signedOn` into it and sets the session and cart
  locale from the profile (R-0073; a sign-on record without a customer raises nothing). Sign-off
  increments the version, clears the token, deletes the `sid` session and starts a new one holding
  only `locale` (R-0072), then shows "You have signed off". `GET /api/session` adds `signedOn`,
  `userName` and `cartCount` (0 until the cart capability).
- P4. **Data** (one migration, DATA-102; one transaction per new customer, DATA-108):
  `signon` (`user_name` PK ≤ 50, `password_hash`, `session_version`, `failed_attempts`,
  `locked_until`), `customer` (`user_name` PK/FK), `account` (status `active|disabled` NOT NULL),
  `contact_info` and `credit_card` (one each per account; created empty), `profile` (language
  default `en_US`, favourite category nullable, `my_list` and `banner` default true). Mandatory-field
  rules are enforced at save (R-0189, R-0195) so an empty contact can exist at creation (R-0076).
- P5. **Passwords** are scrypt hashes with a per-user salt, compared in constant time; an unknown
  user name fails exactly like a wrong password (R-0200 outcome). Never logged. Failed sign-ins are
  limited per account (counter and lock time) and per source (an in-process counter; SEC-118).
- P6. **Legacy plain text** (R-0187, locked case C-0147): only the in-memory store of the contract
  runtime keeps the raw value, because the locked test reads it back. Production stores only the
  hash. Reported on the register as NC-018 for a person to decide (task 3.6).
- P7. **Card number** is stored (checkout copies it) but shown only as "ending NNNN" (mockup). Masking
  or tokenising at rest stays an open question for the Business Owner (brief Q2, task 3.6).
- P8. **User names**: sign-up (`users.create`, `/signup`, `POST /api/customers`) refuses more than 25
  characters (R-0080); the record allows 50 (R-0004, R-0186). Any refused sign-up, including a taken
  name, goes to `/user-creation-error` (R-0081, locked C-0139); that page shows the "Duplicate
  account" content for a taken name and "Account couldn't be created" otherwise.
- P9. **Gate** (D3): `src/proxy.ts` becomes deny-by-default. Public: `/`, `/catalog/**`, `/locale/**`,
  `/locale-link`, `/signin`, `/signup`, `/user-creation-error`, `/signed-off`, `/api/locale(s)`,
  `/api/session`, `POST /api/customers`, `/api/auth/**`, static assets. A signed-out request for any
  other page renders the SIGN_IN_ERROR screen ("Sign-in failed") inside the shell with the sign-on
  form, remembering the requested path (validated by `safeFrom`); an API answers 401 problem+json.
  After sign-on the customer returns to that path (R-0201). A failed sign-on shows the same screen.
- P10. **Remember user name**: ticked → cookie `bp_signon` = user name, max age 2 678 400 s, not
  HttpOnly (the form reads it), SameSite Lax; unticked → the cookie is expired (R-0082, R-0196).
- P11. **Screens** in the shell: `/signin`, `/signup`, `/user-creation-error`, `/customer` (account
  overview), `/account/profile`, `/account/welcome` (sign-on welcome), `/signed-off`. The header gains
  the account slot ("Sign in" link signed off; the name and a "Sign off" button signed on). The rail's
  Account group gains **Profile** (`/account/profile`). Strings in the three message catalogs.
- P12. **Profile save** validates every mandatory field and names each missing one under its field
  and in a summary ("Postal code is required"); on success it stores contact, card and preferences,
  sets the session locale to the preferred language (R-0194) and shows "Profile saved".
- P13. **Customer listing** (R-0183) is `listCustomers({ page, pageSize ≤ 100 })` in the library
  only. No HTTP endpoint: administrator roles arrive with order administration (ACC-002).

### Phases

1. Gate: confirm system design v2 is approved (P1).
2. Data model (tasks 1.x): schema, migration, the contract runtime and `newProfile`.
3. Sign-on and sign-off (2.x): Auth.js config, password module, gate, timeouts, `bp_signon`, sign-off.
4. Customer management (3.x): sign-up, profile save, locale at sign-on, listing.
5. Screens, header account slot, rail entry, messages.
6. **Test harness**: Jest unit tests beside the modules keyed by case (`[SWHM3-C-0126]`…); component
   tests for the sign-on form, profile form and header slot; a Playwright spec in `e2e/` for sign-up,
   sign-on with return, remember-me, profile refusal and sign-off; the structural accessibility spec
   covers the new pages. The locked customer-accounts suites turn green except C-0129 (deferred, see
   SD5); the locked site-shell, localization and catalog suites stay green.
7. **CI**: the existing workflow runs on pull requests to `vortex/**`; no workflow change. CI and the
   E2E web server need an `AUTH_SECRET`: a fixed test value in the Playwright and Jest configuration,
   the real one from the environment (OPS-001).

### Spec discrepancies

Recorded, not edited into the delta spec:

- SD1. R-0187 (plain-text password and card) contradicts ACC-005 and the brief; locked C-0147 fixes it
  for the contract runtime only (P6, register NC-018).
- SD2. R-0200 says "exact string equality"; passwords are compared as hashes. The observable outcomes
  (wrong password and unknown user both fail) are kept.
- SD3. R-0182/R-0196 (15 min) and R-0202 (30 min) disagree. Resolved by P2: 15 min for a signed-on
  session, 30 min for the anonymous session (locked C-0142 and C-0162 both hold).
- SD4. User name 25 (R-0080) vs 50 (R-0004, R-0186): both kept (P8). The "%"/"*" rule mentioned above
  is not in any requirement and is not built.
- SD5. R-0072's case C-0129 needs `/store` and **Add to cart**, which the shopping-cart capability
  (SWHM3-I-0005) builds. C-0129 is deferred to that brief; sign-off itself is built and unit-tested here.
- SD6. R-0181 (signed-out protected page shows SIGN_IN_ERROR) vs R-0191/R-0192/R-0201 (show the
  sign-on form, then return). The locked browser contract joins them: the "Sign-in failed" screen
  carries the sign-on form (P9).
- SD7. R-0181 maps a duplicate account to a DUPLICATE_ACCOUNT screen; R-0081 and locked C-0139 send
  every refused creation to `/user-creation-error`. That page shows the duplicate-account content
  (P8).
- SD8. The mockups' copy differs from the locked tests in places ("Sign in" button, "Remember my
  user name on this device", "We couldn't sign you in", "You've signed off", sign-up on the same page).
  The locked copy is built: "Sign on", "Remember my user name", "Sign-in failed", "You have signed
  off", a "Sign up" link to `/signup`.
- SD9. The notes above require a networked session store proposed to the system design; the
  approved design instead names an OIDC provider. Both are replaced by draft v2 D7 (P1, P2).
- SD10. The brief says a "Customer accounts and sign-on" rail entry exists; it does not (F5).
- SD11. R-0194's scenario saves de_DE, which has no messages; the session locale becomes de_DE and the
  text falls back to en_US (localization behaviour).
