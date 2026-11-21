# Architecture

## Topology

Approved system design, version 1:

| Element                                                | Kind            | Role                                                                                   |
| ------------------------------------------------------ | --------------- | -------------------------------------------------------------------------------------- |
| Users                                                  | person          | Shoppers, customers and administrators, in a browser                                   |
| Browser code (TypeScript, React, MUI, Modernize shell) | web app         | React client components inside the shell, styled by the one MUI theme                  |
| Node.js process (Next.js standalone `server.js`)       | api             | Renders pages on the server, answers `src/app/api` route handlers, runs `src/proxy.ts` |
| Drizzle ORM                                            | data access     | `src/db` (schema, `getDb()`), migrations in `drizzle/` applied at startup              |
| SQLite (libsql)                                        | database        | The project database, `sqlite.db` on a mounted volume                                  |
| Mail relay (SMTP over TLS)                             | external system | Delivers order-status e-mail and batch failure notices                                 |

Connections: Users → browser code → Node.js (pages and API) → Drizzle → SQLite; Node.js → mail
relay. All of them carry personal data. The browser never reaches the database directly: every
read and write goes through server code in `src/app`, which calls `src/lib`, which calls `src/db`.

## Stack

- **Runtime**: Node.js and npm, at the versions in `stack.versions.yaml`
- **Framework**: Next.js App Router: server-rendered pages and API route handlers in one app
- **UI**: React and MUI, with the Modernize Free admin shell in `src/shell/` and one theme built
  from `design/tokens.mui.json` (see DESIGN.md)
- **Database**: Drizzle ORM over SQLite (libsql, a file)
- **Tests**: Jest through `next/jest` (jsdom for components, node for routes and the database),
  Playwright end to end, Stryker for mutation testing
- **Packaging**: a Docker image of Next.js's standalone server, run as the non-root `node` user

## Data flow

A request for a page runs its server component, which reads through `src/lib/` and `getDb()` and
renders MUI components inside the shell. An API route (`src/app/api/**/route.ts`) does the same and
answers JSON. The browser calls the API with `withBasePath()`, so the app works under the staging
preview's path prefix (`NEXT_BASE_PATH`). A page that loads data from the browser renders its
loading, error and empty states through the shared state frames.

`getDb()` (`src/db/client.ts`) connects once per process, applies the migrations in `drizzle/` and
seeds two demo users and the sample catalog (en_US, ja_JP, zh_CN) when their tables are empty.

`src/proxy.ts` runs before every request. It issues the shopper session cookie on a first visit,
refuses a data-changing request whose `Origin` is foreign, and is the one sign-in gate: an entry point
not on its `PUBLIC_PATHS` list needs a signed-on customer. A signed-out page request gets the sign-in
screen and returns to the page after sign-on; an API request gets 401. Sign-on is Auth.js with a user
name and password; its session is an encrypted token cookie checked on the server on every request
(15 min idle, 8 h maximum, and a session version on the sign-on record that sign-off and a change of
rights increment), so no sign-on state is kept on the server. Every page and route takes the shopper's language from one server function in
`src/lib/localization/`: the `?locale=` parameter, else the session's locale, else en_US. Text falls
back to en_US when a locale has none. The root layout writes the result into `<html lang>`. Money,
numbers and search keywords are formatted and split by the same module, through the built-in `Intl`.

## Data model

Entity level. Columns and constraints are in `src/db/schema.ts`, and behaviour is in
`openspec/specs/`.

- **Session**: the anonymous shopper session, one row per browser, keyed by the `sid` cookie. It
  holds named attributes (the locale is the attribute `locale`; `userName` and `signedOn` while a
  customer is signed on) and the controller state. Nothing about a session is kept in process
  memory. Sign-off replaces it with one that keeps only the locale.
- **Customer**: keyed by user name, with exactly one **sign-on record** (password hash, session
  version), one **account** (status active or disabled, one contact record, one payment card) and
  one **profile** (preferred language, favourite category, my-list and banner switches).
- **Category → Product → Item**: the catalog keys. Each has a **details** entity with one row per
  (entity, locale) for its name, image and description. An item's details also carry the list
  price and unit cost for that locale, so prices are per locale, not converted. An item has no
  name of its own: it shows its product's name. Catalog reads go through `src/lib/catalog-browsing.ts`.
- **Audit record**: who, what and when for every data-changing action.
- **User**: the template's demo table, not used by the store.

## Deployment

One container: the `Dockerfile` builds the app with `output: "standalone"` and runs `server.js`
under Node as the `node` user on a base image pinned by digest. The SQLite file lives on a mounted
volume. `compose.yaml` runs it on :3000. Outbound mail goes to the SMTP relay over TLS. Vortex never
builds or runs the image: CI's `docker-build` job does.

## Key Decisions

- **D1. One shell.** Every page renders inside the same layout, header, navigation and footer.
  Chrome changes in one place and the accessibility behaviour is kept in one place.
  (change swhm3-i-0001-bootstrap-landing-page-and, design D1)
- **D2. One navigation.** Every primary area is one entry in `MENU_ITEMS`
  (`src/shell/SidebarItems.tsx`), and the landing page's links are generated from it. Users always
  have one place to find every area and a way home. (change swhm3-i-0001-bootstrap-landing-page-and, design D2)
- **D3. Shared states.** Empty, error and loading frames are shared components reused by every page
  and region, so users see the same wording and each fix is made once.
  (change swhm3-i-0001-bootstrap-landing-page-and, design D3)
- **D4. Existing boilerplate wins.** Extend the Next.js, MUI and Modernize scaffold rather than
  scaffold again, so the codebase is not split in two. (change swhm3-i-0001-bootstrap-landing-page-and, design D4)
- **D5. Sign-in only if the product has it.** The shell gains a sign-in frame once, when
  authentication ships, because a frame with nothing behind it misleads users.
  (change swhm3-i-0001-bootstrap-landing-page-and, design D5)
- **D6. One locale module.** Every capability reads the shopper's locale, parses locale codes and
  formats money, numbers and keywords through `src/lib/localization/`. Codes use the underscore form
  (`ja_JP`), and the BCP-47 tag is derived only for `Intl` and `<html lang>`. The legacy store had
  three parsers that drifted. (change swhm3-i-0002-localization, design P1)
- **D7. Sessions live in the database.** Session attributes, including the locale, are rows in the
  `sessions` table behind an httpOnly cookie, never process memory (ARC-103). Sign-on, cart and
  checkout extend the same session. (change swhm3-i-0002-localization, design P3)
- **D8. Text and prices per locale, with an en_US fallback.** User-facing text comes from per-locale
  message catalogs, and catalog text and prices from per-locale detail rows. A locale with no text
  shows en_US, and currency is the locale's own, never converted.
  (change swhm3-i-0002-localization, design P6, P10, P11)
- **D9. Client-supplied state is data, never code.** State carried in a link or form is decoded as
  JSON and validated. Objects are never deserialised from client input.
  (change swhm3-i-0002-localization, design P9)
- **D10. One catalog module; legacy mechanisms are not the request path.** Every read of categories,
  products and items, and every catalog search, goes through `src/lib/catalog-browsing.ts`, which
  returns pages of `{ items, hasNext, hasPrevious }` and `null` for an unknown id. Its front
  controller, screen resolver and fragment cache exist only to meet the legacy-derived acceptance
  contract; pages and later capabilities use App Router routing and never route through them.
  (change swhm3-i-0003-catalog-browsing-and-search, design P1, P10)
- **D11. Customer sign-on is Auth.js with a user name and password, and a stateless session.**
  Passwords are scrypt hashes on the sign-on record. The session is Auth.js's encrypted token
  cookie; the server ends one by incrementing the record's session version (sign-off, password
  change, account disabled). Later capabilities read the signed-on customer through the library's
  one server function, never the token. Amends system design D2 (draft v2, D7, awaiting approval).
  (change swhm3-i-0004-customer-accounts-and-sign, design P1, P2)
